const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  console.error('POSTGRES_URL or DATABASE_URL is required.');
  process.exit(1);
}

const sql = neon(connectionString);

async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      nickname VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user' NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      service_id VARCHAR(255) NOT NULL,
      package_id VARCHAR(255) NOT NULL,
      nickname VARCHAR(255) NOT NULL,
      user_id_ml VARCHAR(255) NOT NULL,
      server_id VARCHAR(255) NOT NULL,
      notes TEXT,
      payment_method VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending' NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)
  `;

  console.log('Database schema is ready.');
}

createTables().catch((error) => {
  console.error('Failed to create schema:', error);
  process.exit(1);
});
