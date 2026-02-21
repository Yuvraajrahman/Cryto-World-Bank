/**
 * Blockchain service - connects backend to WorldBankReserve contract (EVM)
 * Reads contract state and verifies transactions
 */
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const CONTRACT_ABI = [
  'function getTotalReserve() view returns (uint256)',
  'function getStats() view returns (uint256 _totalReserve, uint256 _totalLoans, uint256 _pendingLoans, uint256 _approvedLoans)',
  'function getUserDeposits(address user) view returns (uint256)',
  'function getUserLoans(address user) view returns (uint256[])',
  'function getLoan(uint256 loanId) view returns (uint256 id, address borrower, uint256 amount, string purpose, uint8 status, uint256 requestedAt, uint256 approvedAt)',
  'function owner() view returns (address)',
  'function paused() view returns (bool)',
  'function loanCounter() view returns (uint256)',
];

let provider = null;
let contract = null;

function getProvider() {
  if (provider) return provider;
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com/';
  provider = new ethers.JsonRpcProvider(rpcUrl);
  return provider;
}

function getContract() {
  if (contract) return contract;
  const address = process.env.CONTRACT_ADDRESS;
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return null;
  }
  const prov = getProvider();
  contract = new ethers.Contract(address, CONTRACT_ABI, prov);
  return contract;
}

/**
 * Get on-chain reserve stats
 */
export async function getOnChainStats() {
  const c = getContract();
  if (!c) {
    return { connected: false, error: 'Contract address not configured' };
  }
  try {
    const [totalReserve, totalLoans, pendingLoans, approvedLoans] = await c.getStats();
    return {
      connected: true,
      totalReserve: ethers.formatEther(totalReserve),
      totalLoans: Number(totalLoans),
      pendingLoans: Number(pendingLoans),
      approvedLoans: Number(approvedLoans),
    };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

/**
 * Get total reserve from contract
 */
export async function getTotalReserve() {
  const c = getContract();
  if (!c) return null;
  try {
    const reserve = await c.getTotalReserve();
    return ethers.formatEther(reserve);
  } catch {
    return null;
  }
}

/**
 * Get user deposits from contract
 */
export async function getUserDeposits(walletAddress) {
  const c = getContract();
  if (!c) return null;
  try {
    const deposits = await c.getUserDeposits(walletAddress);
    return ethers.formatEther(deposits);
  } catch {
    return null;
  }
}

/**
 * Verify a transaction hash exists on chain
 */
export async function verifyTransaction(txHash) {
  const prov = getProvider();
  try {
    const tx = await prov.getTransaction(txHash);
    return !!tx;
  } catch {
    return false;
  }
}

/**
 * Get chain info
 */
export async function getChainInfo() {
  const prov = getProvider();
  try {
    const network = await prov.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name,
    };
  } catch (err) {
    return { error: err.message };
  }
}
