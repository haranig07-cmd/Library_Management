import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Login from './pages/Login';

import AdminDashboard from './pages/AdminDashboard';
import LibrarianDashboard from './pages/LibrarianDashboard';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

// Layout for public pages
const PublicLayout = () => (
  <div className="app-container">
    <Navbar />
    <main className="main-content">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Routes>
      {/* Public Routes with Navbar & Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected Dashboard Routes (No Navbar/Footer) */}
      <Route element={<ProtectedRoute allowedRoles={['Admin', 'Librarian', 'Student', 'Faculty']} />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Route>
      
      <Route element={<ProtectedRoute allowedRoles={['Librarian']} />}>
        <Route path="/librarian-dashboard" element={<LibrarianDashboard />} />
      </Route>
      
      <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Route>
      
      <Route element={<ProtectedRoute allowedRoles={['Faculty']} />}>
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
