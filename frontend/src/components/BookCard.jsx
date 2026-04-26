import React from 'react';
import './BookCard.css';

const BookCard = ({ book, onAction, actionLabel, disabled }) => {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="book-card">
      <div className="book-cover">
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
          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>ISBN: {book.isbn}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{book.availableCopies} / {book.totalCopies} copies</span>
        </div>
        
        <button 
          className={`btn ${disabled ? 'btn-secondary' : 'btn-primary'} request-btn`}
          disabled={disabled}
          onClick={() => onAction(book)}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {actionLabel || (isAvailable ? 'Request Issue' : 'Currently Unavailable')}
        </button>
      </div>
    </div>
  );
};

export default BookCard;
