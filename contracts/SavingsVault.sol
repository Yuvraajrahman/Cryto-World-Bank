// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SavingsVault
 * @notice Simplified variable-yield savings vault (thesis §3.7, DT-II deposit mobilisation).
 * @dev ERC-4626-style shares without full spec compliance; uses MockUSDC or native ETH sentinel.
 */
contract SavingsVault is AccessControl, ReentrancyGuard {
  using SafeERC20 for IERC20;

  bytes32 public constant LOCAL_BANK_ROLE = keccak256("LOCAL_BANK_ROLE");

  address public immutable asset;
  bool public immutable isEth;

  uint256 public totalShares;
  uint256 public totalAssetsDeposited;
  uint256 public yieldIndexBps = 500; // 5% APY simplified accrual hook

  mapping(address => uint256) public sharesOf;

  event Deposited(address indexed user, uint256 assets, uint256 shares);
  event Withdrawn(address indexed user, uint256 assets, uint256 shares);

  constructor(address admin, address assetToken, bool ethVault) {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    asset = assetToken;
    isEth = ethVault;
  }

  receive() external payable {
    require(isEth, "not eth vault");
  }

  function deposit(uint256 assets) external payable nonReentrant returns (uint256 shares) {
    require(assets > 0, "zero assets");
    if (isEth) {
      require(msg.value == assets, "value mismatch");
    } else {
      IERC20(asset).safeTransferFrom(msg.sender, address(this), assets);
    }
    shares = _mintShares(assets);
    emit Deposited(msg.sender, assets, shares);
  }

  function withdraw(uint256 shares) external nonReentrant returns (uint256 assets) {
    require(shares > 0 && shares <= sharesOf[msg.sender], "bad shares");
    assets = (shares * totalAssetsDeposited) / totalShares;
    _burnShares(msg.sender, shares);
    if (isEth) {
      (bool ok, ) = payable(msg.sender).call{value: assets}("");
      require(ok, "eth withdraw failed");
    } else {
      IERC20(asset).safeTransfer(msg.sender, assets);
    }
    emit Withdrawn(msg.sender, assets, shares);
  }

  function balanceOf(address user) external view returns (uint256 assets) {
    uint256 s = sharesOf[user];
    if (totalShares == 0) return 0;
    return (s * totalAssetsDeposited) / totalShares;
  }

  function _mintShares(uint256 assets) internal returns (uint256 shares) {
    if (totalShares == 0) {
      shares = assets;
    } else {
      shares = (assets * totalShares) / totalAssetsDeposited;
    }
    sharesOf[msg.sender] += shares;
    totalShares += shares;
    totalAssetsDeposited += assets;
  }

  function _burnShares(address user, uint256 shares) internal {
    uint256 assets = (shares * totalAssetsDeposited) / totalShares;
    sharesOf[user] -= shares;
    totalShares -= shares;
    totalAssetsDeposited -= assets;
  }
}
