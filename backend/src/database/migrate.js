import { getDB } from './connection.js';

async function migrate() {
  try {
    console.log('🔄 Starting database migration (MongoDB indexes)...');
    
    const db = await getDB();
    
    // Create indexes for better query performance
    
    // World Bank
    await db.collection('world_banks').createIndex({ name: 1 }, { unique: true });
    
    // National Banks
    await db.collection('national_banks').createIndex({ world_bank_id: 1 });
    await db.collection('national_banks').createIndex({ country: 1 });
    
    // Local Banks
    await db.collection('local_banks').createIndex({ national_bank_id: 1 });
    await db.collection('local_banks').createIndex({ city: 1 });
    
    // Bank Users
    await db.collection('bank_users').createIndex({ wallet_address: 1 }, { unique: true });
    await db.collection('bank_users').createIndex({ national_bank_id: 1 });
    await db.collection('bank_users').createIndex({ local_bank_id: 1 });
    
    // Borrowers
    await db.collection('borrowers').createIndex({ wallet_address: 1 }, { unique: true });
    await db.collection('borrowers').createIndex({ country: 1, city: 1 });
    
    // Loan Requests
    await db.collection('loan_requests').createIndex({ borrower_id: 1 });
    await db.collection('loan_requests').createIndex({ local_bank_id: 1 });
    await db.collection('loan_requests').createIndex({ status: 1 });
    await db.collection('loan_requests').createIndex({ blockchain_tx_hash: 1 }, { unique: true, sparse: true });
    
    // Transactions
    await db.collection('transactions').createIndex({ borrower_id: 1, transaction_date: -1 });
    await db.collection('transactions').createIndex({ blockchain_tx_hash: 1 }, { unique: true, sparse: true });
    await db.collection('transactions').createIndex({ transaction_date: -1 });
    
    // Installments
    await db.collection('installments').createIndex({ loan_id: 1, installment_number: 1 }, { unique: true });
    await db.collection('installments').createIndex({ status: 1, due_date: 1 });
    
    // Chat Messages
    await db.collection('chat_messages').createIndex({ loan_id: 1, sent_at: -1 });
    await db.collection('chat_messages').createIndex({ receiver_id: 1, receiver_type: 1, is_read: 1 });
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
