import React, { useState, useEffect } from 'react';
import { Plus, BookUp, Edit, Trash2, Check, X as CloseIcon, Layout, Database, Clock, BookOpen } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { API_BASE_URL } from '../api';

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
        fetch(`${API_BASE_URL}/books`, { headers }),
        fetch(`${API_BASE_URL}/users`, { headers }),
        fetch(`${API_BASE_URL}/transactions`, { headers }),
        fetch(`${API_BASE_URL}/recommendations`, { headers })
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
      const res = await fetch(`${API_BASE_URL}/books`, {
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
      const res = await fetch(`${API_BASE_URL}/books/${currentBook._id}`, {
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
      await fetch(`${API_BASE_URL}/books/${id}`, {
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
      const res = await fetch(`${API_BASE_URL}/transactions/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(issueForm)
      });
      if (res.ok) {
        alert("✅ Book Issued Successfully!");
        setIsIssueModalOpen(false);
        setIssueForm({ userId: '', bookId: '', dueDate: '' });
        fetchData();
      } else {
        const data = await res.json();
        alert("❌ Error: " + (data.error || "Could not issue book"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturnBook = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/transactions/return/${id}`, {
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
      await fetch(`${API_BASE_URL}/transactions/request/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`✅ Request ${status === 'Issued' ? 'Approved' : 'Rejected'}!`);
        fetchData();
      } else {
        const data = await res.json();
        alert("❌ " + (data.error || "Update failed"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const bookColumns = [
    { 
      header: 'Book Details', 
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="book-icon-small"><BookOpen size={16} /></div>
          <div>
            <div style={{ fontWeight: '500' }}>{row.title}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{row.author}</div>
          </div>
        </div>
      )
    },
    { header: 'Subject', accessor: 'subject' },
    { 
      header: 'Availability', 
      cell: (row) => (
        <div className="availability-pill">
          <div className="bar"><div className="fill" style={{ width: `${(row.availableCopies/row.totalCopies)*100}%` }}></div></div>
          <span>{row.availableCopies} / {row.totalCopies}</span>
        </div>
      )
    },
    { header: 'Actions', cell: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => handleEditBook(row)} className="btn-icon"><Edit size={16} /></button>
        <button onClick={() => handleDeleteBook(row._id)} className="btn-icon btn-icon-danger"><Trash2 size={16} /></button>
      </div>
    )}
  ];

  const transColumns = [
    { header: 'Book', cell: (row) => row.book?.title || 'Unknown' },
    { header: 'User', cell: (row) => row.user?.username || 'Unknown' },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className={`badge badge-${row.status.toLowerCase().replace(' ', '-')}`}>
          {row.status}
        </span>
      )
    },
    { header: 'Action', cell: (row) => (
      row.status === 'Issued' ? <button className="btn btn-primary btn-sm" onClick={() => handleReturnBook(row._id)}>Return Book</button> :
      row.status === 'Pending Approval' ? (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-icon success" onClick={() => handleUpdateRequest(row._id, 'Issued')}><Check size={16} /></button>
          <button className="btn-icon danger" onClick={() => handleUpdateRequest(row._id, 'Rejected')}><CloseIcon size={16} /></button>
        </div>
      ) : '-'
    )}
  ];

  return (
    <DashboardLayout role="Librarian" title="Librarian Resource Center">
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper secondary"><Database size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Catalog Size</span>
            <span className="stat-card-value">{books.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper danger"><Layout size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Pending Requests</span>
            <span className="stat-card-value">{transactions.filter(t => t.status === 'Pending Approval').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper success"><Clock size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Active Loans</span>
            <span className="stat-card-value">{transactions.filter(t => t.status === 'Issued').length}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
        <div className="dashboard-section" id="inventory" style={{ gridColumn: 'span 3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Book Inventory</h3>
            <button className="btn btn-primary" onClick={() => setIsBookModalOpen(true)}>
              <Plus size={18} /> Add New Title
            </button>
          </div>
          <DataTable columns={bookColumns} data={books} loading={loading} />
        </div>

        <div className="dashboard-section" id="transactions" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Recent Activity</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsIssueModalOpen(true)}>
              <BookUp size={16} /> Quick Issue
            </button>
          </div>
          <DataTable columns={transColumns} data={transactions} loading={loading} />
        </div>
      </div>

      {/* Add Book Modal */}
      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Register New Book">
        <form className="modal-form" onSubmit={handleAddBook}>
          <div className="modal-form-group"><label>Book Title</label><input type="text" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Author</label><input type="text" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group"><label>Subject Area</label><input type="text" value={bookForm.subject} onChange={e => setBookForm({...bookForm, subject: e.target.value})} required /></div>
            <div className="modal-form-group"><label>ISBN Code</label><input type="text" value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} required /></div>
          </div>
          <div className="modal-form-group"><label>Total Inventory Copies</label><input type="number" min="1" value={bookForm.totalCopies} onChange={e => setBookForm({...bookForm, totalCopies: e.target.value})} required /></div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsBookModalOpen(false)}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn-submit">Add to Catalog</button>
          </div>
        </form>
      </Modal>

      {/* Issue Book Modal */}
      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Direct Issue">
        <form className="modal-form" onSubmit={handleIssueBook}>
          <div className="modal-form-group">
            <label>Member Account</label>
            <select value={issueForm.userId} onChange={e => setIssueForm({...issueForm, userId: e.target.value})} required>
              <option value="">Select Member...</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.role})</option>)}
            </select>
          </div>
          <div className="modal-form-group">
            <label>Book Title</label>
            <select value={issueForm.bookId} onChange={e => setIssueForm({...issueForm, bookId: e.target.value})} required>
              <option value="">Select Book...</option>
              {books.filter(b => b.availableCopies > 0).map(b => <option key={b._id} value={b._id}>{b.title} ({b.availableCopies} available)</option>)}
            </select>
          </div>
          <div className="modal-form-group">
            <label>Due Date</label>
            <input type="date" value={issueForm.dueDate} onChange={e => setIssueForm({...issueForm, dueDate: e.target.value})} required />
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsIssueModalOpen(false)}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn-submit">Process Issue</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default LibrarianDashboard;
