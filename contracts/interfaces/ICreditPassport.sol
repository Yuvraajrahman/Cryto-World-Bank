// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ICreditPassport
 * @notice Read-only interface for the on-chain Credit Passport SBT (thesis §3.8).
 */
interface ICreditPassport {
  enum RiskTier {
    Bronze,
    Silver,
    Gold,
    Platinum,
    Diamond
  }

  function getScore(address wallet) external view returns (uint16 creditScore, RiskTier tier);

  function maxLoanAmount(address wallet) external view returns (uint256);

  function openLoans(address wallet) external view returns (uint8);

  function canBorrow(address wallet, uint256 principal) external view returns (bool);

  function onLoanOpened(address wallet) external;

  function onLoanRepaid(address wallet) external;

  function onLoanDefaulted(address wallet) external;

  function hasPassport(address wallet) external view returns (bool);
}
