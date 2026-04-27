// server/migrate-data.js — Try to copy data from old DB to new DB
import { neon } from '@neondatabase/serverless';

const OLD_URL = 'postgresql://neondb_owner:npg_qZUOGe4Y7lxm@ep-icy-mud-anbwx7nj.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require';
const NEW_URL = 'postgresql://neondb_owner:npg_Mjc0fh3ibKwN@ep-blue-block-amclg820-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const oldSql = neon(OLD_URL);
const newSql = neon(NEW_URL);

async function migrate() {
  console.log('🔄 Attempting to migrate data from OLD database to NEW database...');

  try {
    // 1. Fetch Customers
    console.log('Fetching customers...');
    const customers = await oldSql`SELECT * FROM customers`;
    console.log(`Found ${customers.length} customers.`);

    // 2. Fetch Loans
    console.log('Fetching loans...');
    const loans = await oldSql`SELECT * FROM loans`;
    console.log(`Found ${loans.length} loans.`);

    // 3. Fetch Collections
    console.log('Fetching collections...');
    const collections = await oldSql`SELECT * FROM collections`;
    console.log(`Found ${collections.length} collections.`);

    // --- INSERT INTO NEW DB ---
    console.log('\n📥 Inserting into NEW database...');

    // Customers
    for (const c of customers) {
      await newSql`
        INSERT INTO customers (id, name, phone, age, gender, aadhaar, address, status, image, join_date, customer_code)
        VALUES (${c.id}, ${c.name}, ${c.phone}, ${c.age}, ${c.gender}, ${c.aadhaar}, ${c.address}, ${c.status}, ${c.image}, ${c.join_date}, ${c.customer_code})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✅ Customers migrated');

    // Loans
    for (const l of loans) {
      await newSql`
        INSERT INTO loans (id, customer_id, loan_amount, interest, total_amount, daily_amount, start_date, status, paid_days, total_days, loan_code, loan_type)
        VALUES (${l.id}, ${l.customer_id}, ${l.loan_amount}, ${l.interest}, ${l.total_amount}, ${l.daily_amount}, ${l.start_date}, ${l.status}, ${l.paid_days}, ${l.total_days}, ${l.loan_code}, ${l.loan_type})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✅ Loans migrated');

    // Collections
    for (const col of collections) {
      await newSql`
        INSERT INTO collections (id, loan_id, customer_id, due_amount, paid_amount, date, status)
        VALUES (${col.id}, ${col.loan_id}, ${col.customer_id}, ${col.due_amount}, ${col.paid_amount}, ${col.date}, ${col.status})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('✅ Collections migrated');

    console.log('\n🎉 ALL DATA MIGRATED SUCCESSFULLY!');

  } catch (err) {
    console.error('\n❌ MIGRATION FAILED:', err.message);
    console.log('\n⚠️  Note: If the error says "Quota Exceeded", it means Neon has completely blocked access to your old data. You may need to upgrade the old project temporarily to get the data out.');
  } finally {
    process.exit(0);
  }
}

migrate();
