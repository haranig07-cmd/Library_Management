import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(''); // '' | 'submitting' | 'success'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all fields.");
      return;
    }
    
    setStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus(''), 5000);
    }, 1500);
  };

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Contact Us</h1>
        <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </header>

      <section className="page-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        
        <div className="contact-info">
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>Get in Touch</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Whether you need technical support, have a billing question, or want to learn more about our enterprise solutions, our team is ready to help.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderRadius: '12px' }}>
              <MapPin size={24} color="var(--accent-color)" />
              <div>
                <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>Our Office</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>123 University Ave, Tech City, ST 12345</p>
              </div>
            </div>
            
            <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderRadius: '12px' }}>
              <Phone size={24} color="var(--accent-color)" />
              <div>
                <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>Phone</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderRadius: '12px' }}>
              <Mail size={24} color="var(--accent-color)" />
              <div>
                <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>Email</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>support@edulib.edu</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-container glass" style={{ padding: '3rem', borderRadius: '24px' }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', animation: 'fadeIn 0.5s' }}>
              <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Message Sent!</h3>
              <p style={{ color: 'var(--text-muted)' }}>Thank you for reaching out. We will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontSize: '1.5rem' }}>Send a Message</h3>
              
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--primary-light)' }}>Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border-color 0.3s' }}
                  required
                />
              </div>
              
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--primary-light)' }}>Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border-color 0.3s' }}
                  required
                />
              </div>
              
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--primary-light)' }}>Your Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows="5"
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border-color 0.3s', resize: 'vertical' }}
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={status === 'submitting'}
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
              >
                {status === 'submitting' ? 'Sending...' : <><Send size={18} /> Send Message</>}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default Contact;
