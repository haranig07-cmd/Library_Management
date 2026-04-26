import { useState, useEffect } from 'react';

function StatisticCounter({ end, duration = 2000, label }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };

    animationFrame = window.requestAnimationFrame(step);
    
    return () => window.cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontSize: '3.5rem', color: 'var(--accent-color)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        {count.toLocaleString()}+
      </h2>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '500' }}>
        {label}
      </p>
    </div>
  );
}

export default StatisticCounter;
