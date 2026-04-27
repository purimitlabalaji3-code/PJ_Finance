// server/migrate-final.js
// Migrates data from Temporary Personal DB to Final Client DB
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

// 1. SOURCE: Personal DB (The one we just used)
const SOURCE_URL = 'postgresql://neondb_owner:npg_Mjc0fh3ibKwN@ep-blue-block-amclg820-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
// 2. TARGET: Client DB (The new one)
const TARGET_URL = process.env.DATABASE_URL;

const sqlSource = neon(SOURCE_URL);
const sqlTarget = neon(TARGET_URL);

async function migrate() {
  try {
    console.log('🚀 Starting FINAL migration to Client Account...');

    // 1. Clear default settings in target
    await sqlTarget`DELETE FROM settings`;

    // 2. Migrate Customers
    console.log('📦 Migrating Customers...');
    const customers = await sqlSource`SELECT * FROM customers`;
    for (const c of customers) {
      await sqlTarget`
        INSERT INTO customers (id, customer_code, name, phone, age, gender, aadhaar, address, status, join_date, image_url)
        VALUES (${c.id}, ${c.customer_code}, ${c.name}, ${c.phone}, ${c.age}, ${c.gender}, ${c.aadhaar}, ${c.address}, ${c.status}, ${c.join_date}, ${c.image_url})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // 3. Migrate Loans
    console.log('📦 Migrating Loans...');
    const loans = await sqlSource`SELECT * FROM loans`;
    for (const l of loans) {
      await sqlTarget`
        INSERT INTO loans (id, customer_id, loan_code, loan_type, loan_amount, interest, total_amount, daily_amount, total_days, paid_days, start_date, status)
        VALUES (${l.id}, ${l.customer_id}, ${l.loan_code}, ${l.loan_type}, ${l.loan_amount}, ${l.interest}, ${l.total_amount}, ${l.daily_amount}, ${l.total_days}, ${l.paid_days}, ${l.start_date}, ${l.status})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // 4. Migrate Collections
    console.log('📦 Migrating Collections...');
    const collections = await sqlSource`SELECT * FROM collections`;
    for (const c of collections) {
      await sqlTarget`
        INSERT INTO collections (id, loan_id, customer_id, customer_code, customer_name, due_amount, paid_amount, total_amount, paid_days, daily_amount, status, date)
        VALUES (${c.id}, ${c.loan_id}, ${c.customer_id}, ${c.customer_code}, ${c.customer_name}, ${c.due_amount}, ${c.paid_amount}, ${c.total_amount}, ${c.paid_days}, ${c.daily_amount}, ${c.status}, ${c.date})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // 5. Migrate Settings
    console.log('📦 Migrating Branded Settings...');
    const settings = await sqlSource`SELECT * FROM settings`;
    for (const s of settings) {
      await sqlTarget`
        INSERT INTO settings (key, value)
        VALUES (${s.key}, ${s.value})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }

    console.log('✅ Final Migration Complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
}

migrate();
