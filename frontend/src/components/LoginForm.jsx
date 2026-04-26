import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoleSelector from './RoleSelector';
import { API_BASE_URL } from '../api';
import './LoginForm.css';

function LoginForm() {
  const navigate = useNavigate();
  
  const [credentials, setCredentials] = useState({
    role: 'Student',
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.email.trim()) {
      newErrors.email = "Username or Email is required";
    }
    if (!credentials.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    setApiError(null);
  };

  const handleRoleSelect = (role) => {
    setCredentials(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          role: credentials.role
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials or role mismatch');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('user', JSON.stringify(data.user));

      const dashboardRoutes = {
        Admin: '/admin-dashboard',
        Librarian: '/librarian-dashboard',
        Faculty: '/faculty-dashboard',
        Student: '/student-dashboard'
      };
      
      navigate(dashboardRoutes[data.user.role] || '/student-dashboard');

    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="login-form animate-fade-in" onSubmit={handleSubmit} noValidate>
      
      {apiError && (
        <div className="api-error">
          {apiError}
        </div>
      )}

      <div className="role-group">
        <label className="role-label">Select Access Role</label>
        <RoleSelector 
          selectedRole={credentials.role} 
          onRoleSelect={handleRoleSelect} 
        />
      </div>

      <div className="form-field">
        <Mail className="field-icon" size={18} />
        <input
          type="text"
          name="email"
          placeholder=" "
          value={credentials.email}
          onChange={handleChange}
          autoComplete="username"
          required
        />
        <label>Enter username or institutional email</label>
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>
      
      <div className="form-field password-field">
        <Lock className="field-icon" size={18} />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder=" "
          value={credentials.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />
        <label>Password</label>
        <button 
          type="button" 
          className="password-toggle-btn"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>
      
      <div className="form-meta">
        <label className="checkbox-container">
          <input 
            type="checkbox" 
            name="rememberMe"
            checked={credentials.rememberMe}
            onChange={handleChange}
          /> 
          Remember me
        </label>
        <a href="#" className="forgot-link">Forgot Password?</a>
      </div>
      
      <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
        {isLoading ? (
          <div className="btn-spinner"></div>
        ) : (
          <>Login to Library System <ArrowRight size={18} style={{ marginLeft: '8px' }} /></>
        )}
      </button>
    </form>
  );
}

export default LoginForm;
