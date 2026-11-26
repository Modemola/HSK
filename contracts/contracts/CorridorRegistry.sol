// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

/// @title CorridorRegistry
/// @notice Allowlist of licensed corridor operators (sending remitters and payout partners)
///         and their on-chain settlement track record. Only operators registered here can
///         lock or receive funds in CorridorEscrow.
contract CorridorRegistry is Ownable2Step {
    enum Role {
        None,
        Sender,
        Payout
    }

    struct Operator {
        Role role;
        bool active;
        uint64 settledCount;
        uint64 refundedCount;
        uint128 settledVolume;
        bytes32 licenseRef; // hash of the operator's licence / registration identifier
        string name;
        string corridor; // e.g. "KR->HK"
    }

    mapping(address => Operator) private _operators;
    address[] private _operatorList;
    address public escrow;

    event OperatorRegistered(address indexed operator, Role role, string name, string corridor, bytes32 licenseRef);
    event OperatorStatusChanged(address indexed operator, bool active);
    event EscrowSet(address indexed escrow);
    event OutcomeRecorded(address indexed operator, uint256 amount, bool settled);

    error InvalidOperator();
    error InvalidRole();
    error AlreadyRegistered();
    error NotRegistered();
    error EscrowAlreadySet();
    error OnlyEscrow();

    constructor(address initialOwner) Ownable(initialOwner) {}

    function registerOperator(
        address operator,
        Role role,
        string calldata name,
        string calldata corridor,
        bytes32 licenseRef
    ) external onlyOwner {
        if (operator == address(0)) revert InvalidOperator();
        if (role == Role.None) revert InvalidRole();
        if (_operators[operator].role != Role.None) revert AlreadyRegistered();
        _operators[operator] = Operator({
            role: role,
            active: true,
            settledCount: 0,
            refundedCount: 0,
            settledVolume: 0,
            licenseRef: licenseRef,
            name: name,
            corridor: corridor
        });
        _operatorList.push(operator);
        emit OperatorRegistered(operator, role, name, corridor, licenseRef);
    }

    function setActive(address operator, bool active) external onlyOwner {
        if (_operators[operator].role == Role.None) revert NotRegistered();
        _operators[operator].active = active;
        emit OperatorStatusChanged(operator, active);
    }

    /// @notice One-time binding of the escrow allowed to write settlement outcomes.
    function setEscrow(address escrow_) external onlyOwner {
        if (escrow != address(0)) revert EscrowAlreadySet();
        if (escrow_ == address(0)) revert InvalidOperator();
        escrow = escrow_;
        emit EscrowSet(escrow_);
    }

    function recordOutcome(address operator, uint256 amount, bool settled) external {
        if (msg.sender != escrow) revert OnlyEscrow();
        Operator storage op = _operators[operator];
        if (settled) {
            op.settledCount += 1;
            op.settledVolume += uint128(amount);
        } else {
            op.refundedCount += 1;
        }
        emit OutcomeRecorded(operator, amount, settled);
    }

    function isActive(address operator, Role role) external view returns (bool) {
        Operator storage op = _operators[operator];
        return op.active && op.role == role;
    }

    function getOperator(address operator) external view returns (Operator memory) {
        return _operators[operator];
    }

    function operatorCount() external view returns (uint256) {
        return _operatorList.length;
    }

    function operatorAt(uint256 index) external view returns (address) {
        return _operatorList[index];
    }
}
