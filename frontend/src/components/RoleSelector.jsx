import React from 'react';
import { UserCircle } from 'lucide-react';

function RoleSelector({ selectedRole, onRoleSelect }) {
  const roles = ['Admin', 'Librarian', 'Faculty', 'Student'];

  return (
    <div className="role-dropdown-container">
      <div className="dropdown-wrapper">
        <UserCircle className="dropdown-icon" size={20} />
        <select 
          className="role-dropdown"
          value={selectedRole}
          onChange={(e) => onRoleSelect(e.target.value)}
        >
          <option value="" disabled>Select Role</option>
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default RoleSelector;
