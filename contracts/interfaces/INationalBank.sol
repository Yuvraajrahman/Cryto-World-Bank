// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface INationalBank {
  function requestCapital(uint256 amount) external returns (uint256 requestId);
}
