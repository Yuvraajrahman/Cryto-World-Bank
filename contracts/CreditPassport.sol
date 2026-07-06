// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ICreditPassport} from "./interfaces/ICreditPassport.sol";

/**
 * @title CreditPassport
 * @notice Non-transferable soulbound credential encoding client credit history (DT-II.04, DT-II.14).
 */
contract CreditPassport is AccessControl, ICreditPassport {
  bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
  bytes32 public constant LOAN_HOOK_ROLE = keccak256("LOAN_HOOK_ROLE");

  struct PassportData {
    uint16 creditScore;
    RiskTier tier;
    uint8 openLoans;
    uint8 completedCycles;
    uint64 lastDefaultAt;
    bool exists;
  }

  mapping(address => PassportData) public passports;

  event PassportIssued(address indexed wallet, uint16 creditScore, RiskTier tier);
  event ScoreUpdated(address indexed wallet, uint16 oldScore, uint16 newScore, RiskTier tier);
  event OpenLoansUpdated(address indexed wallet, uint8 openLoans);

  constructor(address admin) {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(ISSUER_ROLE, admin);
  }

  function issue(address wallet, uint16 initialScore) external onlyRole(ISSUER_ROLE) {
    require(wallet != address(0), "zero wallet");
    require(!passports[wallet].exists, "already issued");

    RiskTier tier = _tierForScore(initialScore);
    passports[wallet] = PassportData({
      creditScore: initialScore,
      tier: tier,
      openLoans: 0,
      completedCycles: 0,
      lastDefaultAt: 0,
      exists: true
    });

    emit PassportIssued(wallet, initialScore, tier);
  }

  function grantLoanHook(address hook) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _grantRole(LOAN_HOOK_ROLE, hook);
  }

  function grantIssuer(address issuer) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _grantRole(ISSUER_ROLE, issuer);
  }

  function onLoanOpened(address wallet) external onlyRole(LOAN_HOOK_ROLE) {
    PassportData storage p = passports[wallet];
    require(p.exists, "no passport");
    p.openLoans += 1;
    emit OpenLoansUpdated(wallet, p.openLoans);
  }

  function onLoanRepaid(address wallet) external onlyRole(LOAN_HOOK_ROLE) {
    PassportData storage p = passports[wallet];
    require(p.exists, "no passport");
    require(p.openLoans > 0, "no open loan");
    p.openLoans -= 1;
    p.completedCycles += 1;
    uint16 old = p.creditScore;
    if (p.creditScore < 1000) {
      p.creditScore = uint16(p.creditScore + 25 > 1000 ? 1000 : p.creditScore + 25);
    }
    p.tier = _tierForScore(p.creditScore);
    emit ScoreUpdated(wallet, old, p.creditScore, p.tier);
    emit OpenLoansUpdated(wallet, p.openLoans);
  }

  function onLoanDefaulted(address wallet) external onlyRole(LOAN_HOOK_ROLE) {
    PassportData storage p = passports[wallet];
    require(p.exists, "no passport");
    if (p.openLoans > 0) p.openLoans -= 1;
    uint16 old = p.creditScore;
    p.creditScore = p.creditScore > 100 ? uint16(p.creditScore - 100) : 0;
    p.tier = _tierForScore(p.creditScore);
    p.lastDefaultAt = uint64(block.timestamp);
    emit ScoreUpdated(wallet, old, p.creditScore, p.tier);
    emit OpenLoansUpdated(wallet, p.openLoans);
  }

  function getScore(address wallet) external view returns (uint16 creditScore, RiskTier tier) {
    PassportData memory p = passports[wallet];
    require(p.exists, "no passport");
    return (p.creditScore, p.tier);
  }

  function maxLoanAmount(address wallet) external view returns (uint256) {
    return _maxLoanForTier(passports[wallet].tier);
  }

  function openLoans(address wallet) external view returns (uint8) {
    return passports[wallet].openLoans;
  }

  function canBorrow(address wallet, uint256 principal) external view returns (bool) {
    PassportData memory p = passports[wallet];
    if (!p.exists) return false;
    if (p.openLoans >= 3) return false;
    return principal <= _maxLoanForTier(p.tier);
  }

  function hasPassport(address wallet) external view returns (bool) {
    return passports[wallet].exists;
  }

  function _tierForScore(uint16 score) internal pure returns (RiskTier) {
    if (score >= 900) return RiskTier.Diamond;
    if (score >= 750) return RiskTier.Platinum;
    if (score >= 550) return RiskTier.Gold;
    if (score >= 300) return RiskTier.Silver;
    return RiskTier.Bronze;
  }

  function _maxLoanForTier(RiskTier tier) internal pure returns (uint256) {
    if (tier == RiskTier.Diamond) return 25 ether;
    if (tier == RiskTier.Platinum) return 5 ether;
    if (tier == RiskTier.Gold) return 1 ether;
    if (tier == RiskTier.Silver) return 0.25 ether;
    return 0.05 ether;
  }
}
