import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, Book, Clock, AlertCircle, Database, Shield, 
  Activity, Download, Upload, FileText, Server, HardDrive, BarChart3, PieChart as PieIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { API_BASE_URL } from '../api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({ 
    totalBooks: 0, issuedBooks: 0, pendingReturns: 0, totalFines: 0,
    serverUptime: 0, memoryUsage: 0
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [systemLogs, setSystemLogs] = useState([]);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'Student' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [usersRes, booksRes, transRes, systemRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, { headers }),
        fetch(`${API_BASE_URL}/books`, { headers }),
        fetch(`${API_BASE_URL}/transactions`, { headers }),
        fetch(`${API_BASE_URL}/system/stats`, { headers }),
        fetch(`${API_BASE_URL}/system/logs`, { headers })
      ]);
      
      const usersData = await usersRes.json();
      const booksData = await booksRes.json();
      const transData = await transRes.json();
      const sysData = await systemRes.json();
      const logsData = await logsRes.json();
      
      if (usersData.success) setUsers(usersData.data);
      if (booksData.success) setBooks(booksData.data);
      if (sysData.success) setStats(prev => ({ ...prev, ...sysData.data }));
      if (logsData.success) setSystemLogs(logsData.data);
      
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

  const handleExportCSV = (data, filename) => {
    if (!data.length) return alert("No data to export");
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Account created for ${userForm.username}!`);
        setIsModalOpen(false);
        setUserForm({ username: '', email: '', password: '', role: 'Student' });
        fetchData();
      } else {
        alert("❌ Failed: " + (data.error || "Could not create account"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Network error. Please try again.");
    }
  };

  const inventoryHealthData = [
    { name: 'Good', value: books.filter(b => b.status === 'Good').length || 10, color: '#10b981' },
    { name: 'Damaged', value: books.filter(b => b.status === 'Damaged').length || 2, color: '#f59e0b' },
    { name: 'Lost', value: books.filter(b => b.status === 'Lost').length || 1, color: '#ef4444' },
  ];

  const topBooksData = books.slice(0, 5).map(b => ({
    name: b.title.substring(0, 15) + '...',
    borrows: Math.floor(Math.random() * 50) + 10 // Mock ranking
  })).sort((a,b) => b.borrows - a.borrows);

  const columns = [
    { 
      header: 'User', 
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="user-avatar-small">{row.username[0].toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: '600' }}>{row.username}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{row.email}</div>
          </div>
        </div>
      )
    },
    { header: 'Role', cell: (row) => <span className={`badge badge-${row.role.toLowerCase()}`}>{row.role}</span> },
    { header: 'Status', cell: (row) => <span style={{ color: row.isActive !== false ? '#10b981' : '#ef4444' }}>● {row.isActive !== false ? 'Active' : 'Disabled'}</span> }
  ];

  return (
    <DashboardLayout role="Admin" title="Administrator Control Panel">
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper primary"><Book size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Total Inventory</span>
            <span className="stat-card-value">{stats.totalBooks}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper secondary"><Users size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Active Members</span>
            <span className="stat-card-value">{users.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper success"><Activity size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Revenue (Fines)</span>
            <span className="stat-card-value">${stats.totalFines}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper danger"><AlertCircle size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Overdue Alert</span>
            <span className="stat-card-value">{stats.pendingReturns}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {/* User Management Section */}
        <div className="dashboard-section" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={20} /> User Control</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> New Admin/User
            </button>
          </div>
          <DataTable columns={columns} data={users} loading={loading} />
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button className="btn btn-outline btn-sm" onClick={() => handleExportCSV(users, 'User_Report')}>
              <Download size={14} /> Download PDF/CSV
            </button>
          </div>
        </div>

        {/* System & Health */}
        <div className="dashboard-section">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><PieIcon size={20} /> Inventory Health</h3>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={inventoryHealthData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {inventoryHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.8rem' }}>
            {inventoryHealthData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }}></div>
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking & Analytics */}
        <div className="dashboard-section" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><BarChart3 size={20} /> Top Borrowed Titles</h3>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={topBooksData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={10} width={100} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#18181b', border: 'none' }} />
                <Bar dataKey="borrows" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Monitor */}
        <div className="dashboard-section">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><Activity size={20} /> Server Monitor</h3>
          <div className="monitor-stats" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="glass" style={{ padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>Uptime</span> <strong>{Math.floor(stats.serverUptime / 3600)}h {Math.floor((stats.serverUptime % 3600) / 60)}m</strong>
            </div>
            <div className="glass" style={{ padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>Load</span> <strong>{Math.round(stats.memoryUsage / 1024 / 1024)} MB</strong>
            </div>
            <div className="logs-container glass" style={{ height: '140px', overflowY: 'auto', padding: '0.5rem', fontSize: '0.65rem', marginTop: '0.5rem' }}>
              {systemLogs.slice(0, 10).map((log, i) => (
                <div key={i} style={{ marginBottom: '0.3rem', opacity: 0.8 }}>
                   <span style={{ color: 'var(--primary)' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Account">
        <form className="modal-form" onSubmit={handleAddUser}>
          <div className="modal-form-group">
            <label>Username</label>
            <input type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required placeholder="e.g. jdoe2025" />
          </div>
          <div className="modal-form-group">
            <label>Email Address</label>
            <input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required placeholder="jdoe@university.edu" />
          </div>
          <div className="modal-form-group">
            <label>Password</label>
            <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required placeholder="Min. 6 characters" />
          </div>
          <div className="modal-form-group">
            <label>Role</label>
            <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Librarian">Librarian</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn-submit">Create Account</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDashboard;
