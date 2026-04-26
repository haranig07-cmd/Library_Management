import React, { useState, useEffect } from 'react';
import { BookPlus, History, MessageSquare } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import BookCard from '../components/BookCard';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { API_BASE_URL } from '../api';

const FacultyDashboard = () => {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
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

  const handleReserve = async (book) => {
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
        alert("Reservation request sent!");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/recommendations`, {
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
        alert("Recommendation sent to library!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: 'Book', cell: (row) => row.book?.title || 'Unknown' },
    { header: 'Due Date', cell: (row) => new Date(row.dueDate).toLocaleDateString() },
    { header: 'Status', cell: (row) => <span className={`badge ${row.status === 'Issued' ? 'badge-warning' : 'badge-success'}`}>{row.status}</span> },
  ];

  return (
    <DashboardLayout role="Faculty" title="Faculty Portal">
      <div className="stat-cards-grid">
        <div className="stat-card">
          <BookPlus className="stat-icon" style={{ color: 'var(--primary)' }} />
          <span className="stat-card-title">Assigned Books</span>
          <span className="stat-card-value">{transactions.filter(t => t.status === 'Issued').length}</span>
        </div>
        <div className="stat-card">
          <History className="stat-icon" style={{ color: 'var(--secondary)' }} />
          <span className="stat-card-title">Total Recommendations</span>
          <span className="stat-card-value">{recommendations.length}</span>
        </div>
      </div>

      <div className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Academic Resources</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
            <button className="btn btn-secondary" onClick={() => setIsRecommendModalOpen(true)}>
              <MessageSquare size={18} /> Recommend
            </button>
          </div>
        </div>
        <div className="books-grid">
          {books.map(book => (
            <BookCard 
              key={book._id} 
              book={book} 
              onAction={() => handleReserve(book)}
              actionLabel="Reserve for Class"
            />
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>My Issued Resources</h3>
        <DataTable columns={columns} data={transactions.filter(t => t.status === 'Issued')} loading={loading} />
      </div>

      <Modal isOpen={isRecommendModalOpen} onClose={() => setIsRecommendModalOpen(false)} title="Recommend a New Book">
        <form className="modal-form" onSubmit={handleRecommend}>
          <div className="modal-form-group"><label>Book Title</label><input type="text" value={recForm.title} onChange={e => setRecForm({...recForm, title: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Author</label><input type="text" value={recForm.author} onChange={e => setRecForm({...recForm, author: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Subject Area</label><input type="text" value={recForm.subject} onChange={e => setRecForm({...recForm, subject: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Reason for Recommendation</label><textarea value={recForm.reason} onChange={e => setRecForm({...recForm, reason: e.target.value})} required /></div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsRecommendModalOpen(false)}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn-submit">Send Recommendation</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
