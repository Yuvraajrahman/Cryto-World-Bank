// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title GovernorMultisig2of3
 * @notice Minimal 2-of-3 multisig for World Bank governor actions (DT-I.18 / MVT #15).
 * @dev Localhost demos keep the deployer EOA as governor too; production uses multisig only.
 */
contract GovernorMultisig2of3 {
    address[3] public owners;
    uint256 public nonce;

    mapping(bytes32 => mapping(address => bool)) public confirmed;

    event OperationConfirmed(bytes32 indexed opId, address indexed owner);
    event OperationExecuted(bytes32 indexed opId, address indexed target, uint256 nonce);

    constructor(address owner0, address owner1, address owner2) {
        require(owner0 != address(0) && owner1 != address(0) && owner2 != address(0), "zero owner");
        owners[0] = owner0;
        owners[1] = owner1;
        owners[2] = owner2;
    }

    function isOwner(address account) public view returns (bool) {
        return account == owners[0] || account == owners[1] || account == owners[2];
    }

    function operationId(address target, bytes calldata data) public pure returns (bytes32) {
        return keccak256(abi.encode(target, data));
    }

    function confirm(bytes32 opId) external {
        require(isOwner(msg.sender), "not owner");
        confirmed[opId][msg.sender] = true;
        emit OperationConfirmed(opId, msg.sender);
    }

    function confirmationCount(bytes32 opId) public view returns (uint8 count) {
        for (uint256 i = 0; i < 3; i++) {
            if (confirmed[opId][owners[i]]) count++;
        }
    }

    function execute(address target, bytes calldata data, bytes32 opId) external {
        require(isOwner(msg.sender), "not owner");
        require(confirmationCount(opId) >= 2, "need 2 confirmations");
        (bool ok, ) = target.call(data);
        require(ok, "call failed");
        nonce++;
        emit OperationExecuted(opId, target, nonce);
    }
}
