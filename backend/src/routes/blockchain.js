import express from 'express';
import {
  getOnChainStats,
  getTotalReserve,
  getUserDeposits,
  verifyTransaction,
  getChainInfo,
} from '../services/blockchain.js';

const router = express.Router();

/**
 * GET /api/blockchain/stats
 * Get on-chain contract statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getOnChainStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/blockchain/reserve
 * Get total reserve from contract
 */
router.get('/reserve', async (req, res) => {
  try {
    const reserve = await getTotalReserve();
    if (reserve === null) {
      return res.status(503).json({ error: 'Blockchain not configured or unavailable' });
    }
    res.json({ totalReserve: reserve });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/blockchain/deposits/:walletAddress
 * Get user deposits from contract
 */
router.get('/deposits/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const deposits = await getUserDeposits(walletAddress);
    if (deposits === null) {
      return res.status(503).json({ error: 'Blockchain not configured or unavailable' });
    }
    res.json({ walletAddress, deposits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/blockchain/verify/:txHash
 * Verify a transaction exists on chain
 */
router.get('/verify/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const verified = await verifyTransaction(txHash);
    res.json({ txHash, verified });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/blockchain/chain
 * Get connected chain info
 */
router.get('/chain', async (req, res) => {
  try {
    const info = await getChainInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
