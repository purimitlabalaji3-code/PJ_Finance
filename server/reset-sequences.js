import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_Mjc0fh3ibKwN@ep-blue-block-amclg820-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function fixSequences() {
  console.log('🔄 Resetting SERIAL sequences...');
  try {
    await sql`SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers))`;
    await sql`SELECT setval('loans_id_seq', (SELECT MAX(id) FROM loans))`;
    await sql`SELECT setval('collections_id_seq', (SELECT MAX(id) FROM collections))`;
    console.log('✅ Sequences reset successfully!');
  } catch (err) {
    console.error('❌ Error resetting sequences:', err.message);
  } finally {
    process.exit(0);
  }
}
fixSequences();
