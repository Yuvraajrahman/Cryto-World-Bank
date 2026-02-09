// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WorldBankReserve.sol";

/**
 * @title NationalBank
 * @dev National Bank contract that borrows from World Bank and lends to Local Banks
 */
contract NationalBank is ReentrancyGuard, Ownable {
    WorldBankReserve public worldBank;
    uint256 public totalBorrowedFromWorldBank;
    uint256 public totalLentToLocalBanks;
    
    struct LocalBankInfo {
        address localBankAddress;
        string name;
        string city;
        bool isActive;
        uint256 totalBorrowed;
    }
    
    mapping(address => LocalBankInfo) public localBanks;
    address[] public localBankAddresses;
    
    event LocalBankRegistered(address indexed localBank, string name, string city);
    event BorrowedFromWorldBank(address indexed nationalBank, uint256 amount);
    event LentToLocalBank(address indexed localBank, uint256 amount);
    
    modifier onlyLocalBank() {
        require(localBanks[msg.sender].isActive, "Not an authorized local bank");
        _;
    }
    
    constructor(address _worldBankAddress) Ownable(msg.sender) {
        require(_worldBankAddress != address(0), "Invalid World Bank address");
        worldBank = WorldBankReserve(_worldBankAddress);
    }
    
    /**
     * @dev Register a local bank
     */
    function registerLocalBank(
        address _localBankAddress,
        string memory _name,
        string memory _city
    ) external onlyOwner {
        require(_localBankAddress != address(0), "Invalid local bank address");
        require(!localBanks[_localBankAddress].isActive, "Local bank already registered");
        
        localBanks[_localBankAddress] = LocalBankInfo({
            localBankAddress: _localBankAddress,
            name: _name,
            city: _city,
            isActive: true,
            totalBorrowed: 0
        });
        
        localBankAddresses.push(_localBankAddress);
        emit LocalBankRegistered(_localBankAddress, _name, _city);
    }
    
    /**
     * @dev Borrow from World Bank (requires World Bank approval)
     */
    function borrowFromWorldBank(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        
        // In a real implementation, this would require World Bank approval
        // For now, we'll assume the World Bank has a function to lend to National Banks
        totalBorrowedFromWorldBank += _amount;
        
        emit BorrowedFromWorldBank(msg.sender, _amount);
    }
    
    /**
     * @dev Lend to a local bank
     */
    function lendToLocalBank(address _localBankAddress, uint256 _amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(localBanks[_localBankAddress].isActive, "Local bank not registered");
        require(_amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= _amount, "Insufficient balance");
        
        localBanks[_localBankAddress].totalBorrowed += _amount;
        totalLentToLocalBanks += _amount;
        
        (bool success, ) = payable(_localBankAddress).call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit LentToLocalBank(_localBankAddress, _amount);
    }
    
    /**
     * @dev Get local bank count
     */
    function getLocalBankCount() external view returns (uint256) {
        return localBankAddresses.length;
    }
    
    /**
     * @dev Get all local bank addresses
     */
    function getAllLocalBanks() external view returns (address[] memory) {
        return localBankAddresses;
    }
    
    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}

