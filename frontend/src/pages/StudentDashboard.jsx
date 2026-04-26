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
      
      if (res.ok) {
        alert(`Request submitted for "${book.title}". Please wait for librarian approval.`);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to request book');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    }
  };

  const myBorrowedColumns = [
    { header: 'Book Title', cell: (row) => row.book?.title || 'Unknown' },
    { header: 'Issue Date', cell: (row) => new Date(row.issueDate).toLocaleDateString() },
    { 
      header: 'Due Date', 
      cell: (row) => {
        const isOverdue = row.status === 'Issued' && new Date(row.dueDate) < new Date();
        return (
          <span style={{ color: isOverdue ? '#dc2626' : 'inherit', fontWeight: isOverdue ? 'bold' : 'normal' }}>
            {new Date(row.dueDate).toLocaleDateString()} {isOverdue && '(Overdue)'}
          </span>
        );
      }
    },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className={`badge ${row.status === 'Returned' ? 'badge-success' : 'badge-warning'}`}>
          {row.status}
        </span>
      )
    },
    { header: 'Fine Paid', cell: (row) => row.fineAmount > 0 ? `$${row.fineAmount}` : '-' }
  ];

  const activeBorrowed = transactions.filter(t => t.status === 'Issued').length;
  const outstandingFines = transactions.reduce((acc, t) => acc + (t.fineAmount || 0), 0);

  return (
    <DashboardLayout role="Student" title="Student Portal">
      <div className="stat-cards-grid">
        <div className="stat-card">
          <span className="stat-card-title">Currently Borrowed</span>
          <span className="stat-card-value">{activeBorrowed}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-title">Total Books Read</span>
          <span className="stat-card-value">{transactions.filter(t => t.status === 'Returned').length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-title">Outstanding Fines</span>
          <span className="stat-card-value" style={{ color: outstandingFines > 0 ? '#dc2626' : '#10b981' }}>${outstandingFines.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="dashboard-section" id="borrowed">
        <h3>My Borrowed Books</h3>
        <DataTable columns={myBorrowedColumns} data={transactions} loading={loading} emptyMessage="You haven't borrowed any books yet." />
      </div>
      
      <div className="dashboard-section" id="search">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3>Book Catalog</h3>
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
        
        {loading ? (
          <p>Loading catalog...</p>
        ) : books.length === 0 ? (
          <p>No books found.</p>
        ) : (
          <div className="books-grid">
            {books.map(book => (
              <BookCard key={book._id} book={book} onRequest={handleRequestIssue} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
