import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Clock, History, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import BookCard from '../components/BookCard';
import DataTable from '../components/DataTable';
import { API_BASE_URL } from '../api';

const StudentDashboard = () => {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState({ borrowed: 0, pending: 0, returned: 0 });

  const animateCount = (target, key) => {
    let current = 0;
    const increment = Math.ceil(target / 20) || 1;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCounts(prev => ({ ...prev, [key]: target }));
        clearInterval(timer);
      } else {
        setCounts(prev => ({ ...prev, [key]: current }));
      }
    }, 30);
  };

  const fetchData = async (query = '') => {
    setLoading(true);
    try {
      const url = query ? `${API_BASE_URL}/books?search=${query}` : `${API_BASE_URL}/books`;
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      
      const [booksRes, transRes] = await Promise.all([
        fetch(url, { headers }),
        fetch(`${API_BASE_URL}/transactions/my`, { headers })
      ]);
      
      const booksData = await booksRes.json();
      const transData = await transRes.json();
      
      if (booksData.success) setBooks(booksData.data);
      if (transData.success) {
        setTransactions(transData.data);
        const borrowedCount = transData.data.filter(t => t.status === 'Issued').length;
        const pendingCount = transData.data.filter(t => t.status === 'Pending Approval').length;
        const returnedCount = transData.data.filter(t => t.status === 'Returned').length;
        
        animateCount(borrowedCount, 'borrowed');
        animateCount(pendingCount, 'pending');
        animateCount(returnedCount, 'returned');
      }
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

  const handleRequestIssue = async (book) => {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ bookId: book._id })
      });
      const data = await res.json();
      if (data.success) {
        alert("📚 Request Sent! The librarian will review your request shortly.");
        fetchData();
      } else {
        alert("⚠️ " + (data.error || "Failed to send request"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: 'Book Title', cell: (row) => row.book?.title || 'Unknown' },
    { header: 'Author', cell: (row) => row.book?.author || 'Unknown' },
    { header: 'Issue Date', cell: (row) => new Date(row.issueDate).toLocaleDateString() },
    { 
      header: 'Due Date', 
      cell: (row) => {
        const dueDate = new Date(row.dueDate);
        const today = new Date();
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        const isNear = diffDays <= 3 && diffDays >= 0 && row.status === 'Issued';
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isNear ? '#f59e0b' : '' }}>
            {isNear && <AlertCircle size={14} />}
            {dueDate.toLocaleDateString()}
            {isNear && <span style={{ fontSize: '0.7rem' }}> (Due Soon!)</span>}
          </div>
        );
      }
    },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className={`badge badge-${row.status.toLowerCase().replace(' ', '-')}`}>
          {row.status}
        </span>
      ) 
    },
  ];

  return (
    <DashboardLayout role="Student" title="My Learning Portal">
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper primary"><BookOpen size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Currently Borrowed</span>
            <span className="stat-card-value">{counts.borrowed}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper secondary"><Clock size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Pending Requests</span>
            <span className="stat-card-value">{counts.pending}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper success"><CheckCircle size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Returned Books</span>
            <span className="stat-card-value">{counts.returned}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Search size={20} className="text-primary" />
            <h3 style={{ margin: 0 }}>Explore Library Catalog</h3>
          </div>
          <form onSubmit={handleSearch} className="search-bar-premium">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by title, author or ISBN..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">Find Books</button>
          </form>
        </div>
        <div className="books-grid">
          {books.map(book => (
            <BookCard 
              key={book._id} 
              book={book} 
              onAction={() => handleRequestIssue(book)}
              actionLabel={transactions.some(t => 
                (t.book?._id?.toString() === book._id?.toString() || t.book === book._id) && 
                ['Pending Approval', 'Issued'].includes(t.status)
              ) ? "Already Requested/Issued" : "Request This Book"}
              disabled={transactions.some(t => 
                (t.book?._id?.toString() === book._id?.toString() || t.book === book._id) && 
                ['Pending Approval', 'Issued'].includes(t.status)
              ) || book.availableCopies === 0}
            />
          ))}
        </div>
      </div>

      <div className="dashboard-section" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <History size={20} className="text-secondary" />
          <h3 style={{ margin: 0 }}>Personal Borrowing History</h3>
        </div>
        <DataTable columns={columns} data={transactions.filter(t => t.status !== 'Pending Approval')} loading={loading} />
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
