/**
 * User model for Vercel Postgres/Neon
 * Compatible with existing auth routes
 */

const sql = require('./db');
const bcrypt = require('bcryptjs');

const User = {
  // Find user by email
  async findByEmail(email) {
    const [user] = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return user;
  },

  // Find user by ID
  async findById(id) {
    const [user] = await sql`
      SELECT id, email, nickname, role, created_at 
      FROM users WHERE id = ${id}
    `;
    return user;
  },

  // Create new user
  async create(userData) {
    const { email, password, nickname, role = 'user' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [newUser] = await sql`
      INSERT INTO users (email, password, nickname, role)
      VALUES (${email}, ${hashedPassword}, ${nickname}, ${role})
      RETURNING id, email, nickname, role, created_at
    `;
    return newUser;
  },

  // Get all users (admin)
  async getAll() {
    return await sql`
      SELECT id, email, nickname, role, created_at 
      FROM users ORDER BY created_at DESC
    `;
  },

  // Update user
  async update(id, userData) {
    const { nickname, role } = userData;
    const [updatedUser] = await sql`
      UPDATE users 
      SET nickname = COALESCE(${nickname}, nickname),
          role = COALESCE(${role}, role)
      WHERE id = ${id}
      RETURNING id, email, nickname, role, created_at
    `;
    return updatedUser;
  },

  // Delete user
  async delete(id) {
    await sql`DELETE FROM users WHERE id = ${id}`;
    return { message: 'User deleted successfully' };
  },

  // Compare password
  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = User;
