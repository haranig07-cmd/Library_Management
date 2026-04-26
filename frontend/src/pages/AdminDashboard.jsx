import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, Book, Clock, AlertCircle, Database, Shield, 
  Activity, Download, Upload, FileText, Server, HardDrive 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { API_BASE_URL } from '../api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ 
    totalBooks: 0, 
    issuedBooks: 0, 
    pendingReturns: 0,
    totalFines: 0,
    serverUptime: 0,
    memoryUsage: 0
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
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
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

  const handleBulkImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const usersToImport = lines.slice(1).filter(l => l.trim()).map(line => {
        const values = line.split(',');
        return {
          username: values[0],
          email: values[1],
          password: values[2] || 'password123',
          role: values[3] || 'Student'
        };
      });

      try {
        const res = await fetch(`${API_BASE_URL}/users/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(usersToImport)
        });
        const data = await res.json();
        if (data.success) {
          alert(`Successfully imported ${data.count} users!`);
          fetchData();
        } else {
          alert("Import failed: " + data.error);
        }
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

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

  const chartData = [
    { name: 'Books', value: stats.totalBooks, color: '#6366f1' },
    { name: 'Issued', value: stats.issuedBooks, color: '#10b981' },
    { name: 'Fines ($)', value: stats.totalFines, color: '#ef4444' },
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
      cell: (row) => <span className={`badge badge-${row.role.toLowerCase()}`}>{row.role}</span>
    },
    {
      header: 'Status',
      cell: (row) => <span style={{ color: row.isActive !== false ? '#10b981' : '#ef4444' }}>● {row.isActive !== false ? 'Active' : 'Disabled'}</span>
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
          <div className="stat-icon-wrapper success"><Activity size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Total Fines</span>
            <span className="stat-card-value">${stats.totalFines}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper danger"><AlertCircle size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Pending Returns</span>
            <span className="stat-card-value">{stats.pendingReturns}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={20} /> User Management</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={16} /> Import CSV
                <input type="file" accept=".csv" onChange={handleBulkImport} style={{ display: 'none' }} />
              </label>
              <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} /> New User
              </button>
            </div>
          </div>
          <DataTable columns={columns} data={users} loading={loading} />
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button className="btn btn-outline btn-sm" onClick={() => handleExportCSV(users, 'User_Report')}>
              <Download size={16} /> Export User List
            </button>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><Activity size={20} /> System Monitoring</h3>
          <div className="monitor-stats" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass" style={{ padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><Server size={18} color="var(--primary)" /> <span>Uptime</span></div>
              <span style={{ fontWeight: '700' }}>{Math.floor(stats.serverUptime / 3600)}h {Math.floor((stats.serverUptime % 3600) / 60)}m</span>
            </div>
            <div className="glass" style={{ padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><HardDrive size={18} color="var(--secondary)" /> <span>RAM Usage</span></div>
              <span style={{ fontWeight: '700' }}>{Math.round(stats.memoryUsage / 1024 / 1024)} MB</span>
            </div>
            
            <h4 style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>System Logs</h4>
            <div className="logs-container glass" style={{ height: '180px', overflowY: 'auto', padding: '0.5rem', fontSize: '0.75rem', borderRadius: '8px' }}>
              {systemLogs.map((log, i) => (
                <div key={i} style={{ marginBottom: '0.4rem', borderLeft: `2px solid ${log.level === 'WARN' ? '#ef4444' : '#3b82f6'}`, paddingLeft: '0.5rem' }}>
                  <span style={{ opacity: 0.5 }}>{new Date(log.timestamp).toLocaleTimeString()}</span> - <strong style={{ color: log.level === 'WARN' ? '#ef4444' : '#60a5fa' }}>{log.level}</strong>: {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Account">
        <form className="modal-form" onSubmit={handleAddUser}>
          <div className="modal-form-group"><label>Username</label><input type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Email Address</label><input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Password</label><input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required /></div>
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
            <button type="submit" className="modal-btn modal-btn-submit">Create User</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDashboard;
