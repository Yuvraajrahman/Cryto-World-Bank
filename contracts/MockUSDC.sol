// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice Mintable testnet stablecoin (6 decimals) for Phase I–II lending demos.
 *         Replaces mainnet USDC on Sepolia/Amoy per thesis design-limitations path.
 */
contract MockUSDC is ERC20 {
    address public minter;

    event MinterUpdated(address indexed previousMinter, address indexed newMinter);

    constructor(address initialMinter) ERC20("Mock USDC", "mUSDC") {
        require(initialMinter != address(0), "zero minter");
        minter = initialMinter;
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function setMinter(address newMinter) external {
        require(msg.sender == minter, "not minter");
        require(newMinter != address(0), "zero minter");
        address prev = minter;
        minter = newMinter;
        emit MinterUpdated(prev, newMinter);
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "not minter");
        _mint(to, amount);
    }
}
