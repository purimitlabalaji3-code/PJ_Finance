import sql from './db.js';

async function migrate() {
  try {
    await sql`ALTER TABLE loans ADD COLUMN IF NOT EXISTS loan_type VARCHAR(50) DEFAULT 'Daily'`;
    console.log('Migration v3 successful!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

migrate();
