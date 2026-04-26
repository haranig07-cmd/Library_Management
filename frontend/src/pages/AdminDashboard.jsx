import React, { useState, useEffect } from 'react';
import { Plus, Users, Book, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { API_BASE_URL } from '../api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalBooks: 0, issuedBooks: 0, pendingReturns: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'Student' });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setUserForm({ username: user.username, email: user.email, password: '', role: user.role });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/users/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackup = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/system/backup`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("System backup created successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = [
    { name: 'Books', count: stats.totalBooks },
    { name: 'Issued', count: stats.issuedBooks },
    { name: 'Overdue', count: stats.pendingReturns },
    { name: 'Users', count: users.length },
  ];

  const columns = [
    { header: 'Username', accessor: 'username' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', cell: (row) => <span className={`badge ${row.role === 'Admin' ? 'badge-danger' : 'badge-primary'}`}>{row.role}</span> },
    { header: 'Actions', cell: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => handleEditUser(row)} className="btn-icon">Edit</button>
        {row.role !== 'Admin' && <button onClick={() => handleDeleteUser(row._id)} className="btn-icon btn-icon-danger">Delete</button>}
      </div>
    )}
  ];

  return (
    <DashboardLayout role="Admin" title="Administrator Dashboard">
      <div className="stat-cards-grid">
        <div className="stat-card">
          <Book className="stat-icon" />
          <span className="stat-card-title">Library Inventory</span>
          <span className="stat-card-value">{stats.totalBooks}</span>
        </div>
        <div className="stat-card">
          <Users className="stat-icon" />
          <span className="stat-card-title">Total Registered</span>
          <span className="stat-card-value">{users.length}</span>
        </div>
        <div className="stat-card">
          <Clock className="stat-icon" />
          <span className="stat-card-title">Active Issues</span>
          <span className="stat-card-value">{stats.issuedBooks}</span>
        </div>
        <div className="stat-card">
          <AlertCircle className="stat-icon" style={{ color: '#ef4444' }} />
          <span className="stat-card-title">Overdue Alerts</span>
          <span className="stat-card-value">{stats.pendingReturns}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section main-stats">
          <h3>System Analytics</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>User Management</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline" onClick={handleBackup}>Backup System</button>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={18} /> New User</button>
            </div>
          </div>
          <DataTable columns={columns} data={users} loading={loading} />
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New User">
        <form className="modal-form" onSubmit={handleAddUser}>
          <div className="modal-form-group"><label>Username</label><input type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Email Address</label><input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Initial Password</label><input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required /></div>
          <div className="modal-form-group">
            <label>Role Access</label>
            <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Librarian">Librarian</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn-submit">Create User</button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User Account">
        <form className="modal-form" onSubmit={handleUpdateUser}>
          <div className="modal-form-group"><label>Username</label><input type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Email Address</label><input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required /></div>
          <div className="modal-form-group">
            <label>Update Role</label>
            <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Librarian">Librarian</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn-submit">Save Changes</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDashboard;
