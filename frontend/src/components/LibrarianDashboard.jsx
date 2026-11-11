import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Users,
  Clock,
  AlertTriangle,
  FileText,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  RotateCcw,
  RefreshCw,
  Check,
  X,
  Bookmark,
  ChevronRight,
  UserCheck,
  Send,
  Loader2,
  Calendar,
  Layers,
  MapPin,
  Lock
} from 'lucide-react';
import { api } from '../services/api';

export default function LibrarianDashboard({
  currentUser,
  onOpenAuth,
  onShowToast,
  onNavigate,
  onCatalogChanged
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, books, members, borrowings, requests

  // Overview stats state
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Books state
  const [booksList, setBooksList] = useState([]);
  const [bookSearch, setBookSearch] = useState('');
  const [bookCategoryFilter, setBookCategoryFilter] = useState('All');
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

  // Members state
  const [membersList, setMembersList] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [selectedMemberForHistory, setSelectedMemberForHistory] = useState(null);
  const [memberLoansHistory, setMemberLoansHistory] = useState([]);
  const [isLoadingMemberHistory, setIsLoadingMemberHistory] = useState(false);

  // Borrowings state
  const [borrowingsList, setBorrowingsList] = useState([]);
  const [borrowingFilter, setBorrowingFilter] = useState('all'); // all, borrowed, overdue, returned
  const [borrowingSearch, setBorrowingSearch] = useState('');
  const [isLoadingBorrowings, setIsLoadingBorrowings] = useState(false);

  // Book Requests state
  const [requestsList, setRequestsList] = useState([]);
  const [requestFilter, setRequestFilter] = useState('pending'); // pending, approved, rejected, all
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [activeReviewRequest, setActiveReviewRequest] = useState(null);
  const [librarianNote, setLibrarianNote] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const isLibrarian = currentUser?.role === 'librarian';

  // 1. Fetch Overview Stats
  const loadOverviewStats = useCallback(async () => {
    if (!isLibrarian) return;
    setIsLoadingStats(true);
    try {
      const data = await api.librarian.getStats();
      setStats(data);
    } catch (err) {
      console.warn('Librarian stats error:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [isLibrarian]);

  // 2. Fetch Books
  const loadBooks = useCallback(async () => {
    if (!isLibrarian) return;
    setIsLoadingBooks(true);
    try {
      const data = await api.books.getAll({ limit: 150 });
      setBooksList(data || []);
    } catch (err) {
      console.warn('Books load error:', err);
    } finally {
      setIsLoadingBooks(false);
    }
  }, [isLibrarian]);

  // 3. Fetch Members
  const loadMembers = useCallback(async () => {
    if (!isLibrarian) return;
    setIsLoadingMembers(true);
    try {
      const data = await api.librarian.getMembers();
      setMembersList(data || []);
    } catch (err) {
      console.warn('Members load error:', err);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [isLibrarian]);

  // 4. Fetch Borrowings
  const loadBorrowings = useCallback(async () => {
    if (!isLibrarian) return;
    setIsLoadingBorrowings(true);
    try {
      const data = await api.librarian.getAllBorrowings(borrowingFilter);
      setBorrowingsList(data || []);
    } catch (err) {
      console.warn('Borrowings load error:', err);
    } finally {
      setIsLoadingBorrowings(false);
    }
  }, [isLibrarian, borrowingFilter]);

  // 5. Fetch Book Requests
  const loadRequests = useCallback(async () => {
    if (!isLibrarian) return;
    setIsLoadingRequests(true);
    try {
      const data = await api.bookRequests.getAll();
      setRequestsList(data || []);
    } catch (err) {
      console.warn('Requests load error:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [isLibrarian]);

  // Load appropriate data when tab changes
  useEffect(() => {
    if (!isLibrarian) return;
    if (activeTab === 'overview') {
      loadOverviewStats();
    } else if (activeTab === 'books') {
      loadBooks();
    } else if (activeTab === 'members') {
      loadMembers();
    } else if (activeTab === 'borrowings') {
      loadBorrowings();
    } else if (activeTab === 'requests') {
      loadRequests();
    }
  }, [activeTab, isLibrarian, loadOverviewStats, loadBooks, loadMembers, loadBorrowings, loadRequests]);

  // View member history
  const handleViewMemberHistory = async (member) => {
    setSelectedMemberForHistory(member);
    setIsLoadingMemberHistory(true);
    try {
      const history = await api.librarian.getMemberBorrowings(member.id);
      setMemberLoansHistory(history || []);
    } catch (err) {
      console.warn('Error fetching member history:', err);
      onShowToast?.(`Unable to load loans for ${member.full_name}.`);
    } finally {
      setIsLoadingMemberHistory(false);
    }
  };

  // Confirm Book Return (Circulation Check-in)
  const handleConfirmReturn = async (recordId, bookTitle) => {
    try {
      await api.borrowings.returnBook(recordId, {
        librarian_notes: `Return checked in at circulation desk by ${currentUser?.full_name || 'Librarian'}`
      });
      onShowToast?.(`Check-in Confirmed: "${bookTitle}" returned to library stacks.`);
      loadBorrowings();
      loadOverviewStats();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      onShowToast?.(err.message || 'Error processing book return.');
    }
  };

  // Quick adjust available copies
  const handleAdjustCopies = async (book, delta) => {
    const newCopies = Math.max(0, Math.min(book.total_copies, book.available_copies + delta));
    try {
      await api.books.update(book.id, { available_copies: newCopies });
      onShowToast?.(`Inventory updated for "${book.title}": ${newCopies} copies now available.`);
      loadBooks();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      onShowToast?.(err.message || 'Unable to update copies.');
    }
  };

  // Delete / Archive book
  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove "${book.title}" from active catalog?`)) {
      return;
    }
    try {
      await api.books.delete(book.id);
      onShowToast?.(`Book '${book.title}' archived successfully.`);
      loadBooks();
      loadOverviewStats();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      onShowToast?.(err.message || 'Unable to remove book.');
    }
  };

  // Approve or Reject Book Request
  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    setIsProcessingAction(true);
    try {
      await api.bookRequests.updateStatus(requestId, {
        status: newStatus,
        librarian_response: librarianNote.trim() || `Request ${newStatus} by librarian ${currentUser?.full_name || ''}.`
      });
      onShowToast?.(`Request #${requestId} has been marked as ${newStatus.toUpperCase()}.`);
      setActiveReviewRequest(null);
      setLibrarianNote('');
      loadRequests();
      loadOverviewStats();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to update request.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Save Book (Add or Edit)
  const handleSaveBook = async (e, bookData, isEdit) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.books.update(bookData.id, bookData);
        onShowToast?.(`Book "${bookData.title}" updated successfully.`);
      } else {
        await api.books.create(bookData);
        onShowToast?.(`New book "${bookData.title}" added to catalog.`);
      }
      setIsAddBookModalOpen(false);
      setEditingBook(null);
      loadBooks();
      loadOverviewStats();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to save book.');
    }
  };

  // Trigger Circulation Scan
  const handleRunAuditScan = async () => {
    try {
      await api.borrowings.triggerScan();
      onShowToast?.('Automated circulation audit and overdue scan completed successfully.');
      loadOverviewStats();
      if (activeTab === 'borrowings') loadBorrowings();
    } catch (err) {
      onShowToast?.('Failed to run audit scan.');
    }
  };

  // ACCESS CONTROL RESTRICTION
  if (!isLibrarian) {
    return (
      <div className="librarian-dashboard-view">
        <section className="page-header-band">
          <div className="container">
            <span className="page-breadcrumb">Staff Administration &gt; Access Control</span>
            <h1 className="page-title">Circulation Desk & Librarian Portal</h1>
          </div>
        </section>

        <div className="container access-denied-container">
          <div className="access-denied-card">
            <div className="access-denied-icon-wrap">
              <Lock size={48} className="lock-icon" />
            </div>
            <h2 className="access-denied-title">Staff Authorization Required</h2>
            <p className="access-denied-desc">
              The Librarian Dashboard is restricted to staff officers holding verified library credentials. 
              {currentUser ? (
                <>
                  You are currently logged in as <strong>{currentUser.full_name}</strong> (Member #{currentUser.member_card_no}, Role: <em>{currentUser.role}</em>). 
                  Ordinary patron accounts do not have clearance for catalog inventory modifications or circulation desk management.
                </>
              ) : (
                <>
                  You are currently not signed in. Please log in with staff credentials to proceed.
                </>
              )}
            </p>

            <div className="access-denied-notice-box">
              <strong>Staff Authorization Notice:</strong>
              <p>Please contact the LibraryEase Systems Administrator or Head Librarian to obtain circulation desk credentials.</p>
              <span className="notice-sub">Access to staff circulation services is authenticated, logged, and audited.</span>
            </div>

            <div className="access-denied-actions">
              <button 
                type="button" 
                className="btn-parchment-primary"
                onClick={onOpenAuth}
              >
                <ShieldCheck size={16} />
                <span>Sign In as Staff Librarian</span>
              </button>
              <button 
                type="button" 
                className="btn-parchment-secondary"
                onClick={() => onNavigate('home')}
              >
                <span>Return to Public Library</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filtered books
  const filteredBooks = booksList.filter((b) => {
    const matchesSearch = !bookSearch || 
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
      (b.isbn && b.isbn.toLowerCase().includes(bookSearch.toLowerCase())) ||
      (b.shelf_location && b.shelf_location.toLowerCase().includes(bookSearch.toLowerCase()));
    const matchesCat = bookCategoryFilter === 'All' || b.category === bookCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filtered members
  const filteredMembers = membersList.filter((m) => {
    if (!memberSearch) return true;
    const term = memberSearch.toLowerCase();
    return m.full_name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      m.member_card_no.toLowerCase().includes(term);
  });

  // Filtered borrowings
  const filteredBorrowings = borrowingsList.filter((b) => {
    if (!borrowingSearch) return true;
    const term = borrowingSearch.toLowerCase();
    const titleMatch = b.book?.title?.toLowerCase().includes(term);
    const userMatch = b.user?.full_name?.toLowerCase().includes(term) || b.user?.member_card_no?.toLowerCase().includes(term);
    return titleMatch || userMatch;
  });

  // Filtered requests
  const filteredRequests = requestsList.filter((r) => {
    if (requestFilter === 'all') return true;
    return r.status.toLowerCase() === requestFilter.toLowerCase();
  });

  return (
    <div className="librarian-dashboard-view">
      {/* Staff Header Band */}
      <section className="page-header-band librarian-header-band">
        <div className="container header-with-badge">
          <div>
            <div className="staff-authority-pill">
              <ShieldCheck size={14} />
              <span>Authorized Staff Console • {currentUser.full_name} ({currentUser.member_card_no})</span>
            </div>
            <h1 className="page-title">Circulation Desk & Collection Management</h1>
            <p className="page-description">
              Central administrative control for catalog curation, member cards, physical returns, and acquisition requests.
            </p>
          </div>
          <div className="staff-actions-right">
            <button
              type="button"
              className="btn-parchment-secondary btn-header-action"
              onClick={handleRunAuditScan}
              title="Audit circulation and compute due-date reminder stages"
            >
              <RefreshCw size={14} />
              <span>Run Circulation Audit</span>
            </button>
            <button
              type="button"
              className="btn-parchment-primary btn-header-action"
              onClick={() => {
                setEditingBook(null);
                setIsAddBookModalOpen(true);
              }}
            >
              <PlusCircle size={15} />
              <span>Add New Book to Stacks</span>
            </button>
          </div>
        </div>
      </section>

      <div className="container main-dashboard-container">
        {/* Navigation Tabs Bar */}
        <div className="dashboard-tabs-bar librarian-tabs-bar">
          <button
            type="button"
            className={`dash-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Layers size={16} />
            <span>A. Overview</span>
          </button>
          <button
            type="button"
            className={`dash-tab-btn ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            <BookOpen size={16} />
            <span>B. Book Management</span>
          </button>
          <button
            type="button"
            className={`dash-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={16} />
            <span>C. Member Management</span>
          </button>
          <button
            type="button"
            className={`dash-tab-btn ${activeTab === 'borrowings' ? 'active' : ''}`}
            onClick={() => setActiveTab('borrowings')}
          >
            <Clock size={16} />
            <span>D. Borrowing Management</span>
          </button>
          <button
            type="button"
            className={`dash-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <FileText size={16} />
            <span>E. Book Requests {stats?.pending_requests ? `(${stats.pending_requests})` : ''}</span>
          </button>
        </div>

        {/* SECTION A: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="tab-pane-view overview-pane">
            {isLoadingStats ? (
              <div className="dashboard-loading-state">
                <Loader2 size={32} className="spin-icon" />
                <p>Auditing collection records and statistics...</p>
              </div>
            ) : (
              <>
                {/* 5 Core Metric Cards */}
                <div className="stats-metric-grid">
                  <div className="stat-card" onClick={() => setActiveTab('books')}>
                    <div className="stat-icon-wrap stat-sage">
                      <BookOpen size={24} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{stats?.total_books ?? '—'}</span>
                      <span className="stat-label">Total Books</span>
                      <span className="stat-meta">{stats?.total_copies ?? 0} total inventory copies ({stats?.available_copies ?? 0} available)</span>
                    </div>
                  </div>

                  <div className="stat-card" onClick={() => setActiveTab('members')}>
                    <div className="stat-icon-wrap stat-forest">
                      <Users size={24} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{stats?.registered_members ?? '—'}</span>
                      <span className="stat-label">Registered Members</span>
                      <span className="stat-meta">Active resident patron library cards</span>
                    </div>
                  </div>

                  <div className="stat-card" onClick={() => setActiveTab('borrowings')}>
                    <div className="stat-icon-wrap stat-amber">
                      <Clock size={24} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{stats?.active_borrowings ?? '—'}</span>
                      <span className="stat-label">Active Borrowings</span>
                      <span className="stat-meta">Books currently checked out across all branches</span>
                    </div>
                  </div>

                  <div className="stat-card" onClick={() => setActiveTab('borrowings')}>
                    <div className="stat-icon-wrap stat-coral">
                      <AlertTriangle size={24} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{stats?.overdue_borrowings ?? 0}</span>
                      <span className="stat-label">Overdue Books</span>
                      <span className="stat-meta">Past return due date; daily reminders active</span>
                    </div>
                  </div>

                  <div className="stat-card" onClick={() => setActiveTab('requests')}>
                    <div className="stat-icon-wrap stat-lavender">
                      <FileText size={24} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{stats?.pending_requests ?? 0}</span>
                      <span className="stat-label">Pending Book Requests</span>
                      <span className="stat-meta">Patron acquisition recommendations awaiting review</span>
                    </div>
                  </div>
                </div>

                {/* Quick Workflow Action Banners */}
                <div className="overview-workflow-grid">
                  <div className="workflow-card">
                    <h3 className="wf-title">Collection Stacks Action</h3>
                    <p className="wf-desc">
                      Add newly acquired books, catalog rare archival prints, and adjust available copy numbers.
                    </p>
                    <button
                      type="button"
                      className="btn-parchment-primary"
                      onClick={() => {
                        setEditingBook(null);
                        setIsAddBookModalOpen(true);
                      }}
                    >
                      <PlusCircle size={15} />
                      <span>Register New Catalog Title</span>
                    </button>
                  </div>

                  <div className="workflow-card">
                    <h3 className="wf-title">Patron Acquisition Requests</h3>
                    <p className="wf-desc">
                      Review {stats?.pending_requests || 0} pending recommendations from scholars and students for procurement.
                    </p>
                    <button
                      type="button"
                      className="btn-parchment-secondary"
                      onClick={() => setActiveTab('requests')}
                    >
                      <FileText size={15} />
                      <span>Review Book Requests</span>
                    </button>
                  </div>

                  <div className="workflow-card">
                    <h3 className="wf-title">Circulation Desk Check-in</h3>
                    <p className="wf-desc">
                      Inspect return drop-boxes, verify physical copy integrity, and confirm returns back to the stacks.
                    </p>
                    <button
                      type="button"
                      className="btn-parchment-secondary"
                      onClick={() => setActiveTab('borrowings')}
                    >
                      <Clock size={15} />
                      <span>Manage Active Circulation</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* SECTION B: BOOK MANAGEMENT */}
        {activeTab === 'books' && (
          <div className="tab-pane-view books-management-pane">
            <div className="pane-control-bar">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter books by title, author, ISBN, or shelf location..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                />
              </div>

              <div className="filter-actions">
                <button
                  type="button"
                  className="btn-parchment-primary"
                  onClick={() => {
                    setEditingBook(null);
                    setIsAddBookModalOpen(true);
                  }}
                >
                  <PlusCircle size={15} />
                  <span>Add New Book</span>
                </button>
              </div>
            </div>

            {isLoadingBooks ? (
              <div className="dashboard-loading-state">
                <Loader2 size={32} className="spin-icon" />
                <p>Loading catalog inventory...</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="empty-table-state">
                <BookOpen size={36} />
                <p>No books matched your search query.</p>
              </div>
            ) : (
              <div className="parchment-table-wrapper">
                <table className="parchment-table">
                  <thead>
                    <tr>
                      <th>Title & Author</th>
                      <th>Category</th>
                      <th>Shelf Location</th>
                      <th>Copies (Avail / Total)</th>
                      <th>Quick Copy Adjust</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((book) => (
                      <tr key={book.id}>
                        <td className="book-title-cell">
                          <strong className="table-book-title">{book.title}</strong>
                          <span className="table-book-author">by {book.author} {book.isbn ? `• ISBN: ${book.isbn}` : ''}</span>
                        </td>
                        <td>
                          <span className="category-pill">{book.category}</span>
                        </td>
                        <td>
                          <span className="shelf-tag">
                            <MapPin size={12} />
                            <span>{book.shelf_location || 'General Stacks'}</span>
                          </span>
                        </td>
                        <td>
                          <span className={`copies-badge ${book.available_copies > 0 ? 'copies-available' : 'copies-depleted'}`}>
                            {book.available_copies} / {book.total_copies}
                          </span>
                        </td>
                        <td>
                          <div className="copy-adjuster-btns">
                            <button
                              type="button"
                              className="btn-adjust"
                              title="Decrease available copy"
                              disabled={book.available_copies <= 0}
                              onClick={() => handleAdjustCopies(book, -1)}
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              className="btn-adjust"
                              title="Increase available copy"
                              disabled={book.available_copies >= book.total_copies}
                              onClick={() => handleAdjustCopies(book, 1)}
                            >
                              +1
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="table-row-actions">
                            <button
                              type="button"
                              className="btn-row-action"
                              title="Edit book details"
                              onClick={() => {
                                setEditingBook(book);
                                setIsAddBookModalOpen(true);
                              }}
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="btn-row-action btn-danger-action"
                              title="Deactivate / archive book"
                              onClick={() => handleDeleteBook(book)}
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECTION C: MEMBER MANAGEMENT */}
        {activeTab === 'members' && (
          <div className="tab-pane-view members-management-pane">
            <div className="pane-control-bar">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search members by cardholder name, card number, or email..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
              </div>
            </div>

            {isLoadingMembers ? (
              <div className="dashboard-loading-state">
                <Loader2 size={32} className="spin-icon" />
                <p>Retrieving registered patron database...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="empty-table-state">
                <Users size={36} />
                <p>No members found matching "{memberSearch}".</p>
              </div>
            ) : (
              <div className="parchment-table-wrapper">
                <table className="parchment-table">
                  <thead>
                    <tr>
                      <th>Cardholder Name</th>
                      <th>Card Number</th>
                      <th>Contact Info</th>
                      <th>Account Role</th>
                      <th>Active Loans</th>
                      <th>Overdue Status</th>
                      <th>Borrowing Record</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member.id}>
                        <td>
                          <strong>{member.full_name}</strong>
                        </td>
                        <td>
                          <span className="card-number-tag">{member.member_card_no}</span>
                        </td>
                        <td>
                          <div className="contact-col">
                            <span>{member.email}</span>
                            {member.phone && <small>{member.phone}</small>}
                          </div>
                        </td>
                        <td>
                          <span className={`role-pill ${member.role === 'librarian' ? 'role-staff' : 'role-patron'}`}>
                            {member.role === 'librarian' ? 'Staff Librarian' : 'Resident Patron'}
                          </span>
                        </td>
                        <td>
                          <span className="badge-counter-small">{member.active_loans_count} active</span>
                        </td>
                        <td>
                          {member.overdue_loans_count > 0 ? (
                            <span className="status-overdue-tag">
                              <AlertTriangle size={12} />
                              <span>{member.overdue_loans_count} overdue</span>
                            </span>
                          ) : (
                            <span className="status-clean-tag">
                              <CheckCircle2 size={12} />
                              <span>In Good Standing</span>
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-row-action"
                            onClick={() => handleViewMemberHistory(member)}
                          >
                            <Clock size={14} />
                            <span>View History ({member.total_borrowed_count})</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECTION D: BORROWING MANAGEMENT */}
        {activeTab === 'borrowings' && (
          <div className="tab-pane-view borrowings-management-pane">
            <div className="pane-control-bar">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter by title, patron name, or card number..."
                  value={borrowingSearch}
                  onChange={(e) => setBorrowingSearch(e.target.value)}
                />
              </div>

              <div className="status-filter-pills">
                {['all', 'borrowed', 'overdue', 'returned'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-pill ${borrowingFilter === st ? 'active' : ''}`}
                    onClick={() => setBorrowingFilter(st)}
                  >
                    <span>{st === 'all' ? 'All Loans' : st.charAt(0).toUpperCase() + st.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            {isLoadingBorrowings ? (
              <div className="dashboard-loading-state">
                <Loader2 size={32} className="spin-icon" />
                <p>Loading circulation logs...</p>
              </div>
            ) : filteredBorrowings.length === 0 ? (
              <div className="empty-table-state">
                <Clock size={36} />
                <p>No borrowing records found for this filter.</p>
              </div>
            ) : (
              <div className="parchment-table-wrapper">
                <table className="parchment-table">
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Borrower (Card #)</th>
                      <th>Borrowed Date</th>
                      <th>Due Date</th>
                      <th>Status & Days Left</th>
                      <th>Renewals</th>
                      <th>Desk Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBorrowings.map((rec) => {
                      const isOverdue = rec.status === 'overdue' || (rec.days_remaining < 0 && rec.status !== 'returned');
                      const isReturned = rec.status === 'returned';

                      return (
                        <tr key={rec.id}>
                          <td>
                            <strong>{rec.book?.title || `Book #${rec.book_id}`}</strong>
                            <span className="table-sub">{rec.book?.author}</span>
                          </td>
                          <td>
                            <strong>{rec.user?.full_name}</strong>
                            <span className="table-sub">Card: {rec.user?.member_card_no}</span>
                          </td>
                          <td>{rec.borrow_date}</td>
                          <td>
                            <strong className={isOverdue ? 'text-overdue' : ''}>{rec.due_date}</strong>
                          </td>
                          <td>
                            {isReturned ? (
                              <span className="status-badge-returned">Returned on {rec.return_date}</span>
                            ) : isOverdue ? (
                              <span className="status-badge-overdue">Overdue by {Math.abs(rec.days_remaining)} days</span>
                            ) : (
                              <span className="status-badge-active">Due in {rec.days_remaining} days</span>
                            )}
                          </td>
                          <td>
                            <span>{rec.renew_count || 0} / 2 renewals</span>
                          </td>
                          <td>
                            {!isReturned ? (
                              <button
                                type="button"
                                className="btn-row-action btn-confirm-return"
                                onClick={() => handleConfirmReturn(rec.id, rec.book?.title)}
                              >
                                <Check size={14} />
                                <span>Confirm Return</span>
                              </button>
                            ) : (
                              <span className="checked-in-label">
                                <CheckCircle2 size={13} />
                                <span>Checked in</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECTION E: BOOK REQUESTS */}
        {activeTab === 'requests' && (
          <div className="tab-pane-view requests-management-pane">
            <div className="pane-control-bar">
              <div className="status-filter-pills">
                {['pending', 'approved', 'rejected', 'all'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-pill ${requestFilter === st ? 'active' : ''}`}
                    onClick={() => setRequestFilter(st)}
                  >
                    <span>{st === 'all' ? 'All Requests' : st.charAt(0).toUpperCase() + st.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            {isLoadingRequests ? (
              <div className="dashboard-loading-state">
                <Loader2 size={32} className="spin-icon" />
                <p>Loading acquisition requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="empty-table-state">
                <FileText size={36} />
                <p>No book requests found matching status "{requestFilter}".</p>
              </div>
            ) : (
              <div className="requests-cards-list">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="librarian-request-card">
                    <div className="req-card-top">
                      <div>
                        <div className="req-id-tag">REQ-{String(req.id).padStart(5, '0')}</div>
                        <h3 className="req-book-title">{req.book_title}</h3>
                        <p className="req-book-author">by {req.author} • Category: {req.category || 'General'}</p>
                      </div>
                      <span className={`status-pill status-${req.status}`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="req-reason-box">
                      <strong>Patron's Stated Reason:</strong>
                      <p>"{req.reason}"</p>
                    </div>

                    <div className="req-patron-meta">
                      <span>Submitted by: <strong>{req.user_name}</strong> ({req.user_email})</span>
                      <span>Date: {new Date(req.created_at).toLocaleDateString()}</span>
                    </div>

                    {req.librarian_response && (
                      <div className="req-librarian-note-display">
                        <strong>Librarian Disposition Note:</strong>
                        <p>{req.librarian_response}</p>
                      </div>
                    )}

                    <div className="req-action-footer">
                      <button
                        type="button"
                        className="btn-parchment-primary btn-approve"
                        onClick={() => {
                          setActiveReviewRequest(req);
                          setLibrarianNote(req.librarian_response || 'Approved. Volume added to inter-library procurement list.');
                        }}
                      >
                        <Check size={14} />
                        <span>{req.status === 'approved' ? 'Update Response' : 'Approve Request'}</span>
                      </button>

                      {req.status !== 'rejected' && (
                        <button
                          type="button"
                          className="btn-parchment-secondary btn-reject"
                          onClick={() => {
                            setActiveReviewRequest(req);
                            setLibrarianNote(req.librarian_response || 'Declined. Similar titles exist in department catalog or out of print.');
                          }}
                        >
                          <X size={14} />
                          <span>Reject Request</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MEMBER BORROWING HISTORY MODAL */}
      {selectedMemberForHistory && (
        <div className="vintage-modal-overlay" role="dialog" aria-modal="true">
          <div className="vintage-modal-card member-history-modal">
            <div className="vintage-modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="vintage-modal-title">Patron Circulation Record</h3>
                  <p className="vintage-modal-sub">
                    Borrowing ledger for <strong>{selectedMemberForHistory.full_name}</strong> (#{selectedMemberForHistory.member_card_no})
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setSelectedMemberForHistory(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="vintage-modal-body">
              {isLoadingMemberHistory ? (
                <div className="dashboard-loading-state">
                  <Loader2 size={28} className="spin-icon" />
                  <p>Loading member ledger...</p>
                </div>
              ) : memberLoansHistory.length === 0 ? (
                <p className="empty-desc-p">No loans on record for this cardholder.</p>
              ) : (
                <div className="parchment-table-wrapper">
                  <table className="parchment-table">
                    <thead>
                      <tr>
                        <th>Book Title</th>
                        <th>Borrowed</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberLoansHistory.map((loan) => (
                        <tr key={loan.id}>
                          <td><strong>{loan.book?.title || `Book #${loan.book_id}`}</strong></td>
                          <td>{loan.borrow_date}</td>
                          <td>{loan.due_date}</td>
                          <td>
                            <span className={`status-badge-${loan.status}`}>
                              {loan.status}
                            </span>
                          </td>
                          <td>
                            {loan.status !== 'returned' && (
                              <button
                                type="button"
                                className="btn-row-action"
                                onClick={async () => {
                                  await handleConfirmReturn(loan.id, loan.book?.title);
                                  handleViewMemberHistory(selectedMemberForHistory);
                                }}
                              >
                                <Check size={12} />
                                <span>Return</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="vintage-modal-footer">
              <button 
                type="button" 
                className="btn-parchment-secondary"
                onClick={() => setSelectedMemberForHistory(null)}
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT BOOK MODAL */}
      {isAddBookModalOpen && (
        <BookEditModal
          book={editingBook}
          onClose={() => {
            setIsAddBookModalOpen(false);
            setEditingBook(null);
          }}
          onSave={handleSaveBook}
        />
      )}

      {/* REVIEW BOOK REQUEST MODAL */}
      {activeReviewRequest && (
        <div className="vintage-modal-overlay" role="dialog" aria-modal="true">
          <div className="vintage-modal-card review-request-modal">
            <div className="vintage-modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="vintage-modal-title">Review Acquisition Request</h3>
                  <p className="vintage-modal-sub">
                    REQ-{String(activeReviewRequest.id).padStart(5, '0')}: "{activeReviewRequest.book_title}"
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setActiveReviewRequest(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="vintage-modal-body">
              <div className="review-context-box">
                <p><strong>Patron:</strong> {activeReviewRequest.user_name} ({activeReviewRequest.user_email})</p>
                <p><strong>Author:</strong> {activeReviewRequest.author}</p>
                <p><strong>Category:</strong> {activeReviewRequest.category}</p>
                <p><strong>Reason:</strong> "{activeReviewRequest.reason}"</p>
              </div>

              <div className="vintage-form-field">
                <label htmlFor="librarian-note-input">Librarian Response / Procurement Status Note</label>
                <textarea
                  id="librarian-note-input"
                  rows={3}
                  value={librarianNote}
                  onChange={(e) => setLibrarianNote(e.target.value)}
                  placeholder="Enter response sent to the patron and displayed in their dashboard..."
                  className="vintage-textarea-field"
                />
              </div>

              <div className="review-modal-actions">
                <button
                  type="button"
                  className="btn-parchment-primary btn-approve"
                  disabled={isProcessingAction}
                  onClick={() => handleUpdateRequestStatus(activeReviewRequest.id, 'approved')}
                >
                  <Check size={15} />
                  <span>Approve Request</span>
                </button>
                <button
                  type="button"
                  className="btn-parchment-secondary btn-reject"
                  disabled={isProcessingAction}
                  onClick={() => handleUpdateRequestStatus(activeReviewRequest.id, 'rejected')}
                >
                  <X size={15} />
                  <span>Reject Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component: Book Add / Edit Modal
function BookEditModal({ book, onClose, onSave }) {
  const isEdit = Boolean(book);
  const [formData, setFormData] = useState({
    id: book?.id || null,
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    category: book?.category || 'Fiction',
    language: book?.language || 'English',
    publisher: book?.publisher || '',
    publication_year: book?.publication_year || new Date().getFullYear(),
    shelf_location: book?.shelf_location || 'General Stacks A-1',
    total_copies: book?.total_copies || 3,
    available_copies: book?.available_copies || 3,
    description: book?.description || '',
    tags: book?.tags || ''
  });

  return (
    <div className="vintage-modal-overlay" role="dialog" aria-modal="true">
      <div className="vintage-modal-card book-form-modal">
        <div className="vintage-modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="vintage-modal-title">{isEdit ? 'Edit Catalog Record' : 'Register New Book in Stacks'}</h3>
              <p className="vintage-modal-sub">
                {isEdit ? `Modifying catalog entry #${book.id}` : 'Enter catalog metadata and physical shelf location'}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => onSave(e, formData, isEdit)} className="vintage-modal-body">
          <div className="form-grid-2col">
            <div className="vintage-form-field">
              <label>Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="vintage-form-field">
              <label>Author *</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-3col">
            <div className="vintage-form-field">
              <label>Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="vintage-form-field">
              <label>ISBN</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              />
            </div>
            <div className="vintage-form-field">
              <label>Shelf Location *</label>
              <input
                type="text"
                required
                value={formData.shelf_location}
                onChange={(e) => setFormData({ ...formData, shelf_location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="vintage-form-field">
              <label>Total Copies</label>
              <input
                type="number"
                min="1"
                required
                value={formData.total_copies}
                onChange={(e) => setFormData({ ...formData, total_copies: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="vintage-form-field">
              <label>Available Copies</label>
              <input
                type="number"
                min="0"
                max={formData.total_copies}
                required
                value={formData.available_copies}
                onChange={(e) => setFormData({ ...formData, available_copies: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="vintage-form-field">
            <label>Description & Synopsis</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="vintage-modal-footer">
            <button type="button" className="btn-parchment-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-parchment-primary">
              <Check size={15} />
              <span>{isEdit ? 'Save Changes' : 'Add to Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
