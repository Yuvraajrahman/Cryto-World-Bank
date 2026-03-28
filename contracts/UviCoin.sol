// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UviCoin
 * @dev Personal ERC-20 token for the Crypto World Bank project
 */
contract UviCoin is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 1 million UVI
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**18;
    mapping(address => bool) public hasClaimedFaucet;

    constructor() ERC20("UviCoin", "UVI") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Mint new tokens (owner only)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Faucet: Claim 1000 UVI once per address (for testnet)
     */
    function faucet() external {
        require(!hasClaimedFaucet[msg.sender], "Already claimed");
        hasClaimedFaucet[msg.sender] = true;
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
