import sql from './server/db.js';

async function run() {
  const res = await sql`SELECT id, status FROM collections WHERE date='2026-04-26' AND status='Pending' AND loan_id IN (SELECT id FROM loans WHERE loan_type='Daily' OR loan_type IS NULL)`;
  console.log('Found Pending Daily Collections on Sunday:', res.length);
  
  await sql`DELETE FROM collections WHERE date='2026-04-26' AND status='Pending' AND loan_id IN (SELECT id FROM loans WHERE loan_type='Daily' OR loan_type IS NULL)`;
  console.log('Deleted successfully.');
  process.exit(0);
}

run();
