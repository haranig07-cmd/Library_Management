import React, { useState, useEffect } from 'react';
import { 
  Plus, BookUp, Edit, Trash2, Check, X as CloseIcon, 
  Layout, Database, Clock, BookOpen, AlertCircle, MapPin, Star
} from 'lucide-react';
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
  const [bookForm, setBookForm] = useState({ 
    title: '', author: '', subject: '', isbn: '', 
    edition: '', totalCopies: '', shelfLocation: '', category: '' 
  });
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
        alert("✅ Book added to catalog successfully!");
        setIsBookModalOpen(false);
        setBookForm({ title: '', author: '', subject: '', isbn: '', edition: '', totalCopies: '', shelfLocation: '', category: '' });
        fetchData();
      } else {
        const data = await res.json();
        alert("❌ Failed to add book: " + (data.error || "Please check all fields"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditBook = (book) => {
    setCurrentBook(book);
    setBookForm({ 
      title: book.title, author: book.author, subject: book.subject, 
      isbn: book.isbn, edition: book.edition || '', totalCopies: book.totalCopies,
      shelfLocation: book.shelfLocation || '', category: book.category || ''
    });
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
      const res = await fetch(`${API_BASE_URL}/transactions/request/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`✅ Request ${status === 'Issued' ? 'Approved' : 'Rejected'}!`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const overdueTransactions = transactions.filter(t => {
    return t.status === 'Issued' && new Date(t.dueDate) < new Date();
  });

  const bookColumns = [
    { 
      header: 'Book Details', 
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="book-icon-small" style={{ background: row.status === 'Damaged' ? 'rgba(239, 68, 68, 0.2)' : '' }}>
            <BookOpen size={16} color={row.status === 'Damaged' ? '#ef4444' : ''} />
          </div>
          <div>
            <div style={{ fontWeight: '600' }}>{row.title}</div>
            <div style={{ fontSize: '0.7rem', display: 'flex', gap: '0.5rem', opacity: 0.6 }}>
              <span><MapPin size={10} /> {row.shelfLocation || 'Unassigned'}</span>
              <span>• {row.category || 'General'}</span>
            </div>
          </div>
        </div>
      )
    },
    { 
      header: 'Inventory', 
      cell: (row) => (
        <div className="availability-pill">
          <div className="bar"><div className="fill" style={{ width: `${(row.availableCopies/row.totalCopies)*100}%` }}></div></div>
          <span>{row.availableCopies} / {row.totalCopies}</span>
        </div>
      )
    },
    { header: 'Status', cell: (row) => <span style={{ color: row.status === 'Good' ? '#10b981' : '#ef4444', fontSize: '0.8rem' }}>{row.status}</span> },
    { header: 'Actions', cell: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => handleEditBook(row)} className="btn-icon"><Edit size={16} /></button>
        <button onClick={() => handleDeleteBook(row._id)} className="btn-icon btn-icon-danger"><Trash2 size={16} /></button>
      </div>
    )}
  ];

  const transColumns = [
    { header: 'Book', cell: (row) => row.book?.title || 'Unknown' },
    { header: 'Member', cell: (row) => row.user?.username || 'Unknown' },
    { 
      header: 'Due Date', 
      cell: (row) => (
        <span style={{ color: new Date(row.dueDate) < new Date() && row.status === 'Issued' ? '#ef4444' : '' }}>
          {new Date(row.dueDate).toLocaleDateString()}
        </span>
      )
    },
    { header: 'Action', cell: (row) => (
      row.status === 'Issued' ? <button className="btn btn-primary btn-sm" onClick={() => handleReturnBook(row._id)}>Return</button> :
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
            <span className="stat-card-title">Total Inventory</span>
            <span className="stat-card-value">{books.length}</span>
          </div>
        </div>
        <div className="stat-card" style={{ border: overdueTransactions.length > 0 ? '1px solid #ef4444' : '' }}>
          <div className="stat-icon-wrapper danger"><AlertCircle size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Overdue Alerts</span>
            <span className="stat-card-value" style={{ color: overdueTransactions.length > 0 ? '#ef4444' : '' }}>{overdueTransactions.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper success"><Star size={20} /></div>
          <div className="stat-card-info">
            <span className="stat-card-title">Faculty Recs</span>
            <span className="stat-card-value">{recommendations.filter(r => r.status === 'Pending').length}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {overdueTransactions.length > 0 && (
          <div className="dashboard-section" style={{ borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
            <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={20} /> Critical Overdue List</h3>
            <DataTable columns={transColumns} data={overdueTransactions} loading={loading} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div className="dashboard-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Inventory Control</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setIsBookModalOpen(true)}>
                <Plus size={16} /> New Book
              </button>
            </div>
            <DataTable columns={bookColumns} data={books} loading={loading} />
          </div>

          <div className="dashboard-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Loan Requests</h3>
            </div>
            <DataTable 
              columns={transColumns} 
              data={transactions.filter(t => t.status === 'Pending Approval')} 
              loading={loading} 
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Book Modal */}
      <Modal isOpen={isBookModalOpen || isEditBookModalOpen} onClose={() => {setIsBookModalOpen(false); setIsEditBookModalOpen(false)}} title={isEditBookModalOpen ? "Edit Book" : "Add Book"}>
        <form className="modal-form" onSubmit={isEditBookModalOpen ? handleUpdateBook : handleAddBook}>
          <div className="modal-form-group"><label>Title</label><input type="text" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Author</label><input type="text" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group"><label>Shelf Location</label><input type="text" value={bookForm.shelfLocation} onChange={e => setBookForm({...bookForm, shelfLocation: e.target.value})} placeholder="e.g. A-12" /></div>
            <div className="modal-form-group"><label>Category</label><input type="text" value={bookForm.category} onChange={e => setBookForm({...bookForm, category: e.target.value})} placeholder="e.g. Science" /></div>
          </div>
          <div className="modal-form-group"><label>Copies</label><input type="number" value={bookForm.totalCopies} onChange={e => setBookForm({...bookForm, totalCopies: e.target.value})} required /></div>
          <div className="modal-actions">
            <button type="submit" className="modal-btn modal-btn-submit">{isEditBookModalOpen ? 'Save Changes' : 'Add Book'}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default LibrarianDashboard;
