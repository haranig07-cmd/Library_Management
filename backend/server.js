console.log('🚀 SERVER STARTING UP...');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const systemRoutes = require('./routes/systemRoutes');

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://library-management-snowy-chi.vercel.app'],
  credentials: true
}));

// Health check for Render
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Online', database: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...' });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/system', systemRoutes);

// Error handling for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Start server immediately
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to database in background
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('✅ MongoDB Connected successfully');
  
  try {
    const User = require('./models/User');
    const Book = require('./models/Book');
    
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🔍 Database is empty. Auto-seeding default users...');
      await User.create([
        { username: 'admin01', email: 'admin@edulib.edu', password: 'password123', role: 'Admin' },
        { username: 'librarian01', email: 'librarian@edulib.edu', password: 'password123', role: 'Librarian' },
        { username: 'faculty01', email: 'prof.smith@edulib.edu', password: 'password123', role: 'Faculty' },
        { username: 'student23', email: 'student@edulib.edu', password: 'password123', role: 'Student' }
      ]);
      console.log('Default users created successfully!');
    }

    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      console.log('Seeding initial book collection...');
      await Book.create([
        { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', subject: 'Literature', isbn: '9780743273565', totalCopies: 5, availableCopies: 5, edition: 'Classic' },
        { title: 'Clean Code', author: 'Robert C. Martin', subject: 'Computer Science', isbn: '9780132350884', totalCopies: 3, availableCopies: 3, edition: '1st Edition' },
        { title: 'Introduction to Algorithms', author: 'Cormen et al.', subject: 'Computer Science', isbn: '9780262033848', totalCopies: 4, availableCopies: 4, edition: '3rd Edition' },
        { title: 'Design Patterns', author: 'GoF', subject: 'Software Engineering', isbn: '9780201633610', totalCopies: 2, availableCopies: 2, edition: 'Addison-Wesley' }
      ]);
      console.log('Book collection seeded successfully!');
    }
  } catch (err) {
    console.error('Auto-seed error:', err);
  }
}).catch(err => {
  console.error('Database connection error:', err);
});
