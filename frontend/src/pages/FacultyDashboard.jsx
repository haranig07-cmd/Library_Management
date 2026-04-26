import { API_BASE_URL } from '../api';

const FacultyDashboard = () => {
  // ...
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
        alert(`Reservation request for "${book.title}" submitted successfully.`);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reserve book');
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
        alert('Recommendation submitted to librarian!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const transColumns = [
    { header: 'Book Title', cell: (row) => row.book?.title || 'Unknown' },
    { header: 'Borrow Date', cell: (row) => row.issueDate ? new Date(row.issueDate).toLocaleDateString() : '-' },
    { header: 'Return Date', cell: (row) => row.returnDate ? new Date(row.returnDate).toLocaleDateString() : '-' },
    { header: 'Status', cell: (row) => (
      <span className={`badge ${row.status === 'Returned' ? 'badge-success' : 'badge-warning'}`}>
        {row.status}
      </span>
    )}
  ];

  return (
    <DashboardLayout role="Faculty" title="Faculty Dashboard">
      <div className="stat-cards-grid">
        <div className="stat-card">
          <span className="stat-card-title">Borrowed Books</span>
          <span className="stat-card-value">{transactions.filter(t => t.status === 'Issued').length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-title">Active Requests</span>
          <span className="stat-card-value">{transactions.filter(t => t.status === 'Pending Approval').length}</span>
        </div>
        <button id="recommend" className="stat-card" onClick={() => setIsRecommendModalOpen(true)} style={{ textAlign: 'left', cursor: 'pointer', border: '1px dashed var(--secondary)' }}>
          <span className="stat-card-title">Quick Action</span>
          <span className="stat-card-value" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
            <BookPlus size={20} /> Recommend Book
          </span>
        </button>
      </div>

      <div className="dashboard-section" id="history">
        <h3>Borrowing & History</h3>
        <DataTable columns={transColumns} data={transactions} loading={loading} emptyMessage="No borrowing history found." />
      </div>

      <div className="dashboard-section" id="catalog">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3>Library Catalog & Reservations</h3>
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
            <BookCard key={book._id} book={book} onRequest={() => handleReserve(book)} />
          ))}
        </div>
      </div>

      <Modal isOpen={isRecommendModalOpen} onClose={() => setIsRecommendModalOpen(false)} title="Recommend a New Book">
        <form className="modal-form" onSubmit={handleRecommend}>
          <div className="modal-form-group"><label>Book Title</label><input type="text" value={recForm.title} onChange={e => setRecForm({...recForm, title: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Author</label><input type="text" value={recForm.author} onChange={e => setRecForm({...recForm, author: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Subject</label><input type="text" value={recForm.subject} onChange={e => setRecForm({...recForm, subject: e.target.value})} required /></div>
          <div className="modal-form-group"><label>Reason for Recommendation</label><textarea value={recForm.reason} onChange={e => setRecForm({...recForm, reason: e.target.value})} required style={{ width: '100%', height: '100px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.5rem' }} /></div>
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
