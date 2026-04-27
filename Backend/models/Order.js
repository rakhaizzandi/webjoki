/**
 * Order model for Vercel Postgres/Neon
 * Compatible with existing orders routes
 */

const sql = require('./db');

const Order = {
  // Create new order
  async create(orderData) {
    const { 
      userId, serviceId, packageId, nickname, 
      userIdML, serverId, notes, paymentMethod, status = 'pending' 
    } = orderData;
    
    const [newOrder] = await sql`
      INSERT INTO orders (user_id, service_id, package_id, nickname, user_id_ml, server_id, notes, payment_method, status)
      VALUES (${userId}, ${serviceId}, ${packageId}, ${nickname}, ${userIdML}, ${serverId}, ${notes}, ${paymentMethod}, ${status})
      RETURNING *
    `;
    return newOrder;
  },

  // Find order by ID
  async findById(id) {
    const [order] = await sql`
      SELECT * FROM orders WHERE id = ${id}
    `;
    return order;
  },

  // Get all orders (admin)
  async getAll() {
    return await sql`
      SELECT o.*, u.email, u.nickname as user_nickname
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
  },

  // Get orders by user ID
  async findByUserId(userId) {
    return await sql`
      SELECT * FROM orders WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  },

  // Update order status
  async updateStatus(id, status) {
    const [updatedOrder] = await sql`
      UPDATE orders 
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;
    return updatedOrder;
  },

  // Update order
  async update(id, orderData) {
    const { status, notes } = orderData;
    const [updatedOrder] = await sql`
      UPDATE orders 
      SET status = COALESCE(${status}, status),
          notes = COALESCE(${notes}, notes)
      WHERE id = ${id}
      RETURNING *
    `;
    return updatedOrder;
  },

  // Delete order
  async delete(id) {
    await sql`DELETE FROM orders WHERE id = ${id}`;
    return { message: 'Order deleted successfully' };
  }
};

module.exports = Order;