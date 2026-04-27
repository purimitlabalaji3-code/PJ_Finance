// server/fix-db.js — Run this to add missing columns to your live database
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function fix() {
  console.log('🚀 Checking and fixing database schema...');

  try {
    // 1. Add customer_code to customers
    await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_code TEXT`;
    console.log('✅ Column customer_code added to customers');

    // 2. Add loan_code to loans
    await sql`ALTER TABLE loans ADD COLUMN IF NOT EXISTS loan_code TEXT`;
    console.log('✅ Column loan_code added to loans');

    // 3. Add loan_type to loans
    await sql`ALTER TABLE loans ADD COLUMN IF NOT EXISTS loan_type TEXT DEFAULT 'Daily'`;
    console.log('✅ Column loan_type added to loans');

    // 4. Update existing customers/loans with default codes if needed
    console.log('⏳ Generating codes for existing data...');
    
    const customers = await sql`SELECT id FROM customers WHERE customer_code IS NULL`;
    for (let i = 0; i < customers.length; i++) {
      const code = `PJ-${String(i + 1).padStart(3, '0')}`;
      await sql`UPDATE customers SET customer_code = ${code} WHERE id = ${customers[i].id}`;
    }

    const loans = await sql`SELECT id, loan_type FROM loans WHERE loan_code IS NULL`;
    for (let i = 0; i < loans.length; i++) {
      const prefix = loans[i].loan_type === '15-Day' ? 'PJ-15' : loans[i].loan_type === 'Monthly' ? 'PJ-M' : 'PJ-D';
      const code = `${prefix}-${String(i + 1).padStart(3, '0')}`;
      await sql`UPDATE loans SET loan_code = ${code} WHERE id = ${loans[i].id}`;
    }

    console.log('\n🎉 Database schema is now up to date!');
  } catch (err) {
    console.error('❌ Error fixing database:', err.message);
  } finally {
    process.exit(0);
  }
}

fix();
