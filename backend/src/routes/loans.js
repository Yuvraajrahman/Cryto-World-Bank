import express from 'express';
import { getDB } from '../database/connection.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get all loans for a borrower
router.get('/borrower/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const db = await getDB();
    
    // Find borrower
    const borrower = await db.collection('borrowers').findOne({ wallet_address: walletAddress });
    if (!borrower) {
      return res.json([]);
    }
    
    const loans = await db.collection('loan_requests')
      .aggregate([
        { $match: { borrower_id: borrower._id } },
        {
          $lookup: {
            from: 'local_banks',
            localField: 'local_bank_id',
            foreignField: '_id',
            as: 'local_bank'
          }
        },
        {
          $unwind: {
            path: '$local_bank',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            bank_name: '$local_bank.name',
            borrower_name: borrower.name
          }
        },
        {
          $project: {
            local_bank: 0
          }
        },
        { $sort: { requested_at: -1 } }
      ])
      .toArray();
    
    res.json(loans);
  } catch (error) {
    console.error('Error fetching borrower loans:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pending loans for a bank
router.get('/pending/:localBankId', async (req, res) => {
  try {
    const { localBankId } = req.params;
    const db = await getDB();
    
    const loans = await db.collection('loan_requests')
      .aggregate([
        { 
          $match: { 
            local_bank_id: new ObjectId(localBankId),
            status: 'pending'
          } 
        },
        {
          $lookup: {
            from: 'borrowers',
            localField: 'borrower_id',
            foreignField: '_id',
            as: 'borrower'
          }
        },
        {
          $unwind: {
            path: '$borrower',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            borrower_name: '$borrower.name',
            borrower_wallet: '$borrower.wallet_address'
          }
        },
        {
          $project: {
            borrower: 0
          }
        },
        { $sort: { requested_at: 1 } }
      ])
      .toArray();
    
    res.json(loans);
  } catch (error) {
    console.error('Error fetching pending loans:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create loan request
router.post('/request', async (req, res) => {
  try {
    const { walletAddress, localBankId, amount, purpose, blockchainTxHash } = req.body;
    
    if (!walletAddress || !localBankId || !amount || !purpose) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = await getDB();
    
    // Get borrower
    const borrower = await db.collection('borrowers').findOne({ wallet_address: walletAddress });
    
    if (!borrower) {
      return res.status(404).json({ error: 'Borrower not found. Please register first.' });
    }
    
    // Check if borrower already has a pending loan with this bank
    const existing = await db.collection('loan_requests').findOne({
      borrower_id: borrower._id,
      local_bank_id: new ObjectId(localBankId),
      status: 'pending'
    });
    
    if (existing) {
      return res.status(400).json({ error: 'You already have a pending loan request with this bank' });
    }
    
    // Determine if installment (>= 100 ETH)
    const isInstallment = parseFloat(amount) >= 100;
    const totalInstallments = isInstallment ? 4 : 1;
    
    const result = await db.collection('loan_requests').insertOne({
      borrower_id: borrower._id,
      local_bank_id: new ObjectId(localBankId),
      amount: parseFloat(amount),
      purpose: purpose,
      cryptocurrency_type: 'ETH',
      status: 'pending',
      requested_at: new Date(),
      gas_cost: 0,
      is_installment: isInstallment,
      total_installments: totalInstallments,
      blockchain_tx_hash: blockchainTxHash || null,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    const loan = await db.collection('loan_requests')
      .aggregate([
        { $match: { _id: result.insertedId } },
        {
          $lookup: {
            from: 'local_banks',
            localField: 'local_bank_id',
            foreignField: '_id',
            as: 'local_bank'
          }
        },
        {
          $unwind: {
            path: '$local_bank',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            bank_name: '$local_bank.name',
            borrower_name: borrower.name
          }
        },
        {
          $project: {
            local_bank: 0
          }
        }
      ])
      .toArray();
    
    res.json(loan[0]);
  } catch (error) {
    console.error('Error creating loan request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve loan
router.post('/approve/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;
    const { bankUserId, blockchainTxHash, deadline } = req.body;
    
    if (!bankUserId) {
      return res.status(400).json({ error: 'Bank user ID required' });
    }
    
    const db = await getDB();
    
    const result = await db.collection('loan_requests').updateOne(
      { 
        _id: new ObjectId(loanId),
        status: 'pending'
      },
      {
        $set: {
          status: 'approved',
          approved_by: new ObjectId(bankUserId),
          approved_at: new Date(),
          blockchain_tx_hash: blockchainTxHash || null,
          deadline: deadline ? new Date(deadline) : null,
          updated_at: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Loan not found or not pending' });
    }
    
    // Create transaction record
    const loan = await db.collection('loan_requests').findOne({ 
      _id: new ObjectId(loanId) 
    });
    
    if (loan) {
      await db.collection('transactions').insertOne({
        borrower_id: loan.borrower_id,
        local_bank_id: loan.local_bank_id,
        transaction_type: 'loan_approved',
        amount: loan.amount,
        cryptocurrency_type: 'ETH',
        transaction_date: new Date(),
        blockchain_tx_hash: blockchainTxHash || null,
        related_loan_id: loan._id,
        created_at: new Date()
      });
    }
    
    res.json({ success: true, loanId });
  } catch (error) {
    console.error('Error approving loan:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject loan
router.post('/reject/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;
    const { bankUserId, rejectionReason } = req.body;
    
    if (!bankUserId) {
      return res.status(400).json({ error: 'Bank user ID required' });
    }
    
    const db = await getDB();
    
    const result = await db.collection('loan_requests').updateOne(
      { 
        _id: new ObjectId(loanId),
        status: 'pending'
      },
      {
        $set: {
          status: 'rejected',
          rejected_by: new ObjectId(bankUserId),
          rejected_at: new Date(),
          rejection_reason: rejectionReason || null,
          updated_at: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Loan not found or not pending' });
    }
    
    res.json({ success: true, loanId });
  } catch (error) {
    console.error('Error rejecting loan:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
