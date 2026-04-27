const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const loadEnvFile = require('./load-env');

loadEnvFile();

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  console.error('POSTGRES_URL or DATABASE_URL is required.');
  process.exit(1);
}

const sql = neon(connectionString);

async function seed() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const user1Password = await bcrypt.hash('user1234', 10);
  const user2Password = await bcrypt.hash('joki1234', 10);

  await sql`DELETE FROM orders`;
  await sql`DELETE FROM users`;

  const [adminUser] = await sql`
    INSERT INTO users (email, password, nickname, role)
    VALUES ('admin@example.com', ${adminPassword}, 'AdminJoki', 'admin')
    RETURNING id
  `;

  const [userOne] = await sql`
    INSERT INTO users (email, password, nickname, role)
    VALUES ('user1@example.com', ${user1Password}, 'GamerOne', 'user')
    RETURNING id
  `;

  const [userTwo] = await sql`
    INSERT INTO users (email, password, nickname, role)
    VALUES ('user2@example.com', ${user2Password}, 'JokiPro', 'user')
    RETURNING id
  `;

  await sql`
    INSERT INTO orders (
      user_id, service_id, package_id, nickname, user_id_ml, server_id,
      notes, payment_method, status
    )
    VALUES
      (${userOne.id}, 'svc-classic', 'mid-tier', 'GamerOneML', 'GAMERONE123', 'IDN1', 'Minta booster fokus push rank ke Mythic.', 'OVO', 'processing'),
      (${userTwo.id}, 'svc-paketan', 'pk-5', 'ProCarry', 'PROCARRYDM', 'IDN2', 'Butuh bantuan untuk paketan Rising Open regional.', 'Dana', 'pending'),
      (${userOne.id}, 'svc-gendong', 'gd-2', 'GamerOneML', 'GAMERONE123', 'IDN1', 'Lagi butuh carry cepat untuk rank naik.', 'Bank Transfer', 'completed')
  `;

  console.log('Seed complete.');
  console.log('Admin: admin@example.com / admin123');
  console.log('Users: user1@example.com / user1234, user2@example.com / joki1234');
  console.log(`Admin user id: ${adminUser.id}`);
}

seed().catch((error) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});
