import React from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  BookOpen, 
  Tag, 
  CheckCircle, 
  Bookmark, 
  Clock
} from 'lucide-react';

export default function BookModal({ book, onClose, onBorrowToggle, isBorrowed }) {
  if (!book) return null;

  const isAvailable = book.availability.includes('Available');

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-book-title">
      <div className="vintage-modal-card" onClick={(e) => e.stopPropagation()}>
        <button 
          type="button" 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close modal dialog"
        >
          <X size={18} />
        </button>

        <div className="modal-content-grid">
          {/* Left Book Display (Vintage Cloth Spine Representation) */}
          <div className="modal-book-cover-col" style={{ background: book.coverBg || 'linear-gradient(135deg, #355442 0%, #253D30 100%)' }}>
            <div className="modal-cover-spine" />
            <div className="modal-emboss-frame" />
            <div className="modal-cover-details">
              <span className="modal-cover-badge">{book.badge || 'Library Collection'}</span>
              <h2 id="modal-book-title" className="modal-cover-title">{book.title}</h2>
              <p className="modal-cover-author">by {book.author}</p>
              <div className="modal-cover-meta">
                <span>{book.year}</span>
                <span>•</span>
                <span>{book.pages} pages</span>
                <span>•</span>
                <span>{book.genre || book.category}</span>
              </div>
            </div>
          </div>

          {/* Right Detailed Information */}
          <div className="modal-details-col">
            <div className="modal-top-tags">
              <span className="modal-category-tag">{book.category}</span>
              <div className="modal-rating">
                <Star size={15} className="star-icon filled" />
                <strong>{book.rating}</strong>
                <span>({book.reviewsCount} member ratings)</span>
              </div>
            </div>

            <h3 className="modal-heading-title">{book.title}</h3>
            <p className="modal-heading-author">Written by <strong>{book.author}</strong></p>

            <div className="modal-divider" />

            <div className="modal-section">
              <h4 className="section-subheading">About this Volume</h4>
              <p className="modal-description-full">{book.description}</p>
            </div>

            {/* Catalog Metadata Specs */}
            <div className="modal-specs-grid">
              <div className="spec-item">
                <span className="spec-label">ISBN-13</span>
                <span className="spec-value">{book.isbn}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Call Number</span>
                <span className="spec-value">{book.callNumber}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Shelf Stacks</span>
                <span className="spec-value">{book.shelfLocation}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">System Availability</span>
                <span className="spec-value">
                  {book.copiesAvailable > 0 
                    ? `${book.copiesAvailable} of ${book.totalCopies} copies in network` 
                    : 'Currently Checked Out'}
                </span>
              </div>
            </div>

            {/* Subject Headings (Lavender Subtle Chips) */}
            {book.tags && book.tags.length > 0 && (
              <div className="modal-tags-container">
                <span className="tags-label"><Tag size={13} /> Subject Headings:</span>
                <div className="tags-list">
                  {book.tags.map((tag, idx) => (
                    <span key={idx} className="subject-chip-lavender">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Branch Availability Notice */}
            <div className="modal-branch-notice">
              <MapPin size={15} className="notice-pin" />
              <div>
                <strong>Holding Branch:</strong> David Sassoon Library, Fort & Mumbai Branches.
                <div className="notice-sub">Hold shelf pickup available within 24 hours of request.</div>
              </div>
            </div>

            {/* Action Buttons in Forest Green */}
            <div className="modal-actions-bar">
              <button
                type="button"
                className={`modal-btn-primary ${isBorrowed ? 'modal-btn-borrowed' : ''}`}
                onClick={() => onBorrowToggle(book)}
              >
                {isBorrowed ? (
                  <>
                    <CheckCircle size={16} />
                    <span>On Your Loan (Return Early)</span>
                  </>
                ) : isAvailable ? (
                  <>
                    <Bookmark size={16} />
                    <span>Borrow for 21 Days (Free)</span>
                  </>
                ) : (
                  <>
                    <Clock size={16} />
                    <span>Place Reserve Hold (Queue #1)</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="modal-btn-secondary"
                onClick={onClose}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
