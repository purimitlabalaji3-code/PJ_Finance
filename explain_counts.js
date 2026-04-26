import sql from './server/db.js';

async function checkDuplicates() {
  try {
    console.log('--- AUDITING CUSTOMERS VS LOANS ---');
    
    const customers = await sql`SELECT id, name, customer_code FROM customers`;
    const loans = await sql`SELECT id, customer_id, loan_type FROM loans`;
    
    console.log(`Total Customers: ${customers.length}`);
    console.log(`Total Loans: ${loans.length}`);
    
    // Find customers with more than one loan
    const loanCounts = {};
    loans.forEach(l => {
      loanCounts[l.customer_id] = (loanCounts[l.customer_id] || 0) + 1;
    });
    
    console.log('\nCustomers with Multiple Loans:');
    let multiCount = 0;
    for (const cid in loanCounts) {
      if (loanCounts[cid] > 1) {
        const cust = customers.find(c => c.id == cid);
        console.log(` - ${cust ? cust.name : 'Unknown'} (${cust ? cust.customer_code : cid}): ${loanCounts[cid]} loans`);
        multiCount++;
      }
    }
    
    if (multiCount === 0) {
      console.log('None found.');
    } else {
      console.log(`\nExplanation: ${multiCount} customers have multiple loans, which is why your loan count (47) is higher than your customer count (44).`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDuplicates();
