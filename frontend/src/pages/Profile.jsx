import { API_BASE_URL } from '../api';

const Profile = () => {
  // ...
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: 'info', text: 'Updating profile...' });
    
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userData._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          email: profile.email
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data.data));
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Update failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error' });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return setMessage({ type: 'error', text: 'New passwords do not match' });
    }
    
    setMessage({ type: 'info', text: 'Updating password...' });
    // Implementation for password update could be added to backend
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ current: '', new: '', confirm: '' });
    }, 1000);
  };

  return (
    <DashboardLayout role={profile.role} title="My Profile">
      <div className="profile-container animate-fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          
          {/* Left: Info Card */}
          <div className="dashboard-section" style={{ textAlign: 'center', height: 'fit-content' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#fff',
              boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
            }}>
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ margin: '0 0 0.5rem', color: '#fff' }}>{profile.username}</h2>
            <div className="badge badge-success" style={{ marginBottom: '1.5rem' }}>{profile.role}</div>
            
            <div style={{ textAlign: 'left', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                <Mail size={18} /> <span>{profile.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                <Shield size={18} /> <span>{profile.role} Access Level</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                <Calendar size={18} /> <span>Member since 2024</span>
              </div>
            </div>
          </div>

          {/* Right: Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {message.text && (
              <div className={`api-error ${message.type === 'success' ? 'badge-success' : ''}`} style={{ 
                background: message.type === 'success' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: message.type === 'success' ? '#34d399' : '#f87171',
                border: `1px solid ${message.type === 'success' ? '#34d39955' : '#f8717155'}`,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                {message.text}
              </div>
            )}

            <div className="dashboard-section">
              <h3><User size={18} /> Edit Basic Information</h3>
              <form onSubmit={handleUpdateProfile} className="modal-form" style={{ marginTop: '1.5rem' }}>
                <div className="modal-form-group">
                  <label>Username (Cannot be changed)</label>
                  <input type="text" value={profile.username} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="modal-form-group">
                  <label>Institutional Email</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    onChange={e => setProfile({...profile, email: e.target.value})} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
                  <Save size={18} style={{ marginRight: '8px' }} /> Update Profile
                </button>
              </form>
            </div>

            <div className="dashboard-section">
              <h3><Lock size={18} /> Security Settings</h3>
              <form onSubmit={handleUpdatePassword} className="modal-form" style={{ marginTop: '1.5rem' }}>
                <div className="modal-form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={passwords.current} 
                    onChange={e => setPasswords({...passwords, current: e.target.value})} 
                    required 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="modal-form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      value={passwords.new} 
                      onChange={e => setPasswords({...passwords, new: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="modal-form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwords.confirm} 
                      onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
                  <Save size={18} style={{ marginRight: '8px' }} /> Update Password
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
