import React from 'react';
import { Target, Lightbulb, Monitor, ShieldCheck, Database, Award } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';

function About() {
  const benefits = [
    { icon: Lightbulb, title: "Innovation First", description: "Constantly evolving to meet the needs of modern universities." },
    { icon: Monitor, title: "Unified Experience", description: "A single platform for everything library-related." },
    { icon: ShieldCheck, title: "Secure & Reliable", description: "Enterprise-grade security protecting user data and inventory." }
  ];

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>About EduLib</h1>
        <p>Bridging the gap between physical books and digital learning.</p>
      </header>

      <section className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '6rem' }}>
          <div>
            <h2 className="section-title" style={{ textAlign: 'left' }}>Our Mission</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
              EduLib was created with a single mission: to empower educational institutions with the tools they need to manage their libraries efficiently and effectively. We believe that access to knowledge should be seamless, and managing that access should be effortless.
            </p>
            <br />
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
              By combining modern SaaS design principles with robust backend architecture, we provide a solution that is not only powerful but also a joy to use for both students and librarians.
            </p>
          </div>
          <div className="glass" style={{ height: '350px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(167,139,250,0.1))' }}>
            <Target size={120} color="var(--accent-color)" />
          </div>
        </div>

        <h2 className="section-title">Why Choose EduLib?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {benefits.map((b, i) => (
            <FeatureCard key={i} icon={b.icon} title={b.title} description={b.description} color="#10b981" />
          ))}
        </div>
      </section>
    </div>
  );
}

export default About;
