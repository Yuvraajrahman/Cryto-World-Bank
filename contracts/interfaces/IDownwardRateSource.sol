// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IDownwardRateSource
 * @notice Common interface implemented by NationalBank and LocalBank so that
 *         same-tier / upward facilities (InterBankLendingPool,
 *         UpwardDepositFacility) can read "the rate this tier currently
 *         charges the tier below it" and enforce the thesis's rate spreads:
 *           - Interbank rate cap:      r_IB(U)  <= r_downward(U) - delta
 *           - Upward deposit rate cap: r_up     <  r_down(U) - delta
 */
interface IDownwardRateSource {
    function downwardRateBps() external view returns (uint256);
}
