import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { DEMO_USER, INITIAL_BORROWED_BOOKS, DEMO_HOLDS, DEMO_HISTORY } from '../data/myLibraryData';

export default function MyLibraryPage({ 
  borrowedBooks = [], 
  currentUser = null,
  onRenewLoan, 
  onReturnLoan, 
  onNavigateToExplore 
}) {
  const [activeTab, setActiveTab] = useState('loans');
  const [renewalNotice, setRenewalNotice] = useState(null);

  const patronName = currentUser ? currentUser.full_name : DEMO_USER.name;
  const patronCardNo = currentUser ? currentUser.member_card_no : DEMO_USER.cardNumber;
  const patronBranch = DEMO_USER.homeBranch;

  const handleRenew = (loanId, title) => {
    const result = onRenewLoan(loanId);
    if (result && result.success) {
      setRenewalNotice(`Success: "${title}" has been renewed until ${result.newDueDate}. (${result.remaining} renewals remaining)`);
    } else {
      setRenewalNotice(`Notice: "${title}" cannot be renewed further (maximum renewals reached).`);
    }

    setTimeout(() => {
      setRenewalNotice(null);
    }, 4500);
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
          <span className="page-breadcrumb">Patron Portal &gt; Borrowing Dashboard & Reminders</span>
          <h1 className="page-title">Borrowing Dashboard & Reminders</h1>
          <p className="page-description">
            Monitor your active loans, review upcoming due dates, request renewal extensions, 
            and manage reserve holds across all 6 municipal branches.
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
                  Borrowings and automated return reminder notifications are synchronized with your account.
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
          {/* Virtual Library Card (Vintage Forest Green #355442 & Parchment) */}
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

          {/* Circulation Status & Return Alerts (Uses Muted Sage & Restrained Warning) */}
          <div className="circulation-summary-card">
            <h3 className="circulation-title">Circulation Status & Due Dates</h3>

            <div className="circulation-stats-row">
              <div className="circ-stat-box">
                <span className="circ-stat-val">{borrowedBooks.length}</span>
                <span className="circ-stat-lbl">Active Loans</span>
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
                    Please return to any branch return dropbox immediately or contact the circulation desk.
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

        {/* Tab 1: Active Loans List */}
        {activeTab === 'loans' && (
          <div className="tab-loans-view">
            {borrowedBooks.length > 0 ? (
              <div className="loans-list">
                {borrowedBooks.map((loan) => {
                  const isOverdue = loan.daysLeft < 0 || loan.status?.includes('overdue');
                  const isDueSoon = loan.daysLeft >= 0 && loan.daysLeft <= 3;

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
                          <span className="date-lbl">Due Date</span>
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
                          disabled={loan.renewalsRemaining <= 0 || isOverdue}
                          title={loan.renewalsRemaining > 0 && !isOverdue ? "Renew loan for 14 days" : "Cannot renew"}
                        >
                          <RotateCcw size={14} />
                          <span>Renew ({loan.renewalsRemaining || 0} left)</span>
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

        {/* Tab 2: Holds */}
        {activeTab === 'holds' && (
          <div className="tab-holds-view">
            <div className="holds-list">
              {DEMO_HOLDS.map((hold) => (
                <div key={hold.id} className="hold-card-item">
                  <div className="hold-info">
                    <span className="hold-badge">Queue Position #{hold.queuePosition}</span>
                    <h4 className="hold-title">{hold.title}</h4>
                    <p className="hold-author">by {hold.author} • {hold.format}</p>
                    <p className="hold-branch">Pickup Destination: {hold.pickupBranch}</p>
                  </div>
                  <div className="hold-eta">
                    <span className="eta-lbl">Estimated Ready Date</span>
                    <span className="eta-date">{hold.estimatedPickupDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Reading History */}
        {activeTab === 'history' && (
          <div className="tab-history-view">
            <div className="history-ledger-card">
              {DEMO_HISTORY.map((item, idx) => (
                <div key={idx} className="history-item-row">
                  <div>
                    <h4 className="history-title">{item.title}</h4>
                    <p className="history-author">by {item.author}</p>
                  </div>
                  <div className="history-meta">
                    <span className="history-date">Returned: {item.returnedDate}</span>
                    <span className="history-rating">★ {item.ratingGiven}/5 patron rating</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
