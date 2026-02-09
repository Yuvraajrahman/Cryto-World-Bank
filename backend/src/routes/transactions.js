import express from 'express';
import { getDB } from '../database/connection.js';

const router = express.Router();

// Get transactions for a borrower
router.get('/borrower/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { period } = req.query; // '6months' or '1year'
    const db = await getDB();
    
    // Find borrower
    const borrower = await db.collection('borrowers').findOne({ wallet_address: walletAddress });
    if (!borrower) {
      return res.json([]);
    }
    
    // Build date filter
    const dateFilter = {};
    if (period === '6months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      dateFilter.transaction_date = { $gte: sixMonthsAgo };
    } else if (period === '1year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      dateFilter.transaction_date = { $gte: oneYearAgo };
    }
    
    const transactions = await db.collection('transactions')
      .aggregate([
        { 
          $match: { 
            borrower_id: borrower._id,
            ...dateFilter
          } 
        },
        {
          $lookup: {
            from: 'loan_requests',
            localField: 'related_loan_id',
            foreignField: '_id',
            as: 'loan'
          }
        },
        {
          $unwind: {
            path: '$loan',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            purpose: '$loan.purpose',
            loan_id: '$loan._id'
          }
        },
        {
          $project: {
            loan: 0
          }
        },
        { $sort: { transaction_date: -1 } }
      ])
      .toArray();
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get borrowing limits for a borrower
router.get('/limits/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const db = await getDB();
    
    // Find borrower
    const borrower = await db.collection('borrowers').findOne({ wallet_address: walletAddress });
    if (!borrower) {
      return res.json({
        six_month_limit: 0,
        six_month_borrowed: 0,
        six_month_remaining: 0,
        one_year_limit: 0,
        one_year_borrowed: 0,
        one_year_remaining: 0
      });
    }
    
    const limits = await db.collection('borrowing_limits').findOne({ 
      borrower_id: borrower._id 
    });
    
    if (!limits) {
      // Return default limits
      return res.json({
        six_month_limit: 0,
        six_month_borrowed: 0,
        six_month_remaining: 0,
        one_year_limit: 0,
        one_year_borrowed: 0,
        one_year_remaining: 0,
        borrower_name: borrower.name
      });
    }
    
    res.json({
      ...limits,
      borrower_name: borrower.name
    });
  } catch (error) {
    console.error('Error fetching borrowing limits:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
