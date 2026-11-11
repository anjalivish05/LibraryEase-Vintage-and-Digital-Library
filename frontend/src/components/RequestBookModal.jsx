import React, { useState, useEffect } from 'react';
import { 
  BookPlus, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BookOpen, 
  User, 
  Mail, 
  Bookmark, 
  FileText 
} from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = [
  'Fiction & Classics',
  'Computer Science & Programming',
  'Historical Fiction & Non-Fiction',
  'Science & Technology',
  'Philosophy & Social Sciences',
  'Self-Help & Personal Development',
  'Children & Young Adult',
  'Indian Literature & History',
  'Art, Architecture & Photography',
  'Other / Inter-Disciplinary'
];

export default function RequestBookModal({ isOpen, onClose, currentUser, onSuccess, onShowToast }) {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    book_title: '',
    author: '',
    category: CATEGORIES[0],
    reason: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successSubmitted, setSuccessSubmitted] = useState(null);

  // Sync current user info when opened
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessSubmitted(null);
      setFormData((prev) => ({
        ...prev,
        user_name: currentUser?.full_name || '',
        user_email: currentUser?.email || '',
        book_title: '',
        author: '',
        category: CATEGORIES[0],
        reason: ''
      }));
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.book_title.trim()) {
      setErrorMessage('Please enter the book title.');
      return;
    }
    if (!formData.author.trim()) {
      setErrorMessage('Please enter the author or editor name.');
      return;
    }
    if (!formData.reason.trim() || formData.reason.trim().length < 8) {
      setErrorMessage('Please provide a brief reason for your acquisition request (at least 8 characters).');
      return;
    }
    if (!currentUser && (!formData.user_name.trim() || !formData.user_email.trim())) {
      setErrorMessage('Please provide your name and contact email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        user_name: formData.user_name.trim() || (currentUser?.full_name || 'Library Patron'),
        user_email: formData.user_email.trim() || (currentUser?.email || 'patron@libraryease.org'),
        book_title: formData.book_title.trim(),
        author: formData.author.trim(),
        category: formData.category,
        reason: formData.reason.trim()
      };

      const res = await api.bookRequests.submit(payload);

      setSuccessSubmitted(res);
      if (onShowToast) {
        onShowToast(`Request Submitted: "${res.book_title}" has been placed in the collection review queue.`);
      }
      if (onSuccess) {
        onSuccess(res);
      }
    } catch (err) {
      console.error('Book request error:', err);
      setErrorMessage(err.message || 'Unable to submit book request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vintage-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="request-modal-title">
      <div className="vintage-modal-card request-book-modal">
        {/* Modal Header */}
        <div className="vintage-modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <BookPlus size={20} />
            </div>
            <div>
              <h3 id="request-modal-title" className="vintage-modal-title">Request a Book for Collection</h3>
              <p className="vintage-modal-sub">
                Suggest titles, academic monographs, or archival books not currently in our branches.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close request modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="vintage-modal-body">
          {successSubmitted ? (
            <div className="request-success-panel" role="status">
              <div className="success-icon-wrap">
                <CheckCircle2 size={42} className="success-check-icon" />
              </div>
              <h4 className="success-heading">Acquisition Request Recorded</h4>
              <p className="success-lead">
                Thank you for your recommendation. Your request for <strong>"{successSubmitted.book_title}"</strong> by {successSubmitted.author} has been submitted for review by the library acquisitions committee.
              </p>

              <div className="request-receipt-ledger">
                <div className="receipt-row">
                  <span className="rc-lbl">Request ID:</span>
                  <span className="rc-val">REQ-{String(successSubmitted.id).padStart(5, '0')}</span>
                </div>
                <div className="receipt-row">
                  <span className="rc-lbl">Status:</span>
                  <span className="rc-val status-badge-pending">Pending Review</span>
                </div>
                <div className="receipt-row">
                  <span className="rc-lbl">Department:</span>
                  <span className="rc-val">{successSubmitted.category || 'General'}</span>
                </div>
                <div className="receipt-row">
                  <span className="rc-lbl">Notification:</span>
                  <span className="rc-val">We will notify {successSubmitted.user_email} when acquired.</span>
                </div>
              </div>

              <div className="success-actions">
                <button 
                  type="button" 
                  className="btn-parchment-primary"
                  onClick={() => {
                    setSuccessSubmitted(null);
                    setFormData((prev) => ({
                      ...prev,
                      book_title: '',
                      author: '',
                      reason: ''
                    }));
                  }}
                >
                  <BookPlus size={15} />
                  <span>Request Another Volume</span>
                </button>
                <button 
                  type="button" 
                  className="btn-parchment-secondary"
                  onClick={onClose}
                >
                  <span>Close Window</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="request-book-form">
              {errorMessage && (
                <div className="form-error-banner" role="alert">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Patron Info Bar */}
              {currentUser ? (
                <div className="patron-context-bar">
                  <User size={15} />
                  <span>Submitting as registered member: <strong>{currentUser.full_name}</strong> ({currentUser.member_card_no})</span>
                </div>
              ) : (
                <div className="form-guest-row">
                  <div className="vintage-form-field">
                    <label htmlFor="req-user-name">Your Full Name *</label>
                    <div className="input-with-icon">
                      <User size={16} className="field-icon" />
                      <input
                        id="req-user-name"
                        type="text"
                        required
                        placeholder="e.g. Rohini Deshmukh"
                        value={formData.user_name}
                        onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="vintage-form-field">
                    <label htmlFor="req-user-email">Email Address *</label>
                    <div className="input-with-icon">
                      <Mail size={16} className="field-icon" />
                      <input
                        id="req-user-email"
                        type="email"
                        required
                        placeholder="e.g. rohini@example.in"
                        value={formData.user_email}
                        onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Book Title & Author */}
              <div className="form-grid-2col">
                <div className="vintage-form-field">
                  <label htmlFor="req-book-title">
                    Book Title <span className="req-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <BookOpen size={16} className="field-icon" />
                    <input
                      id="req-book-title"
                      type="text"
                      required
                      placeholder="e.g. Maximum City: Bombay Lost and Found"
                      value={formData.book_title}
                      onChange={(e) => setFormData({ ...formData, book_title: e.target.value })}
                    />
                  </div>
                </div>

                <div className="vintage-form-field">
                  <label htmlFor="req-author">
                    Author / Editor <span className="req-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Bookmark size={16} className="field-icon" />
                    <input
                      id="req-author"
                      type="text"
                      required
                      placeholder="e.g. Suketu Mehta"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="vintage-form-field">
                <label htmlFor="req-category">Library Classification / Subject Category</label>
                <select
                  id="req-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="vintage-select-field"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Reason for Request */}
              <div className="vintage-form-field">
                <label htmlFor="req-reason">
                  Reason for Request <span className="req-star">*</span>
                </label>
                <textarea
                  id="req-reason"
                  rows={3}
                  required
                  placeholder="Tell us why this book would be valuable to you or the community (e.g., college research, entrance exam preparation, historical interest)..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="vintage-textarea-field"
                />
                <span className="field-hint">
                  Detailed reasons help our acquisition committee prioritize procurement and inter-library loan requests.
                </span>
              </div>

              {/* Modal Footer Controls */}
              <div className="vintage-modal-footer">
                <button
                  type="button"
                  className="btn-parchment-secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-parchment-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <BookPlus size={16} />
                      <span>Submit Book Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
