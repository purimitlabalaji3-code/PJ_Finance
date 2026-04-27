import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_RPNY4L2zuWlI@ep-bold-thunder-am3uc2l8-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function check() {
  const c = await sql`SELECT COUNT(*) FROM customers`;
  const l = await sql`SELECT COUNT(*) FROM loans`;
  const cl = await sql`SELECT COUNT(*) FROM collections`;
  const s = await sql`SELECT key, value FROM settings`;
  console.log('Final Counts:', { customers: c[0].count, loans: l[0].count, collections: cl[0].count });
  console.log('Settings Check:', s.filter(x => x.key === 'company_name'));
}
check();
