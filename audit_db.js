import sql from './server/db.js';

async function audit() {
  try {
    const custCount = await sql`SELECT count(*) FROM customers`;
    const loanCount = await sql`SELECT count(*) FROM loans`;
    const dailyLoans = await sql`SELECT count(*) FROM loans WHERE loan_type='Daily' OR loan_type IS NULL`;
    const termLoans = await sql`SELECT count(*) FROM loans WHERE loan_type IN ('15-Day', 'Monthly')`;
    
    console.log('--- DATABASE AUDIT ---');
    console.log('Total Customers in DB:', custCount[0].count);
    console.log('Total Loans in DB:', loanCount[0].count);
    console.log('Daily Loans:', dailyLoans[0].count);
    console.log('Term Loans (15-Day/Monthly):', termLoans[0].count);
    
    const missingCodes = await sql`SELECT name, customer_code FROM customers WHERE customer_code IS NULL OR customer_code = ''`;
    if (missingCodes.length > 0) {
      console.log('\nCustomers missing Codes:', missingCodes.length);
      missingCodes.forEach(c => console.log(` - ${c.name}`));
    }

    const loansWithoutCustomers = await sql`SELECT id FROM loans WHERE customer_id NOT IN (SELECT id FROM customers)`;
    if (loansWithoutCustomers.length > 0) {
      console.log('\nLoans linked to non-existent customers:', loansWithoutCustomers.length);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

audit();
