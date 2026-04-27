import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_Mjc0fh3ibKwN@ep-blue-block-amclg820-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function trigger() {
  const date = '2026-04-27';
  console.log(`🚀 Manually triggering collection generation for ${date}...`);
  
  try {
    const result = await sql`
      INSERT INTO collections (loan_id, customer_id, due_amount, date)
      SELECT id, customer_id, daily_amount, ${date}
      FROM loans l
      WHERE status = 'Active'
        AND NOT EXISTS (
          SELECT 1 FROM collections c 
          WHERE c.loan_id = l.id AND c.date = ${date}
        )
      RETURNING *
    `;
    console.log(`✅ Generated ${result.length} collections for today!`);
  } catch (err) {
    console.error('❌ Error generating collections:', err.message);
  } finally {
    process.exit(0);
  }
}
trigger();
