// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WorldBankReserve
 * @dev Decentralized reserve and lending system - World Bank inspired prototype
 */
contract WorldBankReserve is ReentrancyGuard, Ownable {
    uint256 public totalReserve;
    uint256 public loanCounter;
    bool public paused;
    
    // National Bank management
    struct NationalBankInfo {
        address nationalBankAddress;
        string name;
        string country;
        bool isActive;
        uint256 totalBorrowed;
    }
    
    mapping(address => NationalBankInfo) public nationalBanks;
    address[] public nationalBankAddresses;

    enum LoanStatus {
        Pending,
        Approved,
        Rejected,
        Paid
    }

    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;
        string purpose;
        LoanStatus status;
        uint256 requestedAt;
        uint256 approvedAt;
    }

    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    mapping(address => uint256) public userDeposits;

    event ReserveDeposited(
        address indexed depositor,
        uint256 amount,
        uint256 timestamp
    );

    event LoanRequested(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        string purpose
    );

    event LoanApproved(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount
    );

    event LoanRejected(
        uint256 indexed loanId,
        address indexed borrower
    );
    
    event NationalBankRegistered(address indexed nationalBank, string name, string country);
    event LentToNationalBank(address indexed nationalBank, uint256 amount);

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor() Ownable(msg.sender) {
        loanCounter = 0;
    }
    
    /**
     * @dev Register a national bank
     */
    function registerNationalBank(
        address _nationalBankAddress,
        string memory _name,
        string memory _country
    ) external onlyOwner {
        require(_nationalBankAddress != address(0), "Invalid national bank address");
        require(!nationalBanks[_nationalBankAddress].isActive, "National bank already registered");
        
        nationalBanks[_nationalBankAddress] = NationalBankInfo({
            nationalBankAddress: _nationalBankAddress,
            name: _name,
            country: _country,
            isActive: true,
            totalBorrowed: 0
        });
        
        nationalBankAddresses.push(_nationalBankAddress);
        emit NationalBankRegistered(_nationalBankAddress, _name, _country);
    }
    
    /**
     * @dev Lend to a national bank
     */
    function lendToNationalBank(address _nationalBankAddress, uint256 _amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(nationalBanks[_nationalBankAddress].isActive, "National bank not registered");
        require(_amount > 0, "Amount must be greater than 0");
        require(totalReserve >= _amount, "Insufficient reserve balance");
        
        nationalBanks[_nationalBankAddress].totalBorrowed += _amount;
        totalReserve -= _amount;
        
        (bool success, ) = payable(_nationalBankAddress).call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit LentToNationalBank(_nationalBankAddress, _amount);
    }
    
    /**
     * @dev Get national bank count
     */
    function getNationalBankCount() external view returns (uint256) {
        return nationalBankAddresses.length;
    }
    
    /**
     * @dev Get all national bank addresses
     */
    function getAllNationalBanks() external view returns (address[] memory) {
        return nationalBankAddresses;
    }

    /**
     * @dev Deposit funds to the reserve
     */
    function depositToReserve() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Deposit amount must be greater than 0");

        totalReserve += msg.value;
        userDeposits[msg.sender] += msg.value;

        emit ReserveDeposited(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Get total reserve balance
     */
    function getTotalReserve() external view returns (uint256) {
        return totalReserve;
    }

    /**
     * @dev Get user's total deposits
     */
    function getUserDeposits(address user) external view returns (uint256) {
        return userDeposits[user];
    }

    /**
     * @dev Request a loan from the reserve
     */
    function requestLoan(
        uint256 amount,
        string memory purpose
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "Loan amount must be greater than 0");
        require(bytes(purpose).length > 0, "Purpose cannot be empty");
        require(amount <= totalReserve, "Insufficient reserve balance");

        loanCounter++;

        loans[loanCounter] = Loan({
            id: loanCounter,
            borrower: msg.sender,
            amount: amount,
            purpose: purpose,
            status: LoanStatus.Pending,
            requestedAt: block.timestamp,
            approvedAt: 0
        });

        userLoans[msg.sender].push(loanCounter);

        emit LoanRequested(loanCounter, msg.sender, amount, purpose);
    }

    /**
     * @dev Get loan details
     */
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        require(loanId > 0 && loanId <= loanCounter, "Invalid loan ID");
        return loans[loanId];
    }

    /**
     * @dev Get all loan IDs for a user
     */
    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }

    /**
     * @dev Approve a loan and transfer funds (admin only)
     */
    function approveLoan(uint256 loanId) external onlyOwner nonReentrant whenNotPaused {
        require(loanId > 0 && loanId <= loanCounter, "Invalid loan ID");
        Loan storage loan = loans[loanId];

        require(loan.status == LoanStatus.Pending, "Loan is not pending");
        require(loan.amount <= address(this).balance, "Insufficient contract balance");

        loan.status = LoanStatus.Approved;
        loan.approvedAt = block.timestamp;

        totalReserve -= loan.amount;

        (bool success, ) = payable(loan.borrower).call{value: loan.amount}("");
        require(success, "Transfer failed");

        emit LoanApproved(loanId, loan.borrower, loan.amount);
    }

    /**
     * @dev Reject a loan (admin only)
     */
    function rejectLoan(uint256 loanId) external onlyOwner {
        require(loanId > 0 && loanId <= loanCounter, "Invalid loan ID");
        Loan storage loan = loans[loanId];

        require(loan.status == LoanStatus.Pending, "Loan is not pending");

        loan.status = LoanStatus.Rejected;

        emit LoanRejected(loanId, loan.borrower);
    }

    /**
     * @dev Get all pending loans (admin only)
     */
    function getPendingLoans() external view onlyOwner returns (Loan[] memory) {
        uint256 pendingCount = 0;

        for (uint256 i = 1; i <= loanCounter; i++) {
            if (loans[i].status == LoanStatus.Pending) {
                pendingCount++;
            }
        }

        Loan[] memory pendingLoans = new Loan[](pendingCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= loanCounter; i++) {
            if (loans[i].status == LoanStatus.Pending) {
                pendingLoans[index] = loans[i];
                index++;
            }
        }

        return pendingLoans;
    }

    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 _totalReserve,
        uint256 _totalLoans,
        uint256 _pendingLoans,
        uint256 _approvedLoans
    ) {
        _totalReserve = totalReserve;
        _totalLoans = loanCounter;

        uint256 pending = 0;
        uint256 approved = 0;

        for (uint256 i = 1; i <= loanCounter; i++) {
            if (loans[i].status == LoanStatus.Pending) pending++;
            if (loans[i].status == LoanStatus.Approved) approved++;
        }

        _pendingLoans = pending;
        _approvedLoans = approved;
    }

    /**
     * @dev Pause contract operations (admin only)
     */
    function pause() external onlyOwner {
        paused = true;
    }

    /**
     * @dev Unpause contract operations (admin only)
     */
    function unpause() external onlyOwner {
        paused = false;
    }

    /**
     * @dev Emergency withdraw (admin only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdraw failed");
    }
}
