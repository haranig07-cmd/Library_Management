import React from 'react';
import './BookCard.css';

const BookCard = ({ book, onRequest }) => {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="book-card">
      <div className="book-cover">
        {/* Placeholder image since we don't store actual images in DB yet */}
        <img src={`https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300`} alt={book.title} />
        <div className={`availability-badge ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? 'Available' : 'Out of Stock'}
        </div>
      </div>
      
      <div className="book-details">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">By {book.author}</p>
        <p className="book-subject">{book.subject}</p>
        
        <div className="book-meta">
          <span>ISBN: {book.isbn}</span>
          <span>{book.availableCopies} / {book.totalCopies} copies</span>
        </div>
        
        <button 
          className="btn btn-primary request-btn" 
          disabled={!isAvailable}
          onClick={() => onRequest(book)}
        >
          {isAvailable ? 'Request Issue' : 'Currently Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default BookCard;
