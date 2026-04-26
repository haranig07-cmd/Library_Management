import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function InputField({ 
  type, 
  name, 
  label, 
  value, 
  onChange, 
  icon: Icon, 
  error, 
  required 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  
  // Determine if the label should float (either focused or has value)
  const isFloating = isFocused || (value && value.length > 0);

  return (
    <div className={`form-group ${error ? 'has-error' : ''}`}>
      <div className={`input-icon-wrapper ${isFloating ? 'floating' : ''}`}>
        {Icon && <Icon size={20} className="input-icon" />}
        
        <div className="floating-label-container">
          <label className={`floating-label ${isFloating ? 'active' : ''}`}>
            {label} {required && '*'}
          </label>
          <input 
            type={inputType} 
            name={name}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            className="floating-input"
            placeholder=" " 
          />
        </div>

        {isPassword && (
          <button 
            type="button" 
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

export default InputField;
