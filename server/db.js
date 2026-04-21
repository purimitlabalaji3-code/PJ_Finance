import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('⚠️  DATABASE_URL is not set — database queries will fail');
}

const sql = neon(process.env.DATABASE_URL || 'postgresql://localhost/dummy');
export default sql;
