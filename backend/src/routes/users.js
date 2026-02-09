import express from 'express';
import { getDB } from '../database/connection.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get user by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const db = await getDB();
    
    // Check if borrower
    const borrower = await db.collection('borrowers').findOne({ wallet_address: walletAddress });
    
    if (borrower) {
      return res.json({ type: 'borrower', data: borrower });
    }
    
    // Check if bank user
    const bankUser = await db.collection('bank_users').findOne({ 
      wallet_address: walletAddress,
      is_active: true
    });
    
    if (bankUser) {
      // Populate bank names
      if (bankUser.national_bank_id) {
        const nationalBank = await db.collection('national_banks').findOne({ 
          _id: bankUser.national_bank_id 
        });
        if (nationalBank) {
          bankUser.national_bank_name = nationalBank.name;
        }
      }
      if (bankUser.local_bank_id) {
        const localBank = await db.collection('local_banks').findOne({ 
          _id: bankUser.local_bank_id 
        });
        if (localBank) {
          bankUser.local_bank_name = localBank.name;
        }
      }
      
      return res.json({ type: 'bank_user', data: bankUser });
    }
    
    res.status(404).json({ error: 'User not found' });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register borrower
router.post('/borrower', async (req, res) => {
  try {
    const { walletAddress, name, email, phone, country, city } = req.body;
    
    if (!walletAddress || !name || !country) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = await getDB();
    
    const result = await db.collection('borrowers').findOneAndUpdate(
      { wallet_address: walletAddress },
      {
        $set: {
          wallet_address: walletAddress,
          name: name,
          email: email || null,
          phone: phone || null,
          country: country,
          city: city || null,
          is_first_time: true,
          total_borrowed_lifetime: 0,
          consecutive_paid_loans: 0,
          can_multiple_loans: false,
          updated_at: new Date()
        },
        $setOnInsert: {
          created_at: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    
    res.json({ type: 'borrower', data: result.value });
  } catch (error) {
    console.error('Error registering borrower:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register bank user
router.post('/bank-user', async (req, res) => {
  try {
    const { walletAddress, bankType, nationalBankId, localBankId, name, email, role } = req.body;
    
    if (!walletAddress || !bankType || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = await getDB();
    
    // Convert string IDs to ObjectId if needed
    const updateData = {
      wallet_address: walletAddress,
      bank_type: bankType,
      name: name,
      email: email || null,
      role: role || 'approver',
      is_active: true,
      updated_at: new Date()
    };
    
    if (bankType === 'national' && nationalBankId) {
      updateData.national_bank_id = new ObjectId(nationalBankId);
      updateData.local_bank_id = null;
    } else if (bankType === 'local' && localBankId) {
      updateData.local_bank_id = new ObjectId(localBankId);
      updateData.national_bank_id = null;
    }
    
    const result = await db.collection('bank_users').findOneAndUpdate(
      { wallet_address: walletAddress },
      {
        $set: updateData,
        $setOnInsert: {
          created_at: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    
    res.json({ type: 'bank_user', data: result.value });
  } catch (error) {
    console.error('Error registering bank user:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
