const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const User = require('./models/User');
const Order = require('./models/Order');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/webjoki';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    await Order.deleteMany({});
    await User.deleteMany({});

    const adminPassword = await bcrypt.hash('admin123', 10);
    const user1Password = await bcrypt.hash('user1234', 10);
    const user2Password = await bcrypt.hash('joki1234', 10);

    const adminUser = await User.create({
      email: 'admin@example.com',
      password: adminPassword,
      nickname: 'AdminJoki',
      role: 'admin',
    });

    const userOne = await User.create({
      email: 'user1@example.com',
      password: user1Password,
      nickname: 'GamerOne',
      role: 'user',
    });

    const userTwo = await User.create({
      email: 'user2@example.com',
      password: user2Password,
      nickname: 'JokiPro',
      role: 'user',
    });

    const orders = await Order.insertMany([
      {
        userId: userOne._id,
        serviceId: 'svc-classic',
        packageId: 'mid-tier',
        nickname: 'GamerOneML',
        userIdML: 'GAMERONE123',
        serverId: 'IDN1',
        notes: 'Minta booster fokus push rank ke Mythic.',
        paymentMethod: 'OVO',
        status: 'processing',
      },
      {
        userId: userTwo._id,
        serviceId: 'svc-paketan',
        packageId: 'pk-5',
        nickname: 'ProCarry',
        userIdML: 'PROCARRYDM',
        serverId: 'IDN2',
        notes: 'Butuh bantuan untuk paketan Rising Open regional.',
        paymentMethod: 'Dana',
        status: 'pending',
      },
      {
        userId: userOne._id,
        serviceId: 'svc-gendong',
        packageId: 'gd-2',
        nickname: 'GamerOneML',
        userIdML: 'GAMERONE123',
        serverId: 'IDN1',
        notes: 'Lagi butuh carry cepat untuk rank naik.',
        paymentMethod: 'Bank Transfer',
        status: 'completed',
      },
    ]);

    console.log('Seed complete!');
    console.log('Users:');
    console.log(`  - admin@example.com / admin123`);
    console.log(`  - user1@example.com / user1234`);
    console.log(`  - user2@example.com / joki1234`);
    console.log(`Orders created: ${orders.length}`);
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
