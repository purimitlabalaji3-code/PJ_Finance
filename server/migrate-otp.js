// Add Gmail + OTP support to existing database
// Run: node server/migrate-otp.js

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('🚀 Applying OTP migration...\n');

  // Add gmail column to admin if it doesn't exist
  await sql`
    ALTER TABLE admin ADD COLUMN IF NOT EXISTS gmail TEXT
  `;
  console.log('✅ gmail column added to admin');

  // Create OTP tokens table
  await sql`
    CREATE TABLE IF NOT EXISTS otp_tokens (
      id         SERIAL PRIMARY KEY,
      gmail      TEXT NOT NULL,
      otp        TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used       BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ otp_tokens table created');

  console.log('\n🎉 Migration complete!');
  console.log('👉 Set ADMIN_GMAIL in your .env to your Gmail address');
  console.log('👉 Set GMAIL_USER and GMAIL_APP_PASS in .env for sending OTPs');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
