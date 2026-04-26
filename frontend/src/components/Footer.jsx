import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, BookOpen, Mail, Phone, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <div className="nav-brand" style={{ marginBottom: '1rem' }}>
            <Link to="/" style={{ color: 'white' }}>
              <BookOpen size={28} color="var(--accent-color)" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>EduLib</span>
            </Link>
          </div>
          <p>
            A smart, digital library management system designed to streamline operations, manage inventory, and provide a seamless experience for students and faculty.
          </p>
          <div className="social-links">
            <a href="#"><Facebook size={20} /></a>
            <a href="#"><Twitter size={20} /></a>
            <a href="#"><Instagram size={20} /></a>
            <a href="#"><Linkedin size={20} /></a>
          </div>
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
            <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <MapPin size={20} color="var(--accent-color)" />
              <span>123 University Ave, Tech City, ST 12345</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <Phone size={20} color="var(--accent-color)" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <Mail size={20} color="var(--accent-color)" />
              <span>support@edulib.edu</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} EduLib Digital Library System. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
