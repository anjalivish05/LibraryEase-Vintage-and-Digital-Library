import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ExplorePage from './components/ExplorePage';
import LibrariesPage from './components/LibrariesPage';
import MyLibraryPage from './components/MyLibraryPage';
import AiAssistantPage from './components/AiAssistantPage';
import ServicesPage from './components/ServicesPage';
import AboutPage from './components/AboutPage';
import FeedbackPage from './components/FeedbackPage';
import BookModal from './components/BookModal';
import AuthModal from './components/AuthModal';
import NotificationDrawer from './components/NotificationDrawer';
import LibrarianDashboard from './components/LibrarianDashboard';
import RequestBookModal from './components/RequestBookModal';

import { SAMPLE_BOOKS } from './data/booksData';
import { INITIAL_BORROWED_BOOKS } from './data/myLibraryData';
import { api } from './services/api';
import './App.css';

// Fallback demo notifications for guest mode
const DEMO_NOTIFICATIONS = [
  {
    id: 101,
    reminder_type: 'due_in_3_days',
    title: 'Book Due in 3 Days',
    message: 'Your loan "Python Crash Course" is due in 3 calendar days. You can renew online or drop off at any branch.',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 102,
    reminder_type: 'due_tomorrow',
    title: 'Book Due Tomorrow',
    message: 'Reminder: "Atomic Habits" is due tomorrow. Please plan to return it or extend your renewal period.',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 103,
    reminder_type: 'overdue',
    title: 'Book Overdue Alert',
    message: '"Harry Potter and the Sorcerer\'s Stone" is past due. Please return it to any 24/7 return box.',
    is_read: true,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [books, setBooks] = useState(SAMPLE_BOOKS);
  const [borrowedBooks, setBorrowedBooks] = useState(INITIAL_BORROWED_BOOKS);
  const [selectedBookForModal, setSelectedBookForModal] = useState(null);
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [homeCategory, setHomeCategory] = useState('All Categories');
  const [toastMessage, setToastMessage] = useState(null);

  // Authentication & Notifications State
  const [currentUser, setCurrentUser] = useState(api.getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [isRefreshingNotifs, setIsRefreshingNotifs] = useState(false);

  // Sync with URL hash if present
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      const validPages = ['home', 'explore', 'libraries', 'services', 'about', 'my-library', 'ai-assistant', 'feedback', 'librarian'];
      if (validPages.includes(hash)) {
        setActivePage(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Dynamic SEO Title & Metadata sync for client-side navigation
  useEffect(() => {
    const pageMeta = {
      home: {
        title: 'LibraryEase – Your Gateway to Knowledge',
        desc: 'LibraryEase – Your Gateway to Knowledge. Modern public library management system and digital services offering seamless book discovery, catalog search, AI reading recommendations, and branch navigation.'
      },
      explore: {
        title: 'Explore Books & Catalog | LibraryEase – Public Library Website',
        desc: 'Browse our complete catalog of books across computer science, literature, history, and fiction with real-time shelf availability.'
      },
      libraries: {
        title: 'Library Branches & Locations | LibraryEase – Public Library System',
        desc: 'Locate public library branches, view operating hours, and discover local study sanctums across Mumbai with LibraryEase.'
      },
      services: {
        title: 'Digital & Circulation Services | LibraryEase Library Management System',
        desc: 'Explore comprehensive library services including book lending, digital reserves, study room bookings, and automated loan reminders.'
      },
      about: {
        title: 'About Us | LibraryEase Public Library System',
        desc: 'Learn about the mission, history, and civic dedication of LibraryEase Central Public Library.'
      },
      'ai-assistant': {
        title: 'AI Library Assistant & Book Recommendations | LibraryEase',
        desc: 'Ask our smart AI library assistant for book summaries, literary research assistance, and personalized reading recommendations.'
      },
      feedback: {
        title: 'Feedback & Community Requests | LibraryEase',
        desc: 'Submit your book requests, patron feedback, or suggestions to the LibraryEase librarian team.'
      },
      'my-library': {
        title: 'My Library & Borrowed Books | LibraryEase',
        desc: 'Manage your active loans, view renewal deadlines, and track your library borrowing history.'
      },
      librarian: {
        title: 'Librarian Management Portal | LibraryEase',
        desc: 'Librarian administrative dashboard for circulation management, book returns, and community requests.'
      }
    };

    const currentMeta = pageMeta[activePage] || pageMeta.home;
    document.title = currentMeta.title;

    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) {
      descTag.setAttribute('content', currentMeta.desc);
    }
  }, [activePage]);

  // Fetch verified catalog from FastAPI backend
  const fetchCatalog = useCallback(async () => {
    try {
      const backendBooks = await api.books.getAll({ limit: 100 });
      if (backendBooks && backendBooks.length > 0) {
        const adapted = backendBooks.map((b) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          category: b.category,
          genre: b.category,
          year: b.publication_year || 2023,
          isbn: b.isbn || 'N/A',
          rating: 4.8,
          reviewsCount: 142,
          pages: 320,
          callNumber: b.shelf_location || '823.9 GEN',
          shelfLocation: b.shelf_location || 'General Stacks A1',
          availability: b.available_copies > 0 ? 'Available on Shelf' : 'On Loan / Reserved',
          copiesAvailable: b.available_copies,
          totalCopies: b.total_copies,
          coverBg: 'linear-gradient(135deg, #1b3a32 0%, #2e5c4d 100%)',
          badge: b.available_copies > 0 ? 'In Circulation' : 'Reserved',
          featured: true,
          description: b.description,
          moods: ['Thought-Provoking', 'Informative & Academic', 'Reflective'],
          tags: b.tags ? b.tags.split(',').map((t) => t.trim()) : []
        }));
        setBooks(adapted);
      }
    } catch (err) {
      console.warn('Backend books query offline fallback:', err);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Synchronize live borrowings from FastAPI backend
  const refreshUserBorrowings = useCallback(async () => {
    try {
      const myLoans = await api.borrowings.getMy();
      if (Array.isArray(myLoans)) {
        const adaptedLoans = myLoans.map((rec) => {
          const isOverdue = rec.status === 'overdue' || (rec.days_remaining !== undefined && rec.days_remaining < 0);
          return {
            id: `loan-${rec.id}`,
            recordId: rec.id,
            bookId: rec.book_id,
            title: rec.book?.title || `Book #${rec.book_id}`,
            author: rec.book?.author || 'Library Author',
            borrowDate: rec.borrow_date,
            dueDate: rec.due_date,
            daysLeft: rec.days_remaining ?? 14,
            format: 'Physical Hardcover',
            branch: 'David Sassoon Library, Fort',
            renewalsRemaining: isOverdue ? 0 : 2,
            callNumber: rec.book?.shelf_location || '823.9 GEN',
            status: isOverdue ? 'Overdue' : (rec.days_remaining !== undefined && rec.days_remaining <= 3) ? 'Due Soon' : 'Active Loan',
            statusColor: isOverdue ? 'danger' : 'success'
          };
        });
        setBorrowedBooks(adaptedLoans);
      }
    } catch (err) {
      console.warn('Failed to refresh user borrowings:', err);
    }
  }, []);

  // Sync user profile & user data if authenticated
  const syncUserData = useCallback(async () => {
    const token = api.getToken();
    if (!token) return;

    try {
      const profile = await api.auth.getMe();
      setCurrentUser(profile);

      // Fetch live borrowings for user from backend
      await refreshUserBorrowings();

      // Fetch live notifications from backend
      const notifRes = await api.notifications.getAll();
      if (notifRes && notifRes.notifications) {
        setNotifications(notifRes.notifications);
      }
    } catch (err) {
      console.warn('Auth sync error:', err);
    }
  }, [refreshUserBorrowings]);

  useEffect(() => {
    syncUserData();
  }, [syncUserData]);

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    window.location.hash = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Quick search from Home page transition to Explore page
  const handleSearchFromHome = (query, category) => {
    setHomeSearchQuery(query);
    setHomeCategory(category || 'All Categories');
    handleNavigate('explore');
  };

  // Notification actions
  const handleMarkNotifRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    if (currentUser) {
      try {
        await api.notifications.markRead(id);
      } catch (e) {
        console.warn('Mark read error:', e);
      }
    }
  };

  const handleMarkAllNotifsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (currentUser) {
      try {
        await api.notifications.markAllRead();
      } catch (e) {
        console.warn('Mark all read error:', e);
      }
    }
  };

  const handleRefreshNotifs = async () => {
    setIsRefreshingNotifs(true);
    try {
      if (currentUser) {
        await api.borrowings.triggerScan();
        const notifRes = await api.notifications.getAll();
        if (notifRes?.notifications) {
          setNotifications(notifRes.notifications);
        }
        showToast('Audited circulation records and refreshed return reminders.');
      } else {
        setTimeout(() => {
          showToast('Refreshed demonstration notifications.');
        }, 300);
      }
    } catch (e) {
      console.warn('Refresh notifications error:', e);
    } finally {
      setIsRefreshingNotifs(false);
    }
  };

  // Auth actions
  const handleAuthSuccess = async (user) => {
    setCurrentUser(user);
    showToast(`Signed in as ${user.full_name} (${user.member_card_no}).`);
    await refreshUserBorrowings();
    try {
      const notifRes = await api.notifications.getAll();
      if (notifRes && notifRes.notifications) {
        setNotifications(notifRes.notifications);
      }
    } catch (e) {
      console.warn('Auth success notification fetch:', e);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setBorrowedBooks(INITIAL_BORROWED_BOOKS);
    setNotifications(DEMO_NOTIFICATIONS);
    showToast('Signed out of library session.');
  };

  // Borrow / Return toggle with database persistence
  const [isBorrowingBusy, setIsBorrowingBusy] = useState(false);

  const handleBorrowToggle = async (book) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Please sign in or create a patron account to borrow books.');
      return;
    }

    if (isBorrowingBusy) return;

    // Check if book is already borrowed by patron
    const existingLoan = borrowedBooks.find(
      (b) => b.bookId === book.id || (b.title && b.title.toLowerCase() === book.title.toLowerCase())
    );

    if (existingLoan) {
      await handleReturnLoan(existingLoan.id);
      return;
    }

    // Check inventory availability
    const isAvailable = (book.copiesAvailable !== undefined ? book.copiesAvailable > 0 : true) &&
                        (!book.availability || book.availability.includes('Available'));

    if (!isAvailable) {
      showToast(`Hold Requested: You have been placed in the reservation hold queue (#1) for "${book.title}".`);
      return;
    }

    setIsBorrowingBusy(true);
    try {
      const issueRes = await api.borrowings.issueBook({
        book_id: book.id,
        due_days: 21
      });

      // Synchronize database records with local state
      await refreshUserBorrowings();
      await fetchCatalog();

      const dueDateText = issueRes?.due_date ? ` Due date: ${issueRes.due_date}.` : ' Due in 21 days.';
      showToast(`Borrowed successfully: "${book.title}" added to your My Library dashboard.${dueDateText}`);
    } catch (err) {
      console.error('Borrow error:', err);
      showToast(err.message || `Unable to borrow "${book.title}". Please try again.`);
    } finally {
      setIsBorrowingBusy(false);
    }
  };

  // Renew Loan with live backend API integration & validation
  const handleRenewLoan = async (loanId) => {
    const loan = borrowedBooks.find((b) => b.id === loanId);
    const recordId = loan?.recordId || (typeof loanId === 'string' && loanId.startsWith('loan-') ? parseInt(loanId.replace('loan-', ''), 10) : (typeof loanId === 'number' ? loanId : null));

    if (currentUser && recordId && !isNaN(recordId)) {
      try {
        const res = await api.borrowings.renew(recordId);
        await refreshUserBorrowings();
        showToast(`Success: "${loan?.title || 'Book'}" renewed until ${res.due_date}. (${res.renewals_remaining} renewal(s) remaining)`);
        return {
          success: true,
          newDueDate: res.due_date,
          remaining: res.renewals_remaining
        };
      } catch (err) {
        console.error('Renewal API error:', err);
        const errorMsg = err.message || 'Unable to renew book loan.';
        showToast(errorMsg);
        return {
          success: false,
          message: errorMsg
        };
      }
    } else {
      // Local demo fallback for guest/unpersisted loans
      let result = { success: false, message: 'Please sign in to renew online loans.' };
      setBorrowedBooks((prevLoans) =>
        prevLoans.map((l) => {
          if (l.id === loanId) {
            if (l.renewalsRemaining > 0 && l.daysLeft >= 0) {
              const currentDue = new Date(l.dueDate);
              currentDue.setDate(currentDue.getDate() + 14);
              const newDueDateStr = currentDue.toISOString().split('T')[0];

              result = {
                success: true,
                newDueDate: newDueDateStr,
                remaining: l.renewalsRemaining - 1
              };

              return {
                ...l,
                dueDate: newDueDateStr,
                daysLeft: l.daysLeft + 14,
                renewalsRemaining: l.renewalsRemaining - 1,
                status: `Renewed — Due in ${l.daysLeft + 14} days`
              };
            } else {
              result = {
                success: false,
                message: l.daysLeft < 0 ? 'Overdue items cannot be renewed online.' : 'Maximum renewals reached (2/2).'
              };
            }
          }
          return l;
        })
      );
      if (result.success) {
        showToast(`Success: "${loan?.title || 'Book'}" renewed until ${result.newDueDate}.`);
      } else {
        showToast(result.message);
      }
      return result;
    }
  };

  // Return Loan with database persistence
  const handleReturnLoan = async (loanId) => {
    const loan = borrowedBooks.find((b) => b.id === loanId);
    const recordId = loan?.recordId || (typeof loanId === 'string' && loanId.startsWith('loan-') ? parseInt(loanId.replace('loan-', ''), 10) : (typeof loanId === 'number' ? loanId : null));

    if (currentUser && recordId && !isNaN(recordId)) {
      try {
        await api.borrowings.returnBook(recordId);
        await refreshUserBorrowings();
        await fetchCatalog();
        showToast(`Returned: "${loan?.title || 'Book'}" has been checked in and returned to catalog inventory.`);
      } catch (err) {
        console.error('Return error:', err);
        showToast(err.message || 'Unable to return book. Please try again.');
      }
    } else {
      // Demo fallback for guest/unpersisted items
      setBorrowedBooks((prev) => prev.filter((l) => l.id !== loanId));
      showToast(`Returned: "${loan?.title || 'Book'}" has been checked in.`);
    }
  };

  const borrowedBookIds = borrowedBooks.map((b) => b.bookId);
  const unreadNotifsCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="libraryease-app">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="global-toast-notification" role="status">
          <div className="toast-bullet" />
          <span className="toast-text">{toastMessage}</span>
          <button 
            type="button" 
            className="toast-close" 
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar 
        activePage={activePage} 
        setActivePage={handleNavigate} 
        borrowedCount={borrowedBooks.length}
        unreadNotifications={unreadNotifsCount}
        currentUser={currentUser}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Page Content */}
      <main className="main-content-area" id="main-content">
        {activePage === 'home' && (
          <HomePage
            books={books}
            onSelectBook={setSelectedBookForModal}
            onBorrowToggle={handleBorrowToggle}
            borrowedBookIds={borrowedBookIds}
            onNavigate={handleNavigate}
            onSearchFromHome={handleSearchFromHome}
          />
        )}

        {activePage === 'explore' && (
          <ExplorePage
            books={books}
            onSelectBook={setSelectedBookForModal}
            onBorrowToggle={handleBorrowToggle}
            borrowedBookIds={borrowedBookIds}
            initialSearch={homeSearchQuery}
            initialCategory={homeCategory}
            onNavigateToAssistant={() => handleNavigate('ai-assistant')}
          />
        )}

        {activePage === 'libraries' && (
          <LibrariesPage />
        )}

        {activePage === 'my-library' && (
          <MyLibraryPage
            borrowedBooks={borrowedBooks}
            currentUser={currentUser}
            onRenewLoan={handleRenewLoan}
            onReturnLoan={handleReturnLoan}
            onNavigateToExplore={() => handleNavigate('explore')}
            onShowToast={showToast}
          />
        )}

        {activePage === 'ai-assistant' && (
          <AiAssistantPage
            books={books}
            onSelectBook={setSelectedBookForModal}
            onBorrowToggle={handleBorrowToggle}
            borrowedBookIds={borrowedBookIds}
          />
        )}

        {activePage === 'services' && (
          <ServicesPage
            onNavigateToExplore={() => handleNavigate('explore')}
            onNavigateToAssistant={() => handleNavigate('ai-assistant')}
            onShowToast={showToast}
            onRequestBook={() => setIsRequestModalOpen(true)}
          />
        )}

        {activePage === 'about' && (
          <AboutPage
            onNavigateToExplore={() => handleNavigate('explore')}
            onNavigateToLibraries={() => handleNavigate('libraries')}
          />
        )}

        {activePage === 'feedback' && (
          <FeedbackPage 
            currentUser={currentUser}
          />
        )}

        {activePage === 'librarian' && (
          <LibrarianDashboard
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onShowToast={showToast}
            onNavigate={handleNavigate}
            onCatalogChanged={fetchCatalog}
          />
        )}
      </main>

      {/* Request a Book Modal */}
      <RequestBookModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        currentUser={currentUser}
        onShowToast={showToast}
        onSuccess={() => {
          // If on my-library, it will refresh or user can view it
        }}
      />

      {/* Book Details Modal */}
      {selectedBookForModal && (
        <BookModal
          book={selectedBookForModal}
          onClose={() => setSelectedBookForModal(null)}
          onBorrowToggle={handleBorrowToggle}
          isBorrowed={borrowedBookIds.includes(selectedBookForModal.id)}
        />
      )}

      {/* Authentication & Digital Card Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleLogout}
      />

      {/* Patron Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        unreadCount={unreadNotifsCount}
        onMarkRead={handleMarkNotifRead}
        onMarkAllRead={handleMarkAllNotifsRead}
        onRefresh={handleRefreshNotifs}
        isRefreshing={isRefreshingNotifs}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
