// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NationalBank.sol";

/**
 * @title LocalBank
 * @dev Local Bank contract that borrows from National Bank and lends to users
 */
contract LocalBank is ReentrancyGuard, Ownable {
    NationalBank public nationalBank;
    uint256 public totalBorrowedFromNationalBank;
    uint256 public totalLentToUsers;
    
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
    uint256 public loanCounter;
    
    // Bank user roles
    mapping(address => bool) public bankUsers;
    address public approver; // Only one approver per bank
    
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
    
    event BankUserAdded(address indexed user);
    event ApproverSet(address indexed approver);
    
    modifier onlyBankUser() {
        require(bankUsers[msg.sender] || msg.sender == approver, "Not an authorized bank user");
        _;
    }
    
    modifier onlyApprover() {
        require(msg.sender == approver, "Only approver can perform this action");
        _;
    }
    
    constructor(address _nationalBankAddress) Ownable(msg.sender) {
        require(_nationalBankAddress != address(0), "Invalid National Bank address");
        nationalBank = NationalBank(_nationalBankAddress);
        loanCounter = 0;
    }
    
    /**
     * @dev Add a bank user
     */
    function addBankUser(address _user) external onlyOwner {
        require(_user != address(0), "Invalid user address");
        require(!bankUsers[_user], "User already added");
        bankUsers[_user] = true;
        emit BankUserAdded(_user);
    }
    
    /**
     * @dev Set the approver (only one per bank)
     */
    function setApprover(address _approver) external onlyOwner {
        require(_approver != address(0), "Invalid approver address");
        approver = _approver;
        if (!bankUsers[_approver]) {
            bankUsers[_approver] = true;
        }
        emit ApproverSet(_approver);
    }
    
    /**
     * @dev Borrow from National Bank
     */
    function borrowFromNationalBank(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        // In a real implementation, this would require National Bank approval
        totalBorrowedFromNationalBank += _amount;
    }
    
    /**
     * @dev Request a loan from this local bank
     */
    function requestLoan(
        uint256 _amount,
        string memory _purpose
    ) external nonReentrant {
        require(_amount > 0, "Loan amount must be greater than 0");
        require(bytes(_purpose).length > 0, "Purpose cannot be empty");
        require(address(this).balance >= _amount, "Insufficient bank balance");
        
        loanCounter++;
        
        loans[loanCounter] = Loan({
            id: loanCounter,
            borrower: msg.sender,
            amount: _amount,
            purpose: _purpose,
            status: LoanStatus.Pending,
            requestedAt: block.timestamp,
            approvedAt: 0
        });
        
        userLoans[msg.sender].push(loanCounter);
        
        emit LoanRequested(loanCounter, msg.sender, _amount, _purpose);
    }
    
    /**
     * @dev Approve a loan (only approver)
     */
    function approveLoan(uint256 _loanId) external onlyApprover nonReentrant {
        require(_loanId > 0 && _loanId <= loanCounter, "Invalid loan ID");
        Loan storage loan = loans[_loanId];
        
        require(loan.status == LoanStatus.Pending, "Loan is not pending");
        require(address(this).balance >= loan.amount, "Insufficient contract balance");
        
        loan.status = LoanStatus.Approved;
        loan.approvedAt = block.timestamp;
        totalLentToUsers += loan.amount;
        
        (bool success, ) = payable(loan.borrower).call{value: loan.amount}("");
        require(success, "Transfer failed");
        
        emit LoanApproved(_loanId, loan.borrower, loan.amount);
    }
    
    /**
     * @dev Reject a loan (only approver)
     */
    function rejectLoan(uint256 _loanId) external onlyApprover {
        require(_loanId > 0 && _loanId <= loanCounter, "Invalid loan ID");
        Loan storage loan = loans[_loanId];
        
        require(loan.status == LoanStatus.Pending, "Loan is not pending");
        
        loan.status = LoanStatus.Rejected;
        
        emit LoanRejected(_loanId, loan.borrower);
    }
    
    /**
     * @dev Get loan details
     */
    function getLoan(uint256 _loanId) external view returns (Loan memory) {
        require(_loanId > 0 && _loanId <= loanCounter, "Invalid loan ID");
        return loans[_loanId];
    }
    
    /**
     * @dev Get all pending loans
     */
    function getPendingLoans() external view onlyBankUser returns (Loan[] memory) {
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
     * @dev Get user loans
     */
    function getUserLoans(address _user) external view returns (uint256[] memory) {
        return userLoans[_user];
    }
    
    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}

