import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import './Login.css';

function Login() {
  return (
    <div className="login-page">
      <div className="login-background-glow"></div>
      
      <div className="login-card-wrapper glass-premium animate-fade-in">
        <div className="login-grid">
          
          {/* Left Side: Premium Illustration */}
          <div className="login-illustration">
            <div className="illustration-overlay"></div>
            <img 
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1000" 
              alt="Digital Library" 
              className="library-image"
            />
            <div className="illustration-content">
              <div className="brand-badge">Premium Access</div>
              <h3>EduLib <span>System</span></h3>
              <p>The smartest way to manage your academic library and digital resources.</p>
              
              <div className="login-stats">
                <div className="l-stat"><span>10k+</span> Books</div>
                <div className="l-stat"><span>5k+</span> Users</div>
              </div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="login-form-container">
            <div className="login-header">
              <div className="login-logo-container">
                <ShieldCheck size={32} color="var(--primary)" />
              </div>
              <h2>Sign In</h2>
              <p>Access your role-based dashboard</p>
            </div>
            
            <LoginForm />
            
            <div className="login-footer-links">
              <p>Need help? <Link to="/contact">Contact IT Support</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
