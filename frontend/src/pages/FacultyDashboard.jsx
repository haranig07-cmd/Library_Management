import React, { useState, useEffect } from 'react';
import { BookPlus, History, MessageSquare, Search, BookOpen, Layers, Clock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import BookCard from '../components/BookCard';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { API_BASE_URL } from '../api';

const FacultyDashboard = () => {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [recForm, setRecForm] = useState({ title: '', author: '', subject: '', reason: '' });

  const fetchData = async (query = '') => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const url = query ? `${API_BASE_URL}/books?search=${query}` : `${API_BASE_URL}/books`;
      
      const [booksRes, transRes] = await Promise.all([
        fetch(url, { headers }),
        fetch(`${API_BASE_URL}/transactions/my`, { headers })
      ]);
      
      const booksData = await booksRes.json();
      const transData = await transRes.json();
      
      if (booksData.success) setBooks(booksData.data);
      if (transData.success) setTransactions(transData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(search);
  };

  const handleAction = async (book) => {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ bookId: book._id })
      });
      if (res.ok) {
        alert("📚 Request Sent! The librarian will review it shortly (30-day Faculty period applied).");
        fetchData();
      } else {
        const data = await res.json();
        alert("⚠️ " + (data.error || "Could not process request"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/recommend`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(recForm)
      });
      if (res.ok) {
        setIsRecommendModalOpen(false);
        setRecForm({ title: '', author: '', subject: '', reason: '' });
        alert("✅ Recommendation sent to the Librarian!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { 
      header: 'Research Resource', 
      cell: (row) => (
        <div>
          <div style={{ fontWeight: '600' }}>{row.book?.title || 'Unknown'}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>ISBN: {row.book?.isbn}</div>
        </div>
      )
    },
    { 
      header: 'Return By', 
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={14} />
          {new Date(row.dueDate).toLocaleDateString()}
        </div>
      )
    },
    { 
      header: 'Status', 
      cell: (row) => <span className={`badge badge-${row.status.toLowerCase().replace(' ', '-')}`}>{row.status}</span> 
    },
  ];

  return (
    <DashboardLayout role="Faculty" title="Faculty Research Portal">
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper primary"><BookOpen size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Research Assets</span>
            <span className="stat-card-value">{transactions.filter(t => t.status === 'Issued').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper secondary"><Clock size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Loan Privilege</span>
            <span className="stat-card-value">30 Days</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper success"><MessageSquare size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Notifications</span>
            <span className="stat-card-value">0</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Search size={20} className="text-primary" />
            <h3 style={{ margin: 0 }}>Academic Catalog</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <form onSubmit={handleSearch} className="search-bar-premium">
              <Search size={18} />
              <input type="text" placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
            <button className="btn btn-secondary" onClick={() => setIsRecommendModalOpen(true)}>
              <BookPlus size={18} /> Suggest Resource
            </button>
          </div>
        </div>
        <div className="books-grid">
          {books.map(book => (
            <BookCard 
              key={book._id} 
              book={book} 
              onAction={() => handleAction(book)}
              actionLabel={transactions.some(t => 
                (t.book?._id?.toString() === book._id?.toString() || t.book === book._id) && 
                ['Pending Approval', 'Issued'].includes(t.status)
              ) ? "Already Requested/Issued" : (book.availableCopies > 0 ? "Request (30 Days)" : "Join Waitlist")}
              disabled={transactions.some(t => 
                (t.book?._id?.toString() === book._id?.toString() || t.book === book._id) && 
                ['Pending Approval', 'Issued'].includes(t.status)
              )}
            />
          ))}
        </div>
      </div>

      <div className="dashboard-section" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <History size={20} className="text-secondary" />
          <h3 style={{ margin: 0 }}>Borrowing History</h3>
        </div>
        <DataTable columns={columns} data={transactions} loading={loading} />
      </div>

      <Modal isOpen={isRecommendModalOpen} onClose={() => setIsRecommendModalOpen(false)} title="Departmental Suggestion">
        <form className="modal-form" onSubmit={handleRecommend}>
          <div className="modal-form-group"><label>Resource Title</label><input type="text" value={recForm.title} onChange={e => setRecForm({...recForm, title: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Author/Editor</label><input type="text" value={recForm.author} onChange={e => setRecForm({...recForm, author: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Department/Subject</label><input type="text" value={recForm.subject} onChange={e => setRecForm({...recForm, subject: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Reason for Recommendation</label><textarea value={recForm.reason} onChange={e => setRecForm({...recForm, reason: e.target.value})} required /></div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsRecommendModalOpen(false)}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn-submit">Submit Recommendation</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
