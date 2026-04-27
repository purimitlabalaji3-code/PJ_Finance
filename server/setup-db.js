// Run this once to set up all tables in your Neon database
// Usage: node server/setup-db.js

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  console.log('🚀 Setting up PJ Finance database...\n');

  // Admin table
  await sql`
    CREATE TABLE IF NOT EXISTS admin (
      id         SERIAL PRIMARY KEY,
      username   TEXT NOT NULL DEFAULT 'admin',
      password   TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ admin table ready');

  // Customers table
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id            SERIAL PRIMARY KEY,
      customer_code TEXT,
      name          TEXT NOT NULL,
      phone         TEXT NOT NULL,
      age           INT,
      gender        TEXT,
      aadhaar       TEXT,
      address       TEXT,
      status        TEXT NOT NULL DEFAULT 'Active',
      image         TEXT,
      image_url     TEXT,
      join_date     DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ customers table ready');

  // Loans table
  await sql`
    CREATE TABLE IF NOT EXISTS loans (
      id           SERIAL PRIMARY KEY,
      loan_code    TEXT,
      customer_id  INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      loan_amount  NUMERIC(12,2) NOT NULL,
      interest     NUMERIC(5,2)  NOT NULL DEFAULT 10,
      total_amount NUMERIC(12,2) NOT NULL,
      daily_amount NUMERIC(10,2) NOT NULL,
      start_date   DATE NOT NULL DEFAULT CURRENT_DATE,
      status       TEXT NOT NULL DEFAULT 'Active',
      paid_days    INT NOT NULL DEFAULT 0,
      total_days   INT NOT NULL DEFAULT 100,
      loan_type    TEXT NOT NULL DEFAULT 'Daily',
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ loans table ready');

  // Collections table
  await sql`
    CREATE TABLE IF NOT EXISTS collections (
      id            SERIAL PRIMARY KEY,
      loan_id       INT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
      customer_id   INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      customer_code TEXT,
      customer_name TEXT,
      due_amount    NUMERIC(10,2) NOT NULL,
      paid_amount   NUMERIC(10,2) DEFAULT 0,
      total_amount  NUMERIC(12,2),
      paid_days     INT,
      daily_amount  NUMERIC(10,2),
      status        TEXT NOT NULL DEFAULT 'Pending',
      date          DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ collections table ready');

  // Settings table
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id         SERIAL PRIMARY KEY,
      key        TEXT UNIQUE NOT NULL,
      value      TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ settings table ready');

  // Seed default admin (password: admin123)
  await sql`
    INSERT INTO admin (username, password)
    VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
    ON CONFLICT DO NOTHING
  `;
  console.log('✅ admin user seeded (password: admin123)');

  // Seed default settings
  const defaults = [
    ['company_name', 'PJ Finance'],
    ['address', ''],
    ['phone', ''],
    ['pdf_footer', 'Thank you for your payment.'],
    ['show_logo', 'true'],
    ['show_timeline', 'true'],
    ['show_summary', 'true'],
    ['logo_url', ''],
  ];

  for (const [key, value] of defaults) {
    await sql`
      INSERT INTO settings (key, value) VALUES (${key}, ${value})
      ON CONFLICT (key) DO NOTHING
    `;
  }
  console.log('✅ default settings seeded');

  console.log('\n🎉 Database setup complete!');
  console.log('🔑 Login: admin / admin123');
  process.exit(0);
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
