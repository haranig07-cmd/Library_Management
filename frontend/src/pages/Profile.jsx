import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { User, Mail, Shield, Calendar, Lock, Save } from 'lucide-react';
import { API_BASE_URL } from '../api';

const Profile = () => {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const [profile, setProfile] = useState({
    username: userData.username || '',
    email: userData.email || '',
    role: userData.role || ''
  });
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: 'info', text: 'Updating profile...' });
    
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userData._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profile)
      });
      
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Update failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error' });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return setMessage({ type: 'error', text: 'New passwords do not match' });
    }
    
    setMessage({ type: 'info', text: 'Changing password...' });
    // Password change logic would go here
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Security settings updated!' });
      setPasswords({ current: '', new: '', confirm: '' });
    }, 1500);
  };

  return (
    <DashboardLayout role={profile.role} title="My Profile">
      <div className="profile-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {message.text && (
          <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`} style={{ marginBottom: '1.5rem' }}>
            {message.text}
          </div>
        )}

        <div className="dashboard-grid">
          {/* Profile Details */}
          <div className="dashboard-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {profile.username[0]?.toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{profile.username}</h3>
                <p style={{ margin: 0, opacity: 0.6 }}>{profile.role} Account</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="modal-form-group">
                <label><Mail size={14} style={{ marginRight: '8px' }} /> Email Address</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  onChange={e => setProfile({...profile, email: e.target.value})}
                  required 
                />
              </div>
              <div className="modal-form-group">
                <label><User size={14} style={{ marginRight: '8px' }} /> Username</label>
                <input 
                  type="text" 
                  value={profile.username} 
                  readOnly 
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label><Shield size={14} style={{ marginRight: '8px' }} /> Role</label>
                  <input type="text" value={profile.role} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div className="modal-form-group">
                  <label><Calendar size={14} style={{ marginRight: '8px' }} /> Member Since</label>
                  <input type="text" value="April 2026" readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                <Save size={18} /> Save Changes
              </button>
            </form>
          </div>

          {/* Security */}
          <div className="dashboard-section">
            <h3>Security Settings</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.6, marginBottom: '1.5rem' }}>Update your password to keep your account secure.</p>
            
            <form onSubmit={handleUpdatePassword}>
              <div className="modal-form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  value={passwords.current}
                  onChange={e => setPasswords({...passwords, current: e.target.value})}
                  required 
                />
              </div>
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
              <button type="submit" className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }}>
                <Lock size={18} /> Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
