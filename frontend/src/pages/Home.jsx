import { Link } from 'react-router-dom';
import { Search, Users, ShieldCheck, Clock, Calculator, BarChart3, ChevronRight } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import StatisticCounter from '../components/StatisticCounter';
import './Home.css';

function Home() {
  const features = [
    { icon: Search, title: "Book Search & Catalog", description: "Advanced semantic search across thousands of digital and physical resources with instant availability checking." },
    { icon: Users, title: "Student Accounts", description: "Personalized dashboard for students to track their reading history, current issues, and wishlist." },
    { icon: ShieldCheck, title: "Librarian Management", description: "Comprehensive administrative controls for inventory, user roles, and system configuration." },
    { icon: Clock, title: "Book Issue & Return", description: "Seamless tracking of circulation with automated reminders for due dates." },
    { icon: Calculator, title: "Fine Calculation", description: "Automated, transparent fine calculation system for overdue materials." },
    { icon: BarChart3, title: "Reports & Analytics", description: "Detailed insights into library usage, popular resources, and user engagement." }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-fade-in">
          <span className="hero-badge">Modernizing Education</span>
          <h1 className="hero-title">
            Smart Digital Library<br />
            <span className="text-gradient">Management System</span>
          </h1>
          <p className="hero-subtitle">
            Empower your university with a next-generation platform to manage resources, streamline circulation, and enhance the learning experience for everyone.
          </p>
          <div className="hero-buttons">
            <Link to="/about" className="btn btn-primary btn-lg">
              Explore Library <ChevronRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
              Login to System
            </Link>
          </div>
        </div>
        <div className="hero-image-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <img 
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1000" 
            alt="Students in a modern library" 
            className="hero-image-main" 
          />
          <div className="floating-card glass el-1">
            <strong>10,000+</strong> Digital Resources
          </div>
          <div className="floating-card glass el-2">
            <span className="status-dot"></span> System Online
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Powerful Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      {/* About Preview Section */}
      <section className="about-preview">
        <div className="about-preview-content">
          <h2 className="section-title" style={{ textAlign: 'left' }}>Transforming the way colleges manage knowledge</h2>
          <p>
            This Library Management System helps colleges manage books, students, and transactions efficiently using modern technology. 
            By bridging the gap between physical inventory and digital access, we create a unified ecosystem for academic excellence.
          </p>
          <br/>
          <Link to="/about" className="btn btn-primary">
            Learn More About Us
          </Link>
        </div>
        <div className="about-preview-image">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1000" 
            alt="University Library Dashboard" 
            className="about-image"
          />
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="stats-grid glass">
          <StatisticCounter end={45000} label="Total Books" />
          <StatisticCounter end={12000} label="Active Students" />
          <StatisticCounter end={3400} label="Issued Books" />
          <StatisticCounter end={25} label="Librarians" />
        </div>
      </section>

      {/* Contact Preview Section */}
      <section className="contact-preview">
        <div className="contact-banner">
          <div className="contact-banner-content">
            <h2>Need assistance or want to deploy this system?</h2>
            <p>Contact our support team for a dedicated walkthrough and setup guide.</p>
            <Link to="/contact" className="btn btn-primary" style={{ marginTop: '2rem', background: 'white', color: 'var(--primary-color)' }}>
              Contact Us Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
