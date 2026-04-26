import { API_BASE_URL } from '../api';

const AdminDashboard = () => {
  // ...
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
      
      let issued = 0;
      if (transData.success) {
        issued = transData.data.filter(t => t.status === 'Issued').length;
      }
      
      setStats({
        totalBooks: booksData.success ? booksData.data.length : 0,
        issuedBooks: issued,
        pendingReturns: issued 
      });
      
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
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setUserForm({ username: user.username, email: user.email, role: user.role, password: '' });
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
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update user');
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
      if (res.ok) {
        fetchData();
      }
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
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lms_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateReport = (type) => {
    let reportData = [];
    if (type === 'Users') reportData = users;
    if (type === 'Transactions') reportData = stats; 
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lms_${type.toLowerCase()}_report.json`;
    a.click();
  };

  const columns = [
    { header: 'Username', accessor: 'username' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      cell: (row) => {
        let badgeClass = 'badge-success';
        if (row.role === 'Admin') badgeClass = 'badge-danger';
        if (row.role === 'Librarian') badgeClass = 'badge-warning';
        return <span className={`badge ${badgeClass}`}>{row.role}</span>;
      }
    },
    { header: 'Actions', cell: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleEditUser(row)}>Edit</button>
        <button className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', background: 'var(--danger)' }} onClick={() => handleDeleteUser(row._id)}>Delete</button>
      </div>
    )}
  ];

  const roleCount = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});
  
  const chartData = Object.keys(roleCount).map(key => ({
    name: key,
    Users: roleCount[key]
  }));

  return (
    <DashboardLayout role="Admin" title="Admin Overview">
      <div id="system" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={handleBackup} style={{ backgroundColor: '#10b981' }}>Backup Database</button>
        <button className="btn btn-primary" onClick={() => handleGenerateReport('Users')}>Export Users</button>
      </div>

      <div className="stat-cards-grid">
        <div className="stat-card">
          <span className="stat-card-title">Total Users</span>
          <span className="stat-card-value"><CountUp end={users.length} /></span>
        </div>
        <div className="stat-card">
          <span className="stat-card-title">Total Books</span>
          <span className="stat-card-value"><CountUp end={stats.totalBooks} /></span>
        </div>
        <div className="stat-card">
          <span className="stat-card-title">Active Issues</span>
          <span className="stat-card-value"><CountUp end={stats.issuedBooks} /></span>
        </div>
        <div className="stat-card">
          <span className="stat-card-title">Pending Returns</span>
          <span className="stat-card-value" style={{ color: 'var(--warning)' }}><CountUp end={stats.pendingReturns} /></span>
        </div>
      </div>

      <div id="reports" className="dashboard-section">
        <h3 style={{ marginBottom: '1.5rem' }}>System Analytics: User Distribution</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(11,15,25,0.9)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              <Bar dataKey="Users" fill="var(--secondary)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div id="users" className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>User Management</h3>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Add User</button>
        </div>
        <DataTable columns={columns} data={users} loading={loading} emptyMessage="No users found." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New User">
        <form className="modal-form" onSubmit={handleAddUser}>
          <div className="modal-form-group"><label>Username</label><input type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Email</label><input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Password</label><input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required minLength="6" /></div>
          <div className="modal-form-group">
            <label>Role</label>
            <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} required>
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

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
        <form className="modal-form" onSubmit={handleUpdateUser}>
          <div className="modal-form-group"><label>Username</label><input type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Email</label><input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required /></div>
          <div className="modal-form-group">
            <label>Role</label>
            <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} required>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Librarian">Librarian</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn-submit">Update User</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDashboard;
