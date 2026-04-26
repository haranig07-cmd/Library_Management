import { API_BASE_URL } from '../api';
import './DashboardLayout.css';

const DashboardLayout = ({ children, role, title }) => {
  // ...
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
        fetchNotifications();
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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const getSidebarLinks = () => {
    const dashboardPath = `/${role.toLowerCase()}-dashboard`;
    switch(role) {
      case 'Admin':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: dashboardPath },
          { name: 'Users', icon: Users, path: '#users' },
          { name: 'Reports', icon: FileText, path: '#reports' },
          { name: 'System', icon: Settings, path: '#system' },
        ];
      case 'Librarian':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: dashboardPath },
          { name: 'Inventory', icon: BookOpen, path: '#inventory' },
          { name: 'Transactions', icon: Clock, path: '#transactions' },
          { name: 'Requests', icon: Bell, path: '#requests' },
        ];
      case 'Faculty':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: dashboardPath },
          { name: 'Catalog', icon: BookOpen, path: '#catalog' },
          { name: 'History', icon: Clock, path: '#history' },
          { name: 'Recommend', icon: FileText, path: '#recommend' },
        ];
      case 'Student':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: dashboardPath },
          { name: 'Search', icon: BookOpen, path: '#search' },
          { name: 'Borrowed', icon: Clock, path: '#borrowed' },
        ];
      default:
        return [];
    }
  };

  const links = getSidebarLinks();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const scrollToSection = (e, path) => {
    if (path.startsWith('#')) {
      e.preventDefault();
      const id = path.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>EduLib</h3>
          <button className="mobile-close-btn" onClick={toggleSidebar}><X size={20} /></button>
        </div>
        
        <nav className="sidebar-nav">
          {links.map((link, index) => {
            const Icon = link.icon;
            const isActive = link.path.startsWith('#') ? false : location.pathname === link.path;
            return (
              <Link 
                to={link.path} 
                key={index} 
                className={`sidebar-link ${isActive ? 'active' : ''}`} 
                onClick={(e) => scrollToSection(e, link.path)}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /><span>Logout</span></button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar glass">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={toggleSidebar}><Menu size={22} /></button>
            <h2 className="dashboard-title">{title}</h2>
          </div>
          
          <div className="topbar-right">
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={markRead}>
                <Bell size={18} />
                {unreadCount > 0 && <span className="badge-dot" />}
              </button>
              
              {notifOpen && (
                <div className="notification-dropdown glass">
                  <div className="dropdown-header">Notifications</div>
                  <div className="dropdown-body">
                    {notifications.length === 0 ? <p className="empty-notif">No notifications</p> :
                      notifications.map(n => (
                        <div key={n._id} className={`notif-item ${n.isRead ? 'read' : 'unread'}`}>
                          <p>{n.message}</p>
                          <small>{new Date(n.createdAt).toLocaleTimeString()}</small>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
            <Link to="/profile" className="user-profile-link">
              <div className="user-profile">
                <div className="user-avatar">{userData.username?.charAt(0).toUpperCase()}</div>
                <div className="user-info">
                  <span className="user-name">{userData.username}</span>
                  <span className="user-role">{role}</span>
                </div>
              </div>
            </Link>
          </div>
        </header>

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
