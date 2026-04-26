import React, { useState, useEffect } from 'react';
import { Plus, Users, Book, Clock, AlertCircle, Database, Shield, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { API_BASE_URL } from '../api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalBooks: 0, issuedBooks: 0, pendingReturns: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'Student' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [usersRes, booksRes, transRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, { headers }),
        fetch(`${API_BASE_URL}/books`, { headers }),
        fetch(`${API_BASE_URL}/transactions`, { headers })
      ]);
      
      const usersData = await usersRes.json();
      const booksData = await booksRes.json();
      const transData = await transRes.json();
      
      if (usersData.success) setUsers(usersData.data);
      if (booksData.success) {
        const total = booksData.data.reduce((acc, b) => acc + b.totalCopies, 0);
        setStats(prev => ({ ...prev, totalBooks: total }));
      }
      if (transData.success) {
        setStats(prev => ({ 
          ...prev, 
          issuedBooks: transData.data.filter(t => t.status === 'Issued').length,
          pendingReturns: transData.data.filter(t => t.status === 'Overdue').length
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setUserForm({ username: '', email: '', password: '', role: 'Student' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = [
    { name: 'Total Books', value: stats.totalBooks, color: '#6366f1' },
    { name: 'Issued', value: stats.issuedBooks, color: '#10b981' },
    { name: 'Overdue', value: stats.pendingReturns, color: '#ef4444' },
    { name: 'Users', value: users.length, color: '#f59e0b' },
  ];

  const columns = [
    { 
      header: 'User', 
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="user-avatar-small">{row.username[0].toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: '500' }}>{row.username}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{row.email}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Role', 
      cell: (row) => (
        <span className={`badge badge-${row.role.toLowerCase()}`}>
          {row.role}
        </span>
      )
    },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {row.role !== 'Admin' && (
            <button onClick={() => handleDeleteUser(row._id)} className="btn-icon btn-icon-danger">
              <Activity size={14} /> Delete
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <DashboardLayout role="Admin" title="Administrator Control Panel">
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper primary"><Book size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Library Inventory</span>
            <span className="stat-card-value">{stats.totalBooks}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper secondary"><Users size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Active Users</span>
            <span className="stat-card-value">{users.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper success"><Clock size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Books Issued</span>
            <span className="stat-card-value">{stats.issuedBooks}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper danger"><AlertCircle size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Overdue Alerts</span>
            <span className="stat-card-value">{stats.pendingReturns}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
        <div className="dashboard-section main-stats" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>System Analytics</h3>
            <div className="badge badge-success">Real-time Data</div>
          </div>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-section" style={{ gridColumn: 'span 3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={20} className="text-primary" />
              <h3 style={{ margin: 0 }}>User Management</h3>
            </div>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> New Account
            </button>
          </div>
          <DataTable columns={columns} data={users} loading={loading} />
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Account">
        <form className="modal-form" onSubmit={handleAddUser}>
          <div className="modal-form-group"><label>Username</label><input type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required placeholder="e.g. jdoe_admin" /></div>
          <div className="modal-form-group"><label>Email Address</label><input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required placeholder="jdoe@university.edu" /></div>
          <div className="modal-form-group"><label>Initial Password</label><input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required /></div>
          <div className="modal-form-group">
            <label>Access Level</label>
            <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
              <option value="Student">Student (Default)</option>
              <option value="Faculty">Faculty Member</option>
              <option value="Librarian">Librarian</option>
              <option value="Admin">Administrator</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn-submit">Initialize Account</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDashboard;
