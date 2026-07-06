// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title InterBankLendingPool
 * @notice Same-tier short-tenor liquidity pool (thesis §3.9.1, IBLP).
 */
contract InterBankLendingPool is AccessControl, ReentrancyGuard {
  bytes32 public constant BORROWER_ROLE = keccak256("BORROWER_ROLE");

  enum LoanStatus { Active, Repaid, Defaulted }

  struct IBLPLoan {
    uint256 id;
    address lender;
    address borrower;
    uint256 principal;
    uint256 interestBps;
    uint32 tenorDays;
    uint256 createdAt;
    uint256 dueAt;
    LoanStatus status;
  }

  string public tierLabel;
  uint256 public borrowRateBps = 400;

  uint256 public nextLoanId = 1;
  mapping(uint256 => IBLPLoan) public loans;
  mapping(address => uint256[]) public loansByBorrower;

  event IBLPBorrowed(uint256 indexed id, address indexed lender, address indexed borrower, uint256 principal, uint32 tenorDays);
  event IBLPRepaid(uint256 indexed id, address indexed borrower, uint256 amount);

  constructor(address admin, string memory tier) {
    tierLabel = tier;
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
  }

  receive() external payable {}

  function registerBorrower(address bank) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _grantRole(BORROWER_ROLE, bank);
  }

  function borrow(address borrower, uint256 principal, uint32 tenorDays)
    external
    payable
    onlyRole(BORROWER_ROLE)
    nonReentrant
    returns (uint256 id)
  {
    require(borrower != address(0), "zero borrower");
    require(principal > 0 && tenorDays > 0 && tenorDays <= 30, "bad terms");
    require(msg.value == principal, "value mismatch");
    require(hasRole(BORROWER_ROLE, borrower), "borrower not registered");

    id = nextLoanId++;
    loans[id] = IBLPLoan({
      id: id,
      lender: msg.sender,
      borrower: borrower,
      principal: principal,
      interestBps: borrowRateBps,
      tenorDays: tenorDays,
      createdAt: block.timestamp,
      dueAt: block.timestamp + tenorDays * 1 days,
      status: LoanStatus.Active
    });
    loansByBorrower[borrower].push(id);

    (bool ok, ) = payable(borrower).call{value: principal}("");
    require(ok, "transfer failed");

    emit IBLPBorrowed(id, msg.sender, borrower, principal, tenorDays);
  }

  function repay(uint256 id) external payable nonReentrant {
    IBLPLoan storage l = loans[id];
    require(l.status == LoanStatus.Active, "not active");
    require(msg.sender == l.borrower, "not borrower");
    uint256 interest = (l.principal * l.interestBps * l.tenorDays) / (10000 * 365);
    uint256 owed = l.principal + interest;
    require(msg.value >= owed, "insufficient repayment");
    l.status = LoanStatus.Repaid;
    (bool ok, ) = payable(l.lender).call{value: owed}("");
    require(ok, "lender pay failed");
    emit IBLPRepaid(id, msg.sender, owed);
  }
}
