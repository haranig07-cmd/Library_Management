import { useState } from 'react';
import './FeatureCard.css';

function FeatureCard({ icon: Icon, title, description, color = "var(--accent-color)" }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="feature-card glass"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="icon-container" 
        style={{ 
          backgroundColor: isHovered ? color : 'rgba(59, 130, 246, 0.1)',
          color: isHovered ? 'white' : color,
          transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)'
        }}
      >
        <Icon size={32} />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
}

export default FeatureCard;
