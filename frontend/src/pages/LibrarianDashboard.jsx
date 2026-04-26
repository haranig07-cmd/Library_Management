import React, { useState, useEffect } from 'react';
import { Plus, BookUp, Filter, Search, Edit, Trash2, Check, X as CloseIcon } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const LibrarianDashboard = () => {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  
  const [currentBook, setCurrentBook] = useState(null);
  const [bookForm, setBookForm] = useState({ title: '', author: '', subject: '', isbn: '', edition: '', totalCopies: '' });
  const [issueForm, setIssueForm] = useState({ userId: '', bookId: '', dueDate: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [booksRes, usersRes, transRes, recRes] = await Promise.all([
        fetch('http://localhost:5000/api/books', { headers }),
        fetch('http://localhost:5000/api/users', { headers }),
        fetch('http://localhost:5000/api/transactions', { headers }),
        fetch('http://localhost:5000/api/recommendations', { headers })
      ]);
      
      const booksData = await booksRes.json();
      const usersData = await usersRes.json();
      const transData = await transRes.json();
      const recData = await recRes.json();
      
      if (booksData.success) setBooks(booksData.data);
      if (usersData.success) setUsers(usersData.data.filter(u => u.role !== 'Admin'));
      if (transData.success) setTransactions(transData.data);
      if (recData.success) setRecommendations(recData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(bookForm)
      });
      if (res.ok) {
        setIsBookModalOpen(false);
        setBookForm({ title: '', author: '', subject: '', isbn: '', edition: '', totalCopies: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditBook = (book) => {
    setCurrentBook(book);
    setBookForm({ title: book.title, author: book.author, subject: book.subject, isbn: book.isbn, edition: book.edition || '', totalCopies: book.totalCopies });
    setIsEditBookModalOpen(true);
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/books/${currentBook._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(bookForm)
      });
      if (res.ok) {
        setIsEditBookModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await fetch(`http://localhost:5000/api/books/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/transactions/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(issueForm)
      });
      if (res.ok) {
        setIsIssueModalOpen(false);
        setIssueForm({ userId: '', bookId: '', dueDate: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturnBook = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/transactions/return/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRequest = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/transactions/request/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRec = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/recommendations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const bookColumns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Author', accessor: 'author' },
    { header: 'Copies', cell: (row) => `${row.availableCopies} / ${row.totalCopies}` },
    { header: 'Actions', cell: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => handleEditBook(row)} style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit size={16} /></button>
        <button onClick={() => handleDeleteBook(row._id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
      </div>
    )}
  ];

  const transColumns = [
    { header: 'Book', cell: (row) => row.book?.title || 'Unknown' },
    { header: 'User', cell: (row) => row.user?.username || 'Unknown' },
    { header: 'Status', cell: (row) => <span className={`badge ${row.status === 'Issued' ? 'badge-warning' : row.status === 'Returned' ? 'badge-success' : 'badge-danger'}`}>{row.status}</span> },
    { header: 'Action', cell: (row) => (
      row.status === 'Issued' ? <button className="btn btn-primary" onClick={() => handleReturnBook(row._id)} style={{padding: '0.2rem 0.5rem', fontSize: '0.75rem'}}>Return</button> :
      row.status === 'Pending Approval' ? (
        <div style={{ display: 'flex', gap: '0.2rem' }}>
          <button onClick={() => handleUpdateRequest(row._id, 'Issued')} style={{ border: 'none', background: 'none', color: '#10b981' }}><Check size={16} /></button>
          <button onClick={() => handleUpdateRequest(row._id, 'Rejected')} style={{ border: 'none', background: 'none', color: '#ef4444' }}><CloseIcon size={16} /></button>
        </div>
      ) : '-'
    )}
  ];

  const recColumns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Faculty', cell: (row) => row.faculty?.username || 'Unknown' },
    { header: 'Action', cell: (row) => (
      row.status === 'Pending' ? (
        <div style={{ display: 'flex', gap: '0.2rem' }}>
          <button onClick={() => handleUpdateRec(row._id, 'Accepted')} style={{ border: 'none', background: 'none', color: '#10b981' }}>Accept</button>
          <button onClick={() => handleUpdateRec(row._id, 'Rejected')} style={{ border: 'none', background: 'none', color: '#ef4444' }}>Reject</button>
        </div>
      ) : row.status
    )}
  ];

  return (
    <DashboardLayout role="Librarian" title="Librarian Control Center">
      <div className="stat-cards-grid">
        <div className="stat-card"><span className="stat-card-title">Total Books</span><span className="stat-card-value">{books.length}</span></div>
        <div className="stat-card"><span className="stat-card-title">Pending Requests</span><span className="stat-card-value">{transactions.filter(t => t.status === 'Pending Approval').length}</span></div>
        <div className="stat-card"><span className="stat-card-title">Active Issues</span><span className="stat-card-value">{transactions.filter(t => t.status === 'Issued').length}</span></div>
      </div>

      <div id="requests">
        {transactions.some(t => t.status === 'Pending Approval') && (
          <div className="dashboard-section" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <h3 style={{ color: '#ef4444' }}>Pending Book Requests</h3>
            <DataTable columns={transColumns} data={transactions.filter(t => t.status === 'Pending Approval')} loading={loading} />
          </div>
        )}

        {recommendations.some(r => r.status === 'Pending') && (
          <div className="dashboard-section">
            <h3 style={{ color: 'var(--secondary)' }}>Faculty Book Recommendations</h3>
            <DataTable columns={recColumns} data={recommendations.filter(r => r.status === 'Pending')} loading={loading} />
          </div>
        )}
      </div>

      <div className="dashboard-section" id="inventory">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Book Inventory</h3>
          <button className="btn btn-primary" onClick={() => setIsBookModalOpen(true)}><Plus size={18} /> Add Book</button>
        </div>
        <DataTable columns={bookColumns} data={books} loading={loading} />
      </div>

      <div className="dashboard-section" id="transactions">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>All Transactions</h3>
          <button className="btn btn-primary" onClick={() => setIsIssueModalOpen(true)}><BookUp size={18} /> Issue Book</button>
        </div>
        <DataTable columns={transColumns} data={transactions.filter(t => t.status !== 'Pending Approval')} loading={loading} />
      </div>

      {/* Add Book Modal */}
      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Add New Book">
        <form className="modal-form" onSubmit={handleAddBook}>
          <div className="modal-form-group"><label>Title</label><input type="text" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Author</label><input type="text" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group"><label>Subject</label><input type="text" value={bookForm.subject} onChange={e => setBookForm({...bookForm, subject: e.target.value})} required /></div>
            <div className="modal-form-group"><label>ISBN</label><input type="text" value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} required /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group"><label>Edition</label><input type="text" value={bookForm.edition} onChange={e => setBookForm({...bookForm, edition: e.target.value})} /></div>
            <div className="modal-form-group"><label>Total Copies</label><input type="number" min="1" value={bookForm.totalCopies} onChange={e => setBookForm({...bookForm, totalCopies: e.target.value})} required /></div>
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsBookModalOpen(false)}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn-submit">Add Book</button>
          </div>
        </form>
      </Modal>

      {/* Edit Book Modal */}
      <Modal isOpen={isEditBookModalOpen} onClose={() => setIsEditBookModalOpen(false)} title="Edit Book">
        <form className="modal-form" onSubmit={handleUpdateBook}>
          <div className="modal-form-group"><label>Title</label><input type="text" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Total Copies</label><input type="number" min="1" value={bookForm.totalCopies} onChange={e => setBookForm({...bookForm, totalCopies: e.target.value})} required /></div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsEditBookModalOpen(false)}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn-submit">Update Book</button>
          </div>
        </form>
      </Modal>

      {/* Issue Book Modal */}
      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Issue Book">
        <form className="modal-form" onSubmit={handleIssueBook}>
          <div className="modal-form-group">
            <label>Select User</label>
            <select value={issueForm.userId} onChange={e => setIssueForm({...issueForm, userId: e.target.value})} required>
              <option value="">Choose User...</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.role})</option>)}
            </select>
          </div>
          <div className="modal-form-group">
            <label>Select Book</label>
            <select value={issueForm.bookId} onChange={e => setIssueForm({...issueForm, bookId: e.target.value})} required>
              <option value="">Choose Book...</option>
              {books.filter(b => b.availableCopies > 0).map(b => <option key={b._id} value={b._id}>{b.title} ({b.availableCopies} left)</option>)}
            </select>
          </div>
          <div className="modal-form-group">
            <label>Due Date</label>
            <input type="date" value={issueForm.dueDate} onChange={e => setIssueForm({...issueForm, dueDate: e.target.value})} required min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsIssueModalOpen(false)}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn-submit">Issue Book</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default LibrarianDashboard;
