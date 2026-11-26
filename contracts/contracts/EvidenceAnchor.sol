// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

/// @title EvidenceAnchor
/// @notice Append-only log of compliance evidence-pack hashes (mandate, quote, HSP receipt,
///         attestation digests, Travel-Rule packet, FX-report record). The packs themselves
///         stay off-chain with the operator; an auditor re-hashes a pack and checks it here.
///         Blocked transfers (e.g. structuring attempts) are anchored too, so refusals are
///         as auditable as settlements.
contract EvidenceAnchor is Ownable2Step {
    enum Kind {
        Settlement,
        Refund,
        Blocked
    }

    struct Record {
        bytes32 packHash;
        Kind kind;
        uint64 timestamp;
        address anchorer;
    }

    mapping(address => bool) public isAnchorer;
    mapping(bytes32 => Record[]) private _records;
    mapping(bytes32 => bool) public isAnchored; // packHash => anchored
    uint256 public totalRecords;

    event AnchorerSet(address indexed anchorer, bool allowed);
    event EvidenceAnchored(
        bytes32 indexed subjectId, bytes32 indexed packHash, Kind kind, string uri, address indexed anchorer
    );

    error NotAnchorer();
    error ZeroHash();
    error DuplicatePack();

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setAnchorer(address anchorer, bool allowed) external onlyOwner {
        isAnchorer[anchorer] = allowed;
        emit AnchorerSet(anchorer, allowed);
    }

    /// @param subjectId Escrow transfer id, or a case id for blocked requests.
    /// @param packHash  keccak256 of the canonical JSON evidence pack.
    /// @param uri       Optional pointer to where an authorised auditor can fetch the pack.
    function anchor(bytes32 subjectId, bytes32 packHash, Kind kind, string calldata uri) external {
        if (!isAnchorer[msg.sender]) revert NotAnchorer();
        if (subjectId == bytes32(0) || packHash == bytes32(0)) revert ZeroHash();
        if (isAnchored[packHash]) revert DuplicatePack();
        isAnchored[packHash] = true;
        _records[subjectId].push(
            Record({packHash: packHash, kind: kind, timestamp: uint64(block.timestamp), anchorer: msg.sender})
        );
        totalRecords += 1;
        emit EvidenceAnchored(subjectId, packHash, kind, uri, msg.sender);
    }

    function recordsOf(bytes32 subjectId) external view returns (Record[] memory) {
        return _records[subjectId];
    }
}
