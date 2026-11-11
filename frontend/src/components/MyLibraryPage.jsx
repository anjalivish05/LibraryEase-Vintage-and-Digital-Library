import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Bookmark, 
  BookOpen, 
  Barcode, 
  Info,
  Check,
  BookPlus,
  FileText,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { DEMO_USER, INITIAL_BORROWED_BOOKS, DEMO_HOLDS, DEMO_HISTORY } from '../data/myLibraryData';
import { api } from '../services/api';
import RequestBookModal from './RequestBookModal';

export default function MyLibraryPage({ 
  borrowedBooks = [], 
  currentUser = null,
  onRenewLoan, 
  onReturnLoan, 
  onNavigateToExplore,
  onShowToast,
  initialTab = 'loans'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [renewalNotice, setRenewalNotice] = useState(null);
  const [isRenewingId, setIsRenewingId] = useState(null);

  // Book Requests state
  const [bookRequests, setBookRequests] = useState([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  const patronName = currentUser ? currentUser.full_name : DEMO_USER.name;
  const patronCardNo = currentUser ? currentUser.member_card_no : DEMO_USER.cardNumber;
  const patronBranch = DEMO_USER.homeBranch;

  // Fetch patron's book requests
  const loadUserRequests = async () => {
    if (currentUser) {
      setIsLoadingRequests(true);
      try {
        const reqs = await api.bookRequests.getMy();
        if (Array.isArray(reqs)) {
          setBookRequests(reqs);
        }
      } catch (err) {
        console.warn('Error loading user book requests:', err);
      } finally {
        setIsLoadingRequests(false);
      }
    } else {
      // Demo request for guest mode
      setBookRequests([
        {
          id: 1,
          book_title: 'The Palace of Illusions',
          author: 'Chitra Banerjee Divakaruni',
          category: 'Indian Literature',
          reason: 'Feminist retelling of the Mahabharata from Panchaali’s perspective.',
          status: 'approved',
          librarian_response: 'Acquired and placed on Shelf F-12 at David Sassoon Library.',
          created_at: new Date(Date.now() - 86400000 * 5).toISOString()
        }
      ]);
    }
  };

  useEffect(() => {
    loadUserRequests();
  }, [currentUser]);

  // Handle Book Renewal with database sync
  const handleRenew = async (loanId, title) => {
    setIsRenewingId(loanId);
    try {
      const result = await onRenewLoan(loanId);
      if (result && result.success) {
        setRenewalNotice(`Success: "${title}" has been renewed until ${result.newDueDate}. (${result.remaining} renewals remaining)`);
      } else {
        setRenewalNotice(`Notice: "${title}" — ${result?.message || 'Cannot renew loan.'}`);
      }
    } catch (e) {
      setRenewalNotice(`Notice: "${title}" renewal failed: ${e.message}`);
    } finally {
      setIsRenewingId(null);
      setTimeout(() => {
        setRenewalNotice(null);
      }, 5500);
    }
  };

  const handleReturn = (loanId, title) => {
    onReturnLoan(loanId);
    setRenewalNotice(`Checked in: "${title}" returned to library circulation.`);
    setTimeout(() => {
      setRenewalNotice(null);
    }, 4500);
  };

  const overdueCount = borrowedBooks.filter((b) => b.daysLeft < 0 || b.status?.includes('overdue')).length;
  const dueSoonCount = borrowedBooks.filter((b) => b.daysLeft >= 0 && b.daysLeft <= 3).length;

  return (
    <div className="my-library-page-view">
      {/* Header Band */}
      <section className="page-header-band">
        <div className="container">
          <span className="page-breadcrumb">Patron Portal &gt; Borrowing Dashboard & Requests</span>
          <h1 className="page-title">Borrowing Dashboard & Circulation Records</h1>
          <p className="page-description">
            Monitor active loans, request 14-day renewal extensions, track reserve holds, 
            and submit acquisition recommendations for books not currently in our stacks.
          </p>
        </div>
      </section>

      <div className="container main-dashboard-container">
        {/* Status / Patron Mode Alert */}
        <div className="unverified-data-banner dashboard-demo-alert" role="status">
          <div className="unverified-banner-icon">
            <Info size={22} />
          </div>
          <div className="unverified-banner-text">
            <h4 className="unverified-title">
              {currentUser ? `Active Member Session: ${currentUser.full_name}` : 'Demonstration Patron Profile'}
            </h4>
            <p className="unverified-desc">
              {currentUser ? (
                <>
                  Viewing digital library card records for <strong>{currentUser.full_name}</strong> (#{currentUser.member_card_no}). 
                  Borrowings, renewals, and automated return reminders are synchronized with your account.
                </>
              ) : (
                <>
                  Viewing sample borrowing records for cardholder <strong>{DEMO_USER.name}</strong> (Card #{DEMO_USER.cardNumber}). 
                  Sign in or create a card using the <strong>Patron Sign In</strong> button in the navigation to link personal loans.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Temporary Renewal Toast Notification */}
        {renewalNotice && (
          <div className="renewal-toast-banner" role="alert">
            <CheckCircle2 size={18} />
            <span>{renewalNotice}</span>
          </div>
        )}

        {/* Top Ledger: Virtual Library Card & Circulation Metrics */}
        <div className="dashboard-top-grid">
          {/* Virtual Library Card */}
          <div className="patron-vintage-card">
            <div className="card-top-row">
              <div className="card-brand-group">
                <BookOpen size={18} className="card-book-icon" />
                <span className="card-brand-title">LibraryEase Public Card</span>
              </div>
              <span className="card-tier-badge">
                {currentUser?.role === 'librarian' ? 'Staff Librarian' : 'Resident Patron'}
              </span>
            </div>

            <div className="card-holder-middle">
              <span className="card-label-small">Cardholder Name</span>
              <h3 className="card-holder-fullname">{patronName}</h3>
              <p className="card-branch-desc">Home Branch: {patronBranch}</p>
            </div>

            <div className="card-bottom-row">
              <div>
                <span className="card-label-small">Patron ID</span>
                <span className="card-number-mono">{patronCardNo}</span>
              </div>
              <div className="card-barcode-wrap">
                <Barcode size={36} className="barcode-svg" />
              </div>
            </div>
          </div>

          {/* Circulation Status & Return Alerts */}
          <div className="circulation-summary-card">
            <h3 className="circulation-title">Circulation Status & Due Dates</h3>

            <div className="circulation-stats-row">
              <div className="circ-stat-box">
                <span className="circ-stat-val">{borrowedBooks.length}</span>
                <span className="circ-stat-lbl">Active Loans</span>
              </div>
              <div className="circ-stat-box" onClick={() => setActiveTab('requests')} style={{ cursor: 'pointer' }}>
                <span className="circ-stat-val">{bookRequests.length}</span>
                <span className="circ-stat-lbl">Book Requests</span>
              </div>
              <div className="circ-stat-box">
                <span className="circ-stat-val">{DEMO_HOLDS.length}</span>
                <span className="circ-stat-lbl">Holds Pending</span>
              </div>
              <div className="circ-stat-box">
                <span className="circ-stat-val">{DEMO_HISTORY.length}</span>
                <span className="circ-stat-lbl">Past Returns</span>
              </div>
            </div>

            {/* Clear Return Reminder Notice Box */}
            <div className={`return-reminder-box ${overdueCount > 0 ? 'reminder-overdue' : dueSoonCount > 0 ? 'reminder-urgent' : 'reminder-safe'}`}>
              <div className="reminder-header">
                {overdueCount > 0 ? <AlertTriangle size={16} /> : <Clock size={16} />}
                <strong>Return Reminder Notice</strong>
              </div>
              <p className="reminder-desc">
                {overdueCount > 0 ? (
                  <>
                    <strong>Action Required:</strong> You have <strong>{overdueCount} overdue item(s)</strong>. 
                    Overdue books cannot be renewed online. Please return them to any branch desk or 24/7 return box.
                  </>
                ) : dueSoonCount > 0 ? (
                  <>
                    <strong>Upcoming:</strong> You have <strong>{dueSoonCount} item(s) due within 3 days</strong>. 
                    Renew below to extend your loan by 14 days, or return to any 24/7 branch return box.
                  </>
                ) : (
                  <>
                    All borrowed materials are in good standing! No items are due in the next 72 hours.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="dashboard-tabs-bar">
          <button
            type="button"
            className={`dash-tab-btn ${activeTab === 'loans' ? 'active' : ''}`}
            onClick={() => setActiveTab('loans')}
          >
            <span>Active Loans ({borrowedBooks.length})</span>
          </button>
          <button
            type="button"
            className={`dash-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <span>Book Requests ({bookRequests.length})</span>
          </button>
          <button
            type="button"
            className={`dash-tab-btn ${activeTab === 'holds' ? 'active' : ''}`}
            onClick={() => setActiveTab('holds')}
          >
            <span>Reserved Holds ({DEMO_HOLDS.length})</span>
          </button>
          <button
            type="button"
            className={`dash-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span>Reading History ({DEMO_HISTORY.length})</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE LOANS WITH BOOK RENEWAL WORKFLOW */}
        {activeTab === 'loans' && (
          <div className="tab-loans-view">
            {borrowedBooks.length > 0 ? (
              <div className="loans-list">
                {borrowedBooks.map((loan) => {
                  const isOverdue = loan.daysLeft < 0 || loan.status?.includes('overdue');
                  const isDueSoon = loan.daysLeft >= 0 && loan.daysLeft <= 3;
                  const remainingRenews = loan.renewalsRemaining !== undefined ? loan.renewalsRemaining : 2;
                  const isRenewable = !isOverdue && remainingRenews > 0;

                  return (
                    <div key={loan.id} className="loan-card-item">
                      <div className="loan-book-info">
                        <div className="loan-book-icon-box">
                          <BookOpen size={22} />
                        </div>
                        <div className="loan-meta">
                          <span className="loan-format-badge">{loan.format || 'Physical Hardcover'}</span>
                          <h4 className="loan-title">{loan.title}</h4>
                          <p className="loan-author">by {loan.author} • Call #{loan.callNumber || '823.9 GEN'}</p>
                          <p className="loan-branch">Branch: {loan.branch || 'David Sassoon Library, Fort'}</p>
                        </div>
                      </div>

                      <div className="loan-dates-info">
                        <div className="date-block">
                          <span className="date-lbl">Borrowed</span>
                          <span className="date-txt">{loan.borrowDate}</span>
                        </div>
                        <div className="date-block">
                          <span className="date-lbl">Current Due Date</span>
                          <span className={`date-txt-due ${isOverdue ? 'due-overdue' : isDueSoon ? 'due-urgent' : ''}`}>
                            {loan.dueDate}
                          </span>
                        </div>
                        <span className={`days-left-pill ${isOverdue ? 'pill-overdue' : isDueSoon ? 'pill-urgent' : 'pill-sage'}`}>
                          {isOverdue 
                            ? `Overdue by ${Math.abs(loan.daysLeft)} days` 
                            : loan.daysLeft === 0 
                            ? 'Due Today' 
                            : `${loan.daysLeft} days left`}
                        </span>
                      </div>

                      <div className="loan-actions-col">
                        <button
                          type="button"
                          className="btn-renew-loan"
                          onClick={() => handleRenew(loan.id, loan.title)}
                          disabled={isRenewingId === loan.id || !isRenewable}
                          title={
                            isOverdue
                              ? "Cannot renew: overdue items must be returned to a branch desk"
                              : remainingRenews <= 0
                              ? "Cannot renew: maximum 2 renewals reached"
                              : "Renew loan for 14 days"
                          }
                        >
                          <RotateCcw size={14} className={isRenewingId === loan.id ? 'spin-icon' : ''} />
                          <span>
                            {isRenewingId === loan.id 
                              ? 'Renewing...' 
                              : `Renew (${remainingRenews} left)`}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="btn-return-loan"
                          onClick={() => handleReturn(loan.id, loan.title)}
                          title="Check in this item"
                        >
                          <Check size={14} />
                          <span>Return Book</span>
                        </button>

                        {/* Eligibility & Renewal Limit Note */}
                        <div className="loan-eligibility-note">
                          {isOverdue ? (
                            <span className="eligibility-tag tag-overdue">Ineligible: Overdue book cannot be renewed online</span>
                          ) : remainingRenews <= 0 ? (
                            <span className="eligibility-tag tag-maxed">Ineligible: Max renewals reached (2/2)</span>
                          ) : (
                            <span className="eligibility-tag tag-eligible">Eligible: {remainingRenews} renewal(s) remaining (+14 days)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-catalog-state">
                <BookOpen size={36} className="empty-icon" />
                <h3 className="empty-title">You have no active loans right now</h3>
                <p className="empty-desc">
                  Browse our public collection and borrow books to see them listed here.
                </p>
                <button
                  type="button"
                  className="empty-reset-btn"
                  onClick={onNavigateToExplore}
                >
                  Browse Catalogue Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REQUEST A BOOK & PREVIOUS REQUESTS */}
        {activeTab === 'requests' && (
          <div className="tab-requests-view">
            <div className="requests-tab-header">
              <div>
                <h3 className="tab-pane-title">Acquisition & Inter-Library Book Requests</h3>
                <p className="tab-pane-sub">
                  Cannot find a volume in our stacks? Suggest it for municipal procurement or inter-library loan.
                </p>
              </div>
              <button
                type="button"
                className="btn-parchment-primary"
                onClick={() => setIsRequestModalOpen(true)}
              >
                <BookPlus size={15} />
                <span>Request a Book</span>
              </button>
            </div>

            {isLoadingRequests ? (
              <div className="dashboard-loading-state">
                <Loader2 size={32} className="spin-icon" />
                <p>Loading your book requests...</p>
              </div>
            ) : bookRequests.length > 0 ? (
              <div className="requests-history-grid">
                {bookRequests.map((req) => (
                  <div key={req.id} className="patron-request-card">
                    <div className="req-card-top">
                      <div>
                        <span className="req-id-badge">REQ-{String(req.id).padStart(5, '0')}</span>
                        <h4 className="req-title">{req.book_title}</h4>
                        <p className="req-author">by {req.author} • {req.category || 'General'}</p>
                      </div>
                      <span className={`status-pill status-${req.status}`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="req-reason-text">
                      <strong>Your Stated Reason:</strong> "{req.reason}"
                    </div>

                    {req.librarian_response && (
                      <div className="req-librarian-reply">
                        <ShieldCheck size={16} className="reply-icon" />
                        <div>
                          <strong>Librarian Disposition Note:</strong>
                          <p>{req.librarian_response}</p>
                        </div>
                      </div>
                    )}

                    <div className="req-date-footer">
                      <span>Submitted on {new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-catalog-state">
                <FileText size={36} className="empty-icon" />
                <h3 className="empty-title">No Book Requests Submitted Yet</h3>
                <p className="empty-desc">
                  Looking for a rare historical monograph, college textbook, or entrance exam guide? 
                  Recommend a title to our acquisition team.
                </p>
                <button
                  type="button"
                  className="empty-reset-btn"
                  onClick={() => setIsRequestModalOpen(true)}
                >
                  Submit First Book Request
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RESERVED HOLDS */}
        {activeTab === 'holds' && (
          <div className="tab-holds-view">
            <div className="holds-list">
              {DEMO_HOLDS.map((hold) => (
                <div key={hold.id} className="hold-card-item">
                  <div className="hold-info-group">
                    <Bookmark size={20} className="hold-icon" />
                    <div>
                      <h4 className="hold-title">{hold.title}</h4>
                      <p className="hold-author">by {hold.author}</p>
                      <p className="hold-pickup">Pickup Desk: {hold.pickupBranch}</p>
                    </div>
                  </div>
                  <div className="hold-status-group">
                    <span className="hold-queue-badge">Queue Position: #{hold.queuePosition}</span>
                    <span className="hold-eta">Estimated: {hold.estimatedAvailable}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: READING HISTORY */}
        {activeTab === 'history' && (
          <div className="tab-history-view">
            <div className="history-table-card">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Title & Author</th>
                    <th>Date Borrowed</th>
                    <th>Date Returned</th>
                    <th>Branch</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_HISTORY.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.title}</strong>
                        <span className="table-author-sub">by {item.author}</span>
                      </td>
                      <td>{item.borrowDate}</td>
                      <td>{item.returnDate}</td>
                      <td>{item.branch}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* REQUEST A BOOK MODAL */}
      <RequestBookModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        currentUser={currentUser}
        onShowToast={onShowToast}
        onSuccess={() => {
          loadUserRequests();
          setActiveTab('requests');
        }}
      />
    </div>
  );
}
