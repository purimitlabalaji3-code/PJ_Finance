import sql from './server/db.js';

async function updateSchema() {
  try {
    console.log('--- ADDING LOAN_CODE COLUMN ---');
    await sql`ALTER TABLE loans ADD COLUMN IF NOT EXISTS loan_code VARCHAR(20)`;
    console.log('Column "loan_code" added successfully.');

    // Optional: Migrate existing loans
    const loans = await sql`SELECT l.id, l.loan_type, l.created_at, c.customer_code 
                            FROM loans l 
                            JOIN customers c ON c.id = l.customer_id 
                            ORDER BY l.created_at ASC`;
    
    let dCount = 1;
    let tCount = 1;
    let mCount = 1;

    for (const l of loans) {
      let code = '';
      if (l.loan_type === 'Daily') {
        code = `PJ-D-${String(dCount++).padStart(3, '0')}`;
      } else if (l.loan_type === '15-Day') {
        code = `PJ-15-${String(tCount++).padStart(3, '0')}`;
      } else {
        code = `PJ-M-${String(mCount++).padStart(3, '0')}`;
      }
      await sql`UPDATE loans SET loan_code = ${code} WHERE id = ${l.id}`;
      console.log(`Updated Loan ${l.id} -> ${code}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateSchema();
