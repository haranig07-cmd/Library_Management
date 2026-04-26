import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Bell, LogOut, User, LayoutDashboard, 
  Users, BookOpen, FileText, Database, Clock, Settings
} from 'lucide-react';
import { API_BASE_URL } from '../api';
import './DashboardLayout.css';

const DashboardLayout = ({ children, role, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setNotifications(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && notifications.some(n => !n.isRead)) {
      try {
        await fetch(`${API_BASE_URL}/notifications/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = {
    Admin: [
      { path: '/admin-dashboard', icon: LayoutDashboard, label: 'Overview' },
      { path: '/admin-dashboard#users', icon: Users, label: 'Users' },
      { path: '/admin-dashboard#system', icon: Settings, label: 'System' },
    ],
    Librarian: [
      { path: '/librarian-dashboard', icon: LayoutDashboard, label: 'Control Center' },
      { path: '/librarian-dashboard#inventory', icon: BookOpen, label: 'Books' },
      { path: '/librarian-dashboard#transactions', icon: FileText, label: 'History' },
    ],
    Faculty: [
      { path: '/faculty-dashboard', icon: LayoutDashboard, label: 'Portal' },
      { path: '/faculty-dashboard#history', icon: Clock, label: 'Borrowed' },
    ],
    Student: [
      { path: '/student-dashboard', icon: LayoutDashboard, label: 'Resources' },
      { path: '/student-dashboard#history', icon: Clock, label: 'History' },
    ]
  };

  const currentMenu = menuItems[role] || [];

  return (
    <div className="dashboard-wrapper">
      {/* Mobile Backdrop */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">E</div>
            <span>EduLib</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Main Menu</div>
          {currentMenu.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
          
          <div className="nav-section">Account</div>
          <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
            <User size={20} />
            <span>Profile Settings</span>
          </Link>
          <button onClick={handleLogout} className="nav-item logout-btn">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="page-title">{title}</h2>
          </div>

          <div className="topbar-right">
            {/* Notifications */}
            <div className="notifications-container">
              <button className="topbar-btn" onClick={markRead}>
                <Bell size={20} />
                {notifications.some(n => !n.isRead) && <span className="notif-badge"></span>}
              </button>
              
              {notifOpen && (
                <div className="notif-dropdown glass animate-slide-up">
                  <div className="notif-header">Notifications</div>
                  <div className="notif-list">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                          <div className="notif-icon"><Bell size={14} /></div>
                          <div className="notif-content">
                            <p>{n.message}</p>
                            <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="notif-empty">No new notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-profile-badge" onClick={() => navigate('/profile')}>
              <div className="avatar">{userData.username?.[0]?.toUpperCase() || 'U'}</div>
              <div className="user-info">
                <span className="username">{userData.username}</span>
                <span className="user-role">{role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
