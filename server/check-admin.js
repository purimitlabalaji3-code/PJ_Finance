import sql from './db.js';
try {
  const admins = await sql`SELECT * FROM admin`;
  console.log('Admins in DB:', admins);
} catch (err) {
  console.error('Error:', err);
}
process.exit();
