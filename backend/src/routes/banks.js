import express from 'express';
import { getDB } from '../database/connection.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get World Bank info
router.get('/world', async (req, res) => {
  try {
    const db = await getDB();
    const worldBank = await db.collection('world_banks').findOne({});
    res.json(worldBank || null);
  } catch (error) {
    console.error('Error fetching world bank:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all national banks
router.get('/national', async (req, res) => {
  try {
    const db = await getDB();
    const banks = await db.collection('national_banks')
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    res.json(banks);
  } catch (error) {
    console.error('Error fetching national banks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get national bank by ID
router.get('/national/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    const bank = await db.collection('national_banks').findOne({ 
      _id: new ObjectId(id) 
    });
    res.json(bank || null);
  } catch (error) {
    console.error('Error fetching national bank:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all local banks
router.get('/local', async (req, res) => {
  try {
    const { nationalBankId } = req.query;
    const db = await getDB();
    
    const query = {};
    if (nationalBankId) {
      query.national_bank_id = new ObjectId(nationalBankId);
    }
    
    const banks = await db.collection('local_banks')
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'national_banks',
            localField: 'national_bank_id',
            foreignField: '_id',
            as: 'national_bank'
          }
        },
        {
          $unwind: {
            path: '$national_bank',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            national_bank_name: '$national_bank.name'
          }
        },
        {
          $project: {
            national_bank: 0
          }
        },
        { $sort: { created_at: -1 } }
      ])
      .toArray();
    
    res.json(banks);
  } catch (error) {
    console.error('Error fetching local banks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get local bank by ID
router.get('/local/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    
    const bank = await db.collection('local_banks')
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: 'national_banks',
            localField: 'national_bank_id',
            foreignField: '_id',
            as: 'national_bank'
          }
        },
        {
          $unwind: {
            path: '$national_bank',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            national_bank_name: '$national_bank.name'
          }
        },
        {
          $project: {
            national_bank: 0
          }
        }
      ])
      .toArray();
    
    res.json(bank[0] || null);
  } catch (error) {
    console.error('Error fetching local bank:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register national bank
router.post('/national', async (req, res) => {
  try {
    const { worldBankId, name, country, address } = req.body;
    
    if (!name || !country) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = await getDB();
    
    // Get world bank ID if not provided
    let wbId = worldBankId;
    if (!wbId) {
      const wb = await db.collection('world_banks').findOne({});
      wbId = wb?._id;
    } else {
      wbId = new ObjectId(wbId);
    }
    
    const result = await db.collection('national_banks').insertOne({
      world_bank_id: wbId,
      name: name,
      country: country,
      address: address || null,
      total_borrowed: 0,
      total_lent: 0,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    const bank = await db.collection('national_banks').findOne({ 
      _id: result.insertedId 
    });
    
    res.json(bank);
  } catch (error) {
    console.error('Error registering national bank:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register local bank
router.post('/local', async (req, res) => {
  try {
    const { nationalBankId, name, city, address } = req.body;
    
    if (!nationalBankId || !name || !city) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = await getDB();
    
    const result = await db.collection('local_banks').insertOne({
      national_bank_id: new ObjectId(nationalBankId),
      name: name,
      city: city,
      address: address || null,
      total_borrowed: 0,
      total_lent: 0,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    const bank = await db.collection('local_banks').findOne({ 
      _id: result.insertedId 
    });
    
    res.json(bank);
  } catch (error) {
    console.error('Error registering local bank:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
