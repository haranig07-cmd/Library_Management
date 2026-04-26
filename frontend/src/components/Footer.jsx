import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <div className="nav-brand" style={{ marginBottom: '1.5rem' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                <BookOpen size={24} color="white" />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.03em' }}>EduLib</span>
            </Link>
          </div>
          <p style={{ maxWidth: '350px' }}>
            A smart, digital library management system designed to streamline operations, manage inventory, and provide a seamless experience for students and faculty.
          </p>
        </div>

        <div className="footer-col">
          <h3>Quick Links</h3>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/help">Help & FAQ</Link>
            <Link to="/contact">Contact Support</Link>
            <Link to="/login">Librarian Login</Link>
          </div>
        </div>

        <div className="footer-col">
          <h3>Contact Info</h3>
          <div className="footer-links">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <MapPin size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '4px' }} />
              <span>123 University Ave, Tech City, ST 12345</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Phone size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>+1 (555) 123-4567</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Mail size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>support@edulib.edu</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} EduLib Digital Library System. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
