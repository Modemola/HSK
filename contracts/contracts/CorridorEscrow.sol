// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {CorridorRegistry} from "./CorridorRegistry.sol";

/// @dev EIP-3009 subset implemented by USDC / USDC.e.
interface IERC3009 {
    function receiveWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}

/// @title CorridorEscrow
/// @notice Holds a sending operator's stablecoin until (1) a relayer anchors the hash of the
///         HSP receipt that the payout operator's verifier ACCEPTed, and (2) the payout operator
///         confirms fiat delivery. If the SLA deadline passes first, anyone can trigger a refund
///         to the sender; the mandate, quote and HSP receipt hashes stay attached to the record.
/// @dev    The transfer id is derived from all terms and doubles as the EIP-3009 nonce, so a
///         signed authorization cannot be replayed against different terms.
contract CorridorEscrow is ReentrancyGuard, Ownable2Step {
    using SafeERC20 for IERC20;

    enum Status {
        None,
        Locked,
        Released,
        Refunded
    }

    struct Transfer {
        address sender;
        address payout;
        uint256 amount;
        uint64 lockedAt;
        uint64 deadline;
        Status status;
        bytes32 mandateHash;
        bytes32 quoteHash;
        bytes32 hspReceiptHash;
        bytes32 payoutProofHash;
    }

    uint64 public constant MIN_SLA = 60;
    uint64 public constant MAX_SLA = 7 days;

    IERC20 public immutable token;
    CorridorRegistry public immutable registry;

    mapping(bytes32 => Transfer) private _transfers;
    mapping(address => bool) public isRelayer;

    event RelayerSet(address indexed relayer, bool allowed);
    event Locked(
        bytes32 indexed transferId,
        address indexed sender,
        address indexed payout,
        uint256 amount,
        uint64 deadline,
        bytes32 mandateHash,
        bytes32 quoteHash
    );
    event ReceiptAnchored(bytes32 indexed transferId, bytes32 hspReceiptHash);
    event Released(bytes32 indexed transferId, address indexed payout, uint256 amount, bytes32 payoutProofHash);
    event Refunded(bytes32 indexed transferId, address indexed sender, uint256 amount, bytes32 hspReceiptHash);

    error NotSender();
    error NotPayout();
    error NotRelayer();
    error BadAmount();
    error BadDeadline();
    error AlreadyExists();
    error NotLocked();
    error ReceiptMissing();
    error ReceiptAlreadyAnchored();
    error ZeroHash();
    error Expired();
    error NotExpired();

    constructor(IERC20 token_, CorridorRegistry registry_, address initialOwner) Ownable(initialOwner) {
        token = token_;
        registry = registry_;
    }

    function setRelayer(address relayer, bool allowed) external onlyOwner {
        isRelayer[relayer] = allowed;
        emit RelayerSet(relayer, allowed);
    }

    function computeTransferId(
        address sender,
        address payout,
        uint256 amount,
        uint64 deadline,
        bytes32 mandateHash,
        bytes32 quoteHash
    ) public view returns (bytes32) {
        return keccak256(
            abi.encode(block.chainid, address(this), sender, payout, amount, deadline, mandateHash, quoteHash)
        );
    }

    /// @notice Lock funds using a prior ERC-20 approval. Caller must be an active sending operator.
    function lock(address payout, uint256 amount, uint64 deadline, bytes32 mandateHash, bytes32 quoteHash)
        external
        nonReentrant
        returns (bytes32 transferId)
    {
        transferId = _open(msg.sender, payout, amount, deadline, mandateHash, quoteHash);
        token.safeTransferFrom(msg.sender, address(this), amount);
    }

    /// @notice Lock funds with an EIP-3009 `receiveWithAuthorization` signed by the sending operator.
    ///         Anyone (e.g. the operator's agent or a gas relayer) may submit it; the signature's
    ///         nonce must equal the transfer id, which binds every term.
    function lockWithAuthorization(
        address sender,
        address payout,
        uint256 amount,
        uint64 deadline,
        bytes32 mandateHash,
        bytes32 quoteHash,
        uint256 validAfter,
        uint256 validBefore,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant returns (bytes32 transferId) {
        transferId = _open(sender, payout, amount, deadline, mandateHash, quoteHash);
        uint256 balanceBefore = token.balanceOf(address(this));
        IERC3009(address(token)).receiveWithAuthorization(
            sender, address(this), amount, validAfter, validBefore, transferId, v, r, s
        );
        if (token.balanceOf(address(this)) - balanceBefore != amount) revert BadAmount();
    }

    /// @notice Relayer records the hash of the HSP receipt that the payout operator's verifier ACCEPTed.
    function anchorReceipt(bytes32 transferId, bytes32 hspReceiptHash) external {
        if (!isRelayer[msg.sender]) revert NotRelayer();
        if (hspReceiptHash == bytes32(0)) revert ZeroHash();
        Transfer storage t = _transfers[transferId];
        if (t.status != Status.Locked) revert NotLocked();
        if (t.hspReceiptHash != bytes32(0)) revert ReceiptAlreadyAnchored();
        t.hspReceiptHash = hspReceiptHash;
        emit ReceiptAnchored(transferId, hspReceiptHash);
    }

    /// @notice Payout operator confirms fiat delivery and claims the locked stablecoin.
    function confirmPayout(bytes32 transferId, bytes32 payoutProofHash) external nonReentrant {
        Transfer storage t = _transfers[transferId];
        if (t.status != Status.Locked) revert NotLocked();
        if (msg.sender != t.payout) revert NotPayout();
        if (t.hspReceiptHash == bytes32(0)) revert ReceiptMissing();
        if (payoutProofHash == bytes32(0)) revert ZeroHash();
        if (block.timestamp > t.deadline) revert Expired();
        t.status = Status.Released;
        t.payoutProofHash = payoutProofHash;
        registry.recordOutcome(t.payout, t.amount, true);
        token.safeTransfer(t.payout, t.amount);
        emit Released(transferId, t.payout, t.amount, payoutProofHash);
    }

    /// @notice After the SLA deadline anyone can return the funds to the sender.
    function refund(bytes32 transferId) external nonReentrant {
        Transfer storage t = _transfers[transferId];
        if (t.status != Status.Locked) revert NotLocked();
        if (block.timestamp <= t.deadline) revert NotExpired();
        t.status = Status.Refunded;
        registry.recordOutcome(t.payout, t.amount, false);
        token.safeTransfer(t.sender, t.amount);
        emit Refunded(transferId, t.sender, t.amount, t.hspReceiptHash);
    }

    function getTransfer(bytes32 transferId) external view returns (Transfer memory) {
        return _transfers[transferId];
    }

    function _open(
        address sender,
        address payout,
        uint256 amount,
        uint64 deadline,
        bytes32 mandateHash,
        bytes32 quoteHash
    ) private returns (bytes32 transferId) {
        if (!registry.isActive(sender, CorridorRegistry.Role.Sender)) revert NotSender();
        if (!registry.isActive(payout, CorridorRegistry.Role.Payout)) revert NotPayout();
        if (amount == 0) revert BadAmount();
        if (mandateHash == bytes32(0) || quoteHash == bytes32(0)) revert ZeroHash();
        if (deadline < block.timestamp + MIN_SLA || deadline > block.timestamp + MAX_SLA) revert BadDeadline();
        transferId = computeTransferId(sender, payout, amount, deadline, mandateHash, quoteHash);
        if (_transfers[transferId].status != Status.None) revert AlreadyExists();
        _transfers[transferId] = Transfer({
            sender: sender,
            payout: payout,
            amount: amount,
            lockedAt: uint64(block.timestamp),
            deadline: deadline,
            status: Status.Locked,
            mandateHash: mandateHash,
            quoteHash: quoteHash,
            hspReceiptHash: bytes32(0),
            payoutProofHash: bytes32(0)
        });
        emit Locked(transferId, sender, payout, amount, deadline, mandateHash, quoteHash);
    }
}
