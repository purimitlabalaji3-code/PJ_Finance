import sql from './db.js';

async function migrate() {
  console.log('🚀 Starting V2 Migration...');
  try {
    // 1. Add customer_code to customers
    await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_code TEXT UNIQUE`;
    console.log('✅ Added customer_code column to customers table');

    // 2. Add gmail to admin (for Google Login compatibility)
    await sql`ALTER TABLE admin ADD COLUMN IF NOT EXISTS gmail TEXT`;
    console.log('✅ Added gmail column to admin table');

    // 3. Populate existing customers with codes
    const customers = await sql`SELECT id FROM customers WHERE customer_code IS NULL ORDER BY id ASC`;
    for (let i = 0; i < customers.length; i++) {
      const code = `PJ-${String(i + 1).padStart(3, '0')}`;
      await sql`UPDATE customers SET customer_code = ${code} WHERE id = ${customers[i].id}`;
    }
    console.log(`✅ Populated ${customers.length} existing customers with sequential codes`);

    console.log('🎉 Migration V2 Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Failed:', err);
    process.exit(1);
  }
}

migrate();
