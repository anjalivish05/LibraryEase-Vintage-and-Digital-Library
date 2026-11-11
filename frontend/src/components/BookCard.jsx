import React from 'react';
import { Star, Check, Clock, Bookmark, Eye, MapPin } from 'lucide-react';

export default function BookCard({ book, onSelectBook, onBorrowToggle, isBorrowed = false }) {
  const isAvailable = book.availability.includes('Available');

  return (
    <article className="vintage-book-card" aria-label={`Book: ${book.title} by ${book.author}`}>
      {/* Prominent Book Cover Representation */}
      <div 
        className="book-cover-stage" 
        style={{ background: book.coverBg || 'linear-gradient(135deg, #355442 0%, #253D30 100%)' }}
        onClick={() => onSelectBook(book)}
      >
        <div className="book-spine-ridge" />
        <div className="book-cover-emboss-border" />
        
        {/* Vintage ribbon bookmark */}
        <div className="book-ribbon" />

        <div className="book-cover-content">
          <div className="book-cover-top">
            {book.badge && <span className="book-cover-badge">{book.badge}</span>}
          </div>

          <div className="book-title-block">
            <h4 className="book-title-serif">{book.title}</h4>
            <p className="book-author-italic">by {book.author}</p>
          </div>

          <div className="book-cover-meta">
            <span className="book-meta-genre">{book.genre || book.category}</span>
            <span className="book-meta-pages">{book.pages} pp</span>
          </div>
        </div>
      </div>

      {/* Book Card Body */}
      <div className="book-card-body">
        <div className="book-card-top-row">
          <span className="book-category-pill">{book.category}</span>
          <div className="book-rating" title={`${book.rating} out of 5 stars`}>
            <Star size={13} className="star-icon filled" />
            <span className="rating-value">{book.rating}</span>
            <span className="reviews-count">({book.reviewsCount})</span>
          </div>
        </div>

        <h3 className="book-card-title" onClick={() => onSelectBook(book)}>
          {book.title}
        </h3>
        <p className="book-card-author">
          By <span className="author-name">{book.author}</span> • <span className="pub-year">{book.year}</span>
        </p>

        <p className="book-card-desc">
          {book.description.length > 120 
            ? `${book.description.substring(0, 120)}...` 
            : book.description}
        </p>

        {/* Shelf location */}
        <div className="book-shelf-location">
          <MapPin size={12} className="shelf-icon" />
          <span>{book.shelfLocation}</span>
        </div>

        {/* Availability Badge: Uses Muted Sage (#9BAF98) for available */}
        <div className="book-status-row">
          <span className={`status-badge ${isAvailable ? 'status-sage-available' : 'status-on-loan'}`}>
            <span className="status-dot" />
            {book.availability}
          </span>
          <span className="call-number-badge">#{book.callNumber}</span>
        </div>

        {/* Action Buttons */}
        <div className="book-card-actions">
          <button
            type="button"
            className="btn-book-details"
            onClick={() => onSelectBook(book)}
            title="View complete book information and branch holdings"
          >
            <Eye size={14} />
            <span>Details</span>
          </button>

          <button
            type="button"
            className={`btn-book-borrow ${isBorrowed ? 'btn-borrowed' : ''}`}
            onClick={() => onBorrowToggle(book)}
            title={isBorrowed ? "Return to library catalog" : "Borrow or place a reserve hold"}
          >
            {isBorrowed ? (
              <>
                <Check size={14} />
                <span>On Loan</span>
              </>
            ) : isAvailable ? (
              <>
                <Bookmark size={14} />
                <span>Borrow</span>
              </>
            ) : (
              <>
                <Clock size={14} />
                <span>Hold</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
