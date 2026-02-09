import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDB } from './database/connection.js';
import userRoutes from './routes/users.js';
import bankRoutes from './routes/banks.js';
import loanRoutes from './routes/loans.js';
import transactionRoutes from './routes/transactions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  try {
    const db = await getDB();
    await db.admin().ping();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

