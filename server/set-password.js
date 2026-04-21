// Sets the default admin password: Balaji@9885
// Run: node server/set-password.js

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const DEFAULT_PASSWORD = 'Balaji@9885';

async function run() {
  const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  
  // Upsert admin row
  const [existing] = await sql`SELECT id FROM admin LIMIT 1`;
  if (existing) {
    await sql`UPDATE admin SET password = ${hashed} WHERE id = ${existing.id}`;
    console.log('✅ Admin password updated');
  } else {
    await sql`INSERT INTO admin (username, password) VALUES ('admin', ${hashed})`;
    console.log('✅ Admin user created');
  }

  console.log('\n🔑 Login credentials:');
  console.log('   Email   : purimitlabalaji3@gmail.com');
  console.log('   Password: Balaji@9885');
  console.log('\n⚠️  Change this password from Settings after first login!');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
