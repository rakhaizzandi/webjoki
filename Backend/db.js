const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Create SQL client for Vercel Postgres/Neon
const sql = neon(process.env.POSTGRES_URL || process.env.DATABASE_URL);

module.exports = sql;