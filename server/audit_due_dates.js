import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_RPNY4L2zuWlI@ep-bold-thunder-am3uc2l8-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function audit() {
  const loans = await sql`
    SELECT 
      loan_code, 
      TO_CHAR(start_date, 'DD-Mon-YYYY') as start_date, 
      TO_CHAR(start_date + interval '15 days', 'DD-Mon-YYYY') as first_due,
      TO_CHAR(CURRENT_DATE, 'DD-Mon-YYYY') as today,
      (CURRENT_DATE - start_date::date) as days_passed,
      MOD((CURRENT_DATE - start_date::date), 15) as current_mod
    FROM loans 
    WHERE loan_type = '15-Day' AND status = 'Active'
    ORDER BY loan_code ASC
  `;
  console.log('--- 15-Day Loan Exact Math ---');
  console.table(loans);
}
audit();
