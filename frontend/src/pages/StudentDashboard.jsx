import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import BookCard from '../components/BookCard';
import DataTable from '../components/DataTable';
import { API_BASE_URL } from '../api';

const StudentDashboard = () => {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
        alert("Request sent to librarian successfully!");
        fetchData();
      } else {
        alert(data.error || "Failed to send request");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending request");
    }
  };

  const columns = [
    { header: 'Book Title', cell: (row) => row.book?.title || 'Unknown' },
    { header: 'Author', cell: (row) => row.book?.author || 'Unknown' },
    { header: 'Issue Date', cell: (row) => new Date(row.issueDate).toLocaleDateString() },
    { header: 'Due Date', cell: (row) => new Date(row.dueDate).toLocaleDateString() },
    { header: 'Status', cell: (row) => <span className={`badge ${row.status === 'Issued' ? 'badge-warning' : row.status === 'Returned' ? 'badge-success' : 'badge-danger'}`}>{row.status}</span> },
  ];

  return (
    <DashboardLayout role="Student" title="Student Resource Center">
      <div className="stat-cards-grid">
        <div className="stat-card">
          <span className="stat-card-title">Currently Borrowed</span>
          <span className="stat-card-value">{transactions.filter(t => t.status === 'Issued').length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-title">Pending Requests</span>
          <span className="stat-card-value">{transactions.filter(t => t.status === 'Pending Approval').length}</span>
        </div>
      </div>

      <div className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3>Available Books</h3>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Search books..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
        <div className="books-grid">
          {books.map(book => (
            <BookCard 
              key={book._id} 
              book={book} 
              onAction={() => handleRequestIssue(book)}
              actionLabel={transactions.some(t => t.book?._id === book._id && t.status === 'Pending Approval') ? "Requested" : "Request Issue"}
              disabled={transactions.some(t => t.book?._id === book._id && t.status === 'Pending Approval') || book.availableCopies === 0}
            />
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>My Borrowing History</h3>
        <DataTable columns={columns} data={transactions.filter(t => t.status !== 'Pending Approval')} loading={loading} />
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
