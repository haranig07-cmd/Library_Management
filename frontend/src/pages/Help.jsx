import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, BookOpen, Clock, AlertCircle } from 'lucide-react';
import './Help.css';

function Help() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "How do I login to the system?",
      a: "Click on the 'Login' button in the top right corner. Enter your university credentials (Student ID or Employee ID) and your password. If you've forgotten your password, use the 'Forgot Password' link."
    },
    {
      q: "How can I search for a book?",
      a: "On the home dashboard, use the primary search bar. You can filter by Title, Author, ISBN, or Category. The results will show both digital and physical copies, along with their real-time availability."
    },
    {
      q: "How does the book issuing process work?",
      a: "Once you locate an available physical book, click 'Reserve'. Take the book from the shelf to the librarian desk, where they will scan your ID and the book to complete the issue process."
    },
    {
      q: "How do I return a book and pay fines?",
      a: "Bring the issued book to the librarian desk. The system will automatically calculate any overdue fines based on the return date. Fines can be paid in cash or through the integrated payment gateway."
    }
  ];

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Help Center & FAQ</h1>
        <p>Find answers to common questions and learn how to use the EduLib system.</p>
      </header>

      <section className="page-content" style={{ maxWidth: '800px' }}>
        <div className="help-grid">
          <div className="help-card glass">
             <Search size={32} color="var(--accent-color)" />
             <h3>Search Tips</h3>
             <p>Use quotes for exact matches</p>
          </div>
          <div className="help-card glass">
             <BookOpen size={32} color="var(--accent-color)" />
             <h3>Borrowing</h3>
             <p>Up to 5 books at a time</p>
          </div>
          <div className="help-card glass">
             <Clock size={32} color="var(--accent-color)" />
             <h3>Renewals</h3>
             <p>Extend up to 2 times</p>
          </div>
        </div>

        <h2 className="section-title" style={{ marginTop: '4rem' }}>Frequently Asked Questions</h2>
        
        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item glass ${openFaq === index ? 'open' : ''}`}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <div className="faq-question">
                <h4>{faq.q}</h4>
                {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Help;
