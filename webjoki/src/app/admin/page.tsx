'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();

  const [activePage, setActivePage] = useState<'orders' | 'users'>('orders');

  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // State untuk edit modal
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<{ email: string; nickname: string; role: string }>({
    email: '',
    nickname: '',
    role: 'user',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/auth/login');

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.role !== 'admin') return router.push('/');
        setIsAdmin(true);
        fetchOrders();
        fetchUsers();
      });
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');

    const res = await fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });

    setOrders(await res.json());
    setLoading(false);
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');

    const res = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers(await res.json());
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('token');

    await fetch(`/api/admin/orders?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    fetchOrders();
  };

  const rejectOrder = async (id: string) => {
    const confirmCancel = confirm('Batalkan order ini?');
    if (!confirmCancel) return;

    const token = localStorage.getItem('token');

    await fetch(`/api/admin/orders?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });

    fetchOrders();
  };

  const deleteUser = async (id: string) => {
    const confirmDelete = confirm('Yakin mau hapus user ini?');
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');

    await fetch(`/api/users?id=${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchUsers();
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditFormData({
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditFormData({ email: '', nickname: '', role: 'user' });
  };

  const updateUser = async () => {
    if (!editingUser) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/users?id=${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        closeEditModal();
        fetchUsers();
        alert('User updated successfully!');
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      alert('Error updating user: ' + error);
    }
  };

  // STATS
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const formatDate = (value: string | Date | null | undefined) => {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleString('id-ID');
  };

  if (!isAdmin) return <div className={styles.loading}>Checking...</div>;
  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.wrapper}>

      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <h2>⚡ Admin</h2>

        <div className={styles.menu}>
          <button
            onClick={() => setActivePage('orders')}
            className={activePage === 'orders' ? styles.active : ''}
          >
            Orders
          </button>

          <button
            onClick={() => setActivePage('users')}
            className={activePage === 'users' ? styles.active : ''}
          >
            Users
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>

        {/* TOPBAR */}
        <div className={styles.topbar}>
          <h1>
            {activePage === 'orders' ? 'Order Management' : 'User Management'}
          </h1>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => router.push('/')}
              style={{ background: '#22c55e' }}
            >
              Home
            </button>

            <button onClick={() => {
              localStorage.removeItem('token');
              router.push('/');
            }}>
              Logout
            </button>
          </div>
        </div>

        {/* ================= ORDERS ================= */}
        {activePage === 'orders' && (
          <>
            <div className={styles.stats}>
              <div className={styles.card}>
                <p>Total Orders</p>
                <h3>{totalOrders}</h3>
              </div>

              <div className={styles.card}>
                <p>Pending</p>
                <h3>{pendingOrders}</h3>
              </div>

              <div className={styles.card}>
                <p>Completed</p>
                <h3>{completedOrders}</h3>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Package</th>
                    <th>Game ID</th>
                    <th>Server</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td>
                        <div>{o.user_nickname || o.nickname || '-'}</div>
                        <small>{o.email || '-'}</small>
                      </td>
                      <td>{o.service_id}</td>
                      <td>{o.package_id}</td>
                      <td>{o.user_id_ml}</td>
                      <td>{o.server_id}</td>
                      <td>{o.payment_method}</td>

                      <td>
                        <span className={`${styles.badge} ${styles[o.status]}`}>
                          {o.status}
                        </span>
                      </td>

                      <td>{formatDate(o.created_at)}</td>

                      <td className={styles.actions}>
                        <button onClick={() => updateOrderStatus(o.id, 'completed')} className={styles.complete}>✔</button>
                        <button onClick={() => updateOrderStatus(o.id, 'processing')} className={styles.process}>⏳</button>
                        <button onClick={() => rejectOrder(o.id)} className={styles.delete}>❌</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ================= USERS ================= */}
        {activePage === 'users' && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nickname</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.nickname}</td>

                    <td>
                      <span className={styles.badge}>
                        {user.role}
                      </span>
                    </td>

                    <td>{formatDate(user.created_at)}</td>

                    <td className={styles.actions}>
                      <button 
                        onClick={() => openEditModal(user)}
                        className={styles.process}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteUser(user.id)}
                        className={styles.delete}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* ================= EDIT USER MODAL ================= */}
      {editingUser && (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Edit User</h2>
            
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="Email"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Nickname</label>
              <input
                type="text"
                value={editFormData.nickname}
                onChange={(e) => setEditFormData({ ...editFormData, nickname: e.target.value })}
                placeholder="Nickname"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Role</label>
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className={styles.modalActions}>
              <button onClick={updateUser} className={styles.save}>
                Save Changes
              </button>
              <button onClick={closeEditModal} className={styles.cancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
