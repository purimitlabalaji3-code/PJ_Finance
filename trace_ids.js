import sql from './server/db.js';

async function findMissing() {
  try {
    console.log('--- FINDING PJ-003 and PJ-004 ---');
    
    // Check Customers
    const customers = await sql`SELECT id, name, customer_code FROM customers WHERE customer_code IN ('PJ-003', 'PJ-004')`;
    console.log('\nCustomer Records:');
    if (customers.length === 0) {
      console.log('No customers found with codes PJ-003 or PJ-004');
    } else {
      for (const c of customers) {
        console.log(` - ${c.customer_code}: ${c.name} (ID: ${c.id})`);
        // Check Loans for this specific customer
        const loans = await sql`SELECT * FROM loans WHERE customer_id = ${c.id}`;
        if (loans.length === 0) {
           console.log(`   !! NO LOANS FOUND for ${c.name}`);
        } else {
           loans.forEach(l => console.log(`   -> Loan ID ${l.id}: Type=${l.loan_type}, Status=${l.status}`));
        }
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findMissing();
