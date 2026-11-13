import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  Repeat,
  ShieldCheck,
  LogOut,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Power,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  FileText,
  Eye,
  Calendar,
  Sparkles,
  Info,
  Menu,
  X,
  Check,
  ShieldAlert,
  Archive,
  BarChart3,
  Bookmark
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminPortal({
  currentUser,
  onLogout,
  onNavigate,
  onShowToast,
  onCatalogChanged
}) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'libraries' | 'books' | 'users' | 'circulation'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // -------------------------------------------------------------
  // DASHBOARD STATE
  // -------------------------------------------------------------
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  // -------------------------------------------------------------
  // LIBRARIES STATE
  // -------------------------------------------------------------
  const [librariesList, setLibrariesList] = useState([]);
  const [isLoadingLibraries, setIsLoadingLibraries] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryLocalityFilter, setLibraryLocalityFilter] = useState('All');
  const [libraryStatusFilter, setLibraryStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  
  // Library Modals
  const [isAddLibraryModalOpen, setIsAddLibraryModalOpen] = useState(false);
  const [editingLibrary, setEditingLibrary] = useState(null);
  const [deletingLibrary, setDeletingLibrary] = useState(null);
  const [libraryFormSubmitting, setLibraryFormSubmitting] = useState(false);

  // -------------------------------------------------------------
  // BOOKS STATE
  // -------------------------------------------------------------
  const [booksList, setBooksList] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [bookCategoryFilter, setBookCategoryFilter] = useState('All');
  const [bookStatusFilter, setBookStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  
  // Book Modals
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [bookFormSubmitting, setBookFormSubmitting] = useState(false);

  // -------------------------------------------------------------
  // USERS STATE
  // -------------------------------------------------------------
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // 'all', 'admin', 'librarian', 'user'
  const [userStatusFilter, setUserStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  
  // User Modals
  const [inspectingUser, setInspectingUser] = useState(null);
  const [inspectingUserLoading, setInspectingUserLoading] = useState(false);
  const [userDeactivating, setUserDeactivating] = useState(null);
  const [userActionProcessing, setUserActionProcessing] = useState(false);

  // -------------------------------------------------------------
  // 1. LOAD DASHBOARD DATA
  // -------------------------------------------------------------
  const loadDashboardData = useCallback(async () => {
    setIsLoadingDashboard(true);
    try {
      const data = await api.admin.getDashboardStats();
      if (data) {
        setDashboardStats(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      onShowToast?.('Failed to load dashboard metrics from backend.');
    } finally {
      setIsLoadingDashboard(false);
    }
  }, [onShowToast]);

  // -------------------------------------------------------------
  // 2. LOAD LIBRARIES DATA
  // -------------------------------------------------------------
  const loadLibrariesData = useCallback(async () => {
    setIsLoadingLibraries(true);
    try {
      const data = await api.admin.getLibraries({
        search: librarySearch,
        locality: libraryLocalityFilter !== 'All' ? libraryLocalityFilter : '',
        status: libraryStatusFilter !== 'all' ? libraryStatusFilter : ''
      });
      if (Array.isArray(data)) {
        setLibrariesList(data);
      }
    } catch (err) {
      console.error('Error fetching admin libraries:', err);
      onShowToast?.('Failed to load library branches from database.');
    } finally {
      setIsLoadingLibraries(false);
    }
  }, [librarySearch, libraryLocalityFilter, libraryStatusFilter, onShowToast]);

  // -------------------------------------------------------------
  // 3. LOAD BOOKS DATA (INCLUDES INACTIVE)
  // -------------------------------------------------------------
  const loadBooksData = useCallback(async () => {
    setIsLoadingBooks(true);
    try {
      const data = await api.books.getAll({
        search: bookSearch,
        category: bookCategoryFilter !== 'All' ? bookCategoryFilter : '',
        include_inactive: true,
        limit: 150
      });
      if (Array.isArray(data)) {
        setBooksList(data);
      }
    } catch (err) {
      console.error('Error fetching admin books:', err);
      onShowToast?.('Failed to load catalog books from database.');
    } finally {
      setIsLoadingBooks(false);
    }
  }, [bookSearch, bookCategoryFilter, onShowToast]);

  // -------------------------------------------------------------
  // 4. LOAD USERS DATA
  // -------------------------------------------------------------
  const loadUsersData = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const data = await api.admin.getUsers({
        search: userSearch,
        role: userRoleFilter !== 'all' ? userRoleFilter : '',
        status: userStatusFilter !== 'all' ? userStatusFilter : ''
      });
      if (Array.isArray(data)) {
        setUsersList(data);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
      onShowToast?.('Failed to load registered users from database.');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [userSearch, userRoleFilter, userStatusFilter, onShowToast]);

  // Tab change triggers
  useEffect(() => {
    if (activeTab === 'dashboard') loadDashboardData();
    if (activeTab === 'libraries') loadLibrariesData();
    if (activeTab === 'books') loadBooksData();
    if (activeTab === 'users') loadUsersData();
  }, [activeTab, loadDashboardData, loadLibrariesData, loadBooksData, loadUsersData]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // -------------------------------------------------------------
  // LIBRARY ACTIONS
  // -------------------------------------------------------------
  const handleSaveLibrary = async (formData, isEdit) => {
    setLibraryFormSubmitting(true);
    try {
      if (isEdit && editingLibrary) {
        await api.admin.updateLibrary(editingLibrary.id, formData);
        onShowToast?.(`Library "${formData.name}" updated successfully.`);
      } else {
        await api.admin.createLibrary(formData);
        onShowToast?.(`Library "${formData.name}" added to Civic Directory.`);
      }
      setIsAddLibraryModalOpen(false);
      setEditingLibrary(null);
      await loadLibrariesData();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      console.error('Save library error:', err);
      onShowToast?.(err.message || 'Failed to save library branch.');
    } finally {
      setLibraryFormSubmitting(false);
    }
  };

  const handleToggleLibraryStatus = async (lib) => {
    try {
      const newStatus = !lib.isActive;
      await api.admin.toggleLibraryStatus(lib.id, newStatus);
      onShowToast?.(`Library "${lib.name}" is now ${newStatus ? 'Active' : 'Inactive'}.`);
      await loadLibrariesData();
    } catch (err) {
      console.error('Toggle library error:', err);
      onShowToast?.('Failed to update library status.');
    }
  };

  const handleDeleteLibraryConfirm = async () => {
    if (!deletingLibrary) return;
    setLibraryFormSubmitting(true);
    try {
      await api.admin.deleteLibrary(deletingLibrary.id);
      onShowToast?.(`Library "${deletingLibrary.name}" has been permanently removed.`);
      setDeletingLibrary(null);
      await loadLibrariesData();
    } catch (err) {
      console.error('Delete library error:', err);
      onShowToast?.(err.message || 'Failed to delete library.');
    } finally {
      setLibraryFormSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // BOOK ACTIONS
  // -------------------------------------------------------------
  const handleSaveBook = async (formData, isEdit) => {
    setBookFormSubmitting(true);
    try {
      if (isEdit && editingBook) {
        await api.books.update(editingBook.id, formData);
        onShowToast?.(`Book "${formData.title}" updated successfully.`);
      } else {
        await api.books.create(formData);
        onShowToast?.(`Book "${formData.title}" added to library catalog.`);
      }
      setIsAddBookModalOpen(false);
      setEditingBook(null);
      await loadBooksData();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      console.error('Save book error:', err);
      onShowToast?.(err.message || 'Failed to save book record.');
    } finally {
      setBookFormSubmitting(false);
    }
  };

  const handleToggleBookStatus = async (book) => {
    try {
      const newStatus = !book.is_active;
      await api.books.toggleStatus(book.id, newStatus);
      onShowToast?.(`Book "${book.title}" is now ${newStatus ? 'Active' : 'Inactive'}.`);
      await loadBooksData();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      console.error('Toggle book status error:', err);
      onShowToast?.(err.message || 'Failed to toggle book active status.');
    }
  };

  const handleDeleteBookConfirm = async () => {
    if (!deletingBook) return;
    setBookFormSubmitting(true);
    try {
      await api.books.delete(deletingBook.id);
      onShowToast?.(`Book "${deletingBook.title}" has been deactivated from circulation.`);
      setDeletingBook(null);
      await loadBooksData();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      console.error('Delete book error:', err);
      onShowToast?.(err.message || 'Failed to delete book.');
    } finally {
      setBookFormSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // USER ACTIONS
  // -------------------------------------------------------------
  const handleInspectUser = async (user) => {
    setInspectingUserLoading(true);
    setInspectingUser(user);
    try {
      const details = await api.admin.getUserDetails(user.id);
      if (details) {
        setInspectingUser(details);
      }
    } catch (err) {
      console.error('User details error:', err);
    } finally {
      setInspectingUserLoading(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    if (user.id === currentUser?.id) {
      onShowToast?.('Safety Protection: You cannot deactivate your own active administrator account.');
      return;
    }
    setUserActionProcessing(true);
    try {
      const newStatus = !user.is_active;
      const res = await api.admin.toggleUserStatus(user.id, newStatus);
      onShowToast?.(res.message || `Account for ${user.full_name} updated.`);
      setUserDeactivating(null);
      await loadUsersData();
    } catch (err) {
      console.error('Toggle user error:', err);
      onShowToast?.(err.message || 'Failed to change user account status.');
    } finally {
      setUserActionProcessing(false);
    }
  };

  // Derived filter options
  const uniqueLocalities = useMemo(() => {
    const locs = new Set();
    librariesList.forEach((l) => {
      if (l.locality) locs.add(l.locality);
      else if (l.area) locs.add(l.area);
    });
    return ['All', ...Array.from(locs).sort()];
  }, [librariesList]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    booksList.forEach((b) => {
      if (b.category) cats.add(b.category);
    });
    return ['All', ...Array.from(cats).sort()];
  }, [booksList]);

  // Filtered books display
  const filteredBooks = useMemo(() => {
    return booksList.filter((b) => {
      if (bookStatusFilter === 'active' && !b.is_active) return false;
      if (bookStatusFilter === 'inactive' && b.is_active) return false;
      return true;
    });
  }, [booksList, bookStatusFilter]);

  return (
    <div className="admin-portal-layout">
      {/* Top Mobile Bar */}
      <header className="admin-mobile-topbar">
        <button
          type="button"
          className="admin-mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="admin-mobile-brand">
          <BookOpen size={20} className="brand-icon" />
          <span className="brand-title">LibraryEase Admin</span>
        </div>
        <button
          type="button"
          className="admin-mobile-logout"
          onClick={onLogout}
          title="Sign Out of Admin Portal"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Sidebar Navigation */}
      <aside className={`admin-portal-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <div className="admin-brand-block">
            <div className="admin-brand-icon-wrap">
              <ShieldCheck size={24} className="admin-brand-icon" />
            </div>
            <div className="admin-brand-texts">
              <span className="admin-brand-title">LibraryEase</span>
              <span className="admin-brand-subtitle">Civic Admin Portal</span>
            </div>
          </div>
          <div className="admin-seal-badge">Official Governance</div>
        </div>

        {/* Navigation Items */}
        <nav className="admin-sidebar-nav" aria-label="Admin Navigation">
          <div className="admin-nav-section-title">Core Management</div>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
          >
            <LayoutDashboard size={19} className="nav-item-icon" />
            <span className="nav-item-label">Dashboard</span>
            {dashboardStats?.pending_book_requests > 0 && (
              <span className="nav-item-pill">{dashboardStats.pending_book_requests}</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'libraries' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('libraries');
              setMobileMenuOpen(false);
            }}
          >
            <Building2 size={19} className="nav-item-icon" />
            <span className="nav-item-label">Library Branches</span>
            <span className="nav-item-pill count">{dashboardStats?.total_libraries || librariesList.length || '•'}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('books');
              setMobileMenuOpen(false);
            }}
          >
            <BookOpen size={19} className="nav-item-icon" />
            <span className="nav-item-label">Books & Catalog</span>
            <span className="nav-item-pill count">{dashboardStats?.total_books || booksList.length || '•'}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('users');
              setMobileMenuOpen(false);
            }}
          >
            <Users size={19} className="nav-item-icon" />
            <span className="nav-item-label">User Accounts</span>
            <span className="nav-item-pill count">{dashboardStats?.registered_users || usersList.length || '•'}</span>
          </button>

          <div className="admin-nav-section-title">Civic Services</div>

          <button
            type="button"
            className="admin-nav-item secondary"
            onClick={() => {
              onNavigate('librarian');
              setMobileMenuOpen(false);
            }}
          >
            <Repeat size={19} className="nav-item-icon" />
            <span className="nav-item-label">Circulation Desk</span>
            <span className="nav-item-subtag">Staff Desk &rarr;</span>
          </button>

          <button
            type="button"
            className="admin-nav-item secondary"
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
          >
            <ExternalLink size={19} className="nav-item-icon" />
            <span className="nav-item-label">View Public Site</span>
          </button>
        </nav>

        {/* Current Admin User Card */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-profile-card">
            <div className="admin-avatar-wrap">
              <ShieldAlert size={20} className="admin-avatar-icon" />
              <span className="admin-online-badge" />
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{currentUser?.full_name || 'Administrator'}</span>
              <span className="admin-user-role">
                <span className="role-tag">Superadmin</span>
                <span className="card-tag">{currentUser?.member_card_no || 'ADM-0001'}</span>
              </span>
            </div>
            <button
              type="button"
              className="admin-logout-icon-btn"
              onClick={onLogout}
              title="Sign Out of Admin Portal"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-portal-main">
        {/* Top Header Bar */}
        <header className="admin-content-topbar">
          <div className="admin-breadcrumbs">
            <span className="breadcrumb-root">Admin Portal</span>
            <ChevronRight size={14} className="breadcrumb-arrow" />
            <span className="breadcrumb-current">
              {activeTab === 'dashboard' && 'Platform Overview & Metrics'}
              {activeTab === 'libraries' && 'Library Branches Management'}
              {activeTab === 'books' && 'Catalog & Book Inventory'}
              {activeTab === 'users' && 'Patron & Staff User Accounts'}
            </span>
          </div>

          <div className="admin-topbar-actions">
            <span className="admin-date-indicator">
              <Calendar size={14} />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </span>

            <button
              type="button"
              className="admin-refresh-btn"
              onClick={() => {
                if (activeTab === 'dashboard') loadDashboardData();
                if (activeTab === 'libraries') loadLibrariesData();
                if (activeTab === 'books') loadBooksData();
                if (activeTab === 'users') loadUsersData();
                onShowToast?.('Refreshed data from database.');
              }}
              title="Refresh Current Data"
            >
              <RefreshCw size={15} className={(isLoadingDashboard || isLoadingLibraries || isLoadingBooks || isLoadingUsers) ? 'spinning' : ''} />
              <span>Sync</span>
            </button>
          </div>
        </header>

        {/* Tab Body */}
        <div className="admin-content-body">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="admin-dashboard-view">
              <div className="admin-view-header">
                <div>
                  <h1 className="admin-view-title">Civic Platform Dashboard</h1>
                  <p className="admin-view-subtitle">
                    Real-time governance, physical branch statistics, and book circulation health.
                  </p>
                </div>
              </div>

              {/* 4 Primary KPI Summary Cards */}
              <div className="admin-kpi-grid">
                {/* Total Libraries */}
                <div className="admin-kpi-card libraries-kpi">
                  <div className="kpi-top">
                    <span className="kpi-label">Total Libraries</span>
                    <div className="kpi-icon-wrap">
                      <Building2 size={22} />
                    </div>
                  </div>
                  <div className="kpi-value">{dashboardStats?.total_libraries ?? '...'}</div>
                  <div className="kpi-footer">
                    <span className="kpi-subtext">Verified Mumbai public sanctums</span>
                    <button
                      type="button"
                      className="kpi-action-link"
                      onClick={() => setActiveTab('libraries')}
                    >
                      Manage &rarr;
                    </button>
                  </div>
                </div>

                {/* Total Books */}
                <div className="admin-kpi-card books-kpi">
                  <div className="kpi-top">
                    <span className="kpi-label">Total Books</span>
                    <div className="kpi-icon-wrap">
                      <BookOpen size={22} />
                    </div>
                  </div>
                  <div className="kpi-value">{dashboardStats?.total_books ?? '...'}</div>
                  <div className="kpi-footer">
                    <span className="kpi-subtext">
                      {dashboardStats?.total_copies ? `${dashboardStats.total_copies} total physical copies` : 'Active catalog titles'}
                    </span>
                    <button
                      type="button"
                      className="kpi-action-link"
                      onClick={() => setActiveTab('books')}
                    >
                      Catalog &rarr;
                    </button>
                  </div>
                </div>

                {/* Registered Users */}
                <div className="admin-kpi-card users-kpi">
                  <div className="kpi-top">
                    <span className="kpi-label">Registered Users</span>
                    <div className="kpi-icon-wrap">
                      <Users size={22} />
                    </div>
                  </div>
                  <div className="kpi-value">{dashboardStats?.registered_users ?? '...'}</div>
                  <div className="kpi-footer">
                    <span className="kpi-subtext">Active civic card holders</span>
                    <button
                      type="button"
                      className="kpi-action-link"
                      onClick={() => setActiveTab('users')}
                    >
                      Accounts &rarr;
                    </button>
                  </div>
                </div>

                {/* Active Borrowings */}
                <div className="admin-kpi-card borrowings-kpi">
                  <div className="kpi-top">
                    <span className="kpi-label">Active Borrowings</span>
                    <div className="kpi-icon-wrap">
                      <Repeat size={22} />
                    </div>
                  </div>
                  <div className="kpi-value">{dashboardStats?.active_borrowings ?? '...'}</div>
                  <div className="kpi-footer">
                    <span className="kpi-subtext overdue">
                      {dashboardStats?.overdue_borrowings ? `${dashboardStats.overdue_borrowings} overdue loans` : 'Circulation in balance'}
                    </span>
                    <button
                      type="button"
                      className="kpi-action-link"
                      onClick={() => onNavigate('librarian')}
                    >
                      Circulation &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Recent Books & Recent Libraries */}
              <div className="admin-two-col-grid">
                {/* Recently Added Books */}
                <div className="admin-panel-card">
                  <div className="panel-card-header">
                    <div className="panel-header-title">
                      <BookOpen size={18} className="panel-icon" />
                      <h2>Recently Added Books</h2>
                    </div>
                    <button
                      type="button"
                      className="panel-view-all-btn"
                      onClick={() => setActiveTab('books')}
                    >
                      View Catalog &rarr;
                    </button>
                  </div>

                  <div className="panel-card-body">
                    {dashboardStats?.recent_books?.length > 0 ? (
                      <div className="recent-items-list">
                        {dashboardStats.recent_books.map((b) => (
                          <div key={b.id} className="recent-book-row">
                            <div className="recent-book-icon">
                              <BookOpen size={16} />
                            </div>
                            <div className="recent-book-details">
                              <span className="book-title">{b.title}</span>
                              <span className="book-meta">
                                by {b.author} • <span className="cat-pill">{b.category}</span>
                              </span>
                            </div>
                            <div className="recent-book-copies">
                              <span className="copies-pill">
                                {b.available_copies}/{b.total_copies} available
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="admin-empty-state-mini">
                        <BookOpen size={24} />
                        <p>No books added recently.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Library Updates */}
                <div className="admin-panel-card">
                  <div className="panel-card-header">
                    <div className="panel-header-title">
                      <Building2 size={18} className="panel-icon" />
                      <h2>Recent Library Updates</h2>
                    </div>
                    <button
                      type="button"
                      className="panel-view-all-btn"
                      onClick={() => setActiveTab('libraries')}
                    >
                      View All Branches &rarr;
                    </button>
                  </div>

                  <div className="panel-card-body">
                    {dashboardStats?.recent_libraries?.length > 0 ? (
                      <div className="recent-items-list">
                        {dashboardStats.recent_libraries.map((lib) => (
                          <div key={lib.id} className="recent-lib-row">
                            <div className="recent-lib-icon">
                              <Building2 size={16} />
                            </div>
                            <div className="recent-lib-details">
                              <span className="lib-name">{lib.name}</span>
                              <span className="lib-meta">
                                <MapPin size={12} />
                                {lib.locality}, {lib.city}
                              </span>
                            </div>
                            <div className="recent-lib-status">
                              {lib.is_verified && <span className="verified-pill">Verified</span>}
                              <span className={`status-dot ${lib.is_active ? 'active' : 'inactive'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="admin-empty-state-mini">
                        <Building2 size={24} />
                        <p>No recent library changes.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: User Activity & Category Distribution */}
              <div className="admin-two-col-grid">
                {/* Recent User Activity */}
                <div className="admin-panel-card">
                  <div className="panel-card-header">
                    <div className="panel-header-title">
                      <TrendingUp size={18} className="panel-icon" />
                      <h2>Recent User Circulation Activity</h2>
                    </div>
                  </div>

                  <div className="panel-card-body">
                    {dashboardStats?.recent_activities?.length > 0 ? (
                      <div className="activity-timeline">
                        {dashboardStats.recent_activities.map((act) => (
                          <div key={act.id} className="timeline-item">
                            <div className={`timeline-marker ${act.type}`}>
                              {act.type === 'checkout' ? <BookOpen size={13} /> : <CheckCircle2 size={13} />}
                            </div>
                            <div className="timeline-content">
                              <span className="timeline-title">{act.title}</span>
                              <span className="timeline-desc">{act.description}</span>
                              {act.timestamp && (
                                <span className="timeline-time">
                                  <Clock size={11} />
                                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="admin-empty-state-mini">
                        <TrendingUp size={24} />
                        <p>No recent user circulation records.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Distribution Chart */}
                <div className="admin-panel-card">
                  <div className="panel-card-header">
                    <div className="panel-header-title">
                      <BarChart3 size={18} className="panel-icon" />
                      <h2>Catalog Distribution by Genre</h2>
                    </div>
                  </div>

                  <div className="panel-card-body">
                    {dashboardStats?.category_distribution?.length > 0 ? (
                      <div className="category-bars-list">
                        {dashboardStats.category_distribution.map((cat, idx) => {
                          const total = dashboardStats.total_books || 1;
                          const pct = Math.round((cat.count / total) * 100);
                          return (
                            <div key={cat.category} className="cat-bar-item">
                              <div className="cat-bar-header">
                                <span className="cat-name">{cat.category}</span>
                                <span className="cat-count">{cat.count} books ({pct}%)</span>
                              </div>
                              <div className="cat-bar-track">
                                <div
                                  className="cat-bar-fill"
                                  style={{ width: `${Math.min(100, Math.max(8, pct))}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="admin-empty-state-mini">
                        <BarChart3 size={24} />
                        <p>Catalog breakdown loading...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIBRARIES MANAGEMENT */}
          {activeTab === 'libraries' && (
            <div className="admin-libraries-view">
              <div className="admin-view-header">
                <div>
                  <h1 className="admin-view-title">Civic Library Branches</h1>
                  <p className="admin-view-subtitle">
                    Manage Mumbai public library sanctums, heritage archives, hours, and digital amenities.
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-primary-action-btn"
                  onClick={() => {
                    setEditingLibrary(null);
                    setIsAddLibraryModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Add New Library Branch</span>
                </button>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="admin-toolbar-card">
                <div className="toolbar-search-wrap">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="toolbar-search-input"
                    placeholder="Search by library name, area, PIN code, or phone..."
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                  />
                  {librarySearch && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setLibrarySearch('')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="toolbar-filters-group">
                  <div className="filter-select-wrap">
                    <label htmlFor="locality-filter">Locality:</label>
                    <select
                      id="locality-filter"
                      className="toolbar-select"
                      value={libraryLocalityFilter}
                      onChange={(e) => setLibraryLocalityFilter(e.target.value)}
                    >
                      {uniqueLocalities.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-select-wrap">
                    <label htmlFor="status-filter">Status:</label>
                    <select
                      id="status-filter"
                      className="toolbar-select"
                      value={libraryStatusFilter}
                      onChange={(e) => setLibraryStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Libraries Table */}
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Branch & Locality</th>
                      <th>City / State</th>
                      <th>Operating Hours</th>
                      <th>Contact Info</th>
                      <th>Facilities</th>
                      <th>Status</th>
                      <th className="actions-col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingLibraries ? (
                      <tr>
                        <td colSpan={7} className="table-loading-cell">
                          <div className="table-spinner" />
                          <span>Retrieving live libraries from database...</span>
                        </td>
                      </tr>
                    ) : librariesList.length > 0 ? (
                      librariesList.map((lib) => (
                        <tr key={lib.id} className={!lib.isActive ? 'row-inactive' : ''}>
                          {/* Branch & Locality */}
                          <td className="branch-title-cell">
                            <div className="branch-name-wrap">
                              <span className="branch-name">{lib.name}</span>
                              <span className="branch-subloc">
                                <MapPin size={12} />
                                {lib.locality || lib.area}, PIN: {lib.pincode}
                              </span>
                            </div>
                          </td>

                          {/* City / State */}
                          <td>
                            <div className="branch-geo">
                              <span>{lib.city}, {lib.state}</span>
                              <span className="sub-region">{lib.region}</span>
                            </div>
                          </td>

                          {/* Operating Hours */}
                          <td>
                            <div className="branch-hours-cell">
                              <span className="hours-weekdays">M-F: {lib.hours?.weekdays || '9AM - 8PM'}</span>
                              <span className="hours-sat">Sat: {lib.hours?.saturday || '9AM - 6PM'}</span>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td>
                            <div className="branch-contact-cell">
                              <span className="contact-phone">
                                <Phone size={12} />
                                {lib.phone}
                              </span>
                              {lib.email && (
                                <span className="contact-email">
                                  <Mail size={12} />
                                  {lib.email}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Facilities */}
                          <td>
                            <div className="facilities-chips-preview">
                              {lib.services?.slice(0, 2).map((s, i) => (
                                <span key={i} className="service-chip-tiny">{s}</span>
                              ))}
                              {lib.services?.length > 2 && (
                                <span className="service-chip-more">+{lib.services.length - 2} more</span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td>
                            <button
                              type="button"
                              className={`status-toggle-pill ${lib.isActive ? 'active' : 'inactive'}`}
                              onClick={() => handleToggleLibraryStatus(lib)}
                              title={lib.isActive ? 'Click to Deactivate branch' : 'Click to Activate branch'}
                            >
                              <Power size={11} />
                              <span>{lib.isActive ? 'Active' : 'Inactive'}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="actions-cell">
                            <div className="action-buttons-group">
                              <button
                                type="button"
                                className="action-btn edit-btn"
                                onClick={() => {
                                  setEditingLibrary(lib);
                                  setIsAddLibraryModalOpen(true);
                                }}
                                title="Edit Library Information"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                className="action-btn delete-btn"
                                onClick={() => setDeletingLibrary(lib)}
                                title="Delete Library from Platform"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="table-empty-cell">
                          <Building2 size={32} />
                          <p className="empty-title">No library branches match your search criteria.</p>
                          <p className="empty-sub">Try changing your search terms or filters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BOOKS MANAGEMENT */}
          {activeTab === 'books' && (
            <div className="admin-books-view">
              <div className="admin-view-header">
                <div>
                  <h1 className="admin-view-title">Catalog & Book Inventory</h1>
                  <p className="admin-view-subtitle">
                    Add new publications, manage inventory counts, edit metadata, and configure shelf availability.
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-primary-action-btn"
                  onClick={() => {
                    setEditingBook(null);
                    setIsAddBookModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Add New Book to Catalog</span>
                </button>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="admin-toolbar-card">
                <div className="toolbar-search-wrap">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="toolbar-search-input"
                    placeholder="Search catalog by title, author, ISBN, or publisher..."
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                  />
                  {bookSearch && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setBookSearch('')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="toolbar-filters-group">
                  <div className="filter-select-wrap">
                    <label htmlFor="category-filter">Category:</label>
                    <select
                      id="category-filter"
                      className="toolbar-select"
                      value={bookCategoryFilter}
                      onChange={(e) => setBookCategoryFilter(e.target.value)}
                    >
                      {uniqueCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-select-wrap">
                    <label htmlFor="book-status-filter">Status:</label>
                    <select
                      id="book-status-filter"
                      className="toolbar-select"
                      value={bookStatusFilter}
                      onChange={(e) => setBookStatusFilter(e.target.value)}
                    >
                      <option value="all">All Books</option>
                      <option value="active">Active In Circulation</option>
                      <option value="inactive">Inactive / Deactivated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Books Table */}
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Cover & Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Publisher & Year</th>
                      <th>Shelf Location</th>
                      <th>Copies Inventory</th>
                      <th>Status</th>
                      <th className="actions-col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingBooks ? (
                      <tr>
                        <td colSpan={8} className="table-loading-cell">
                          <div className="table-spinner" />
                          <span>Querying complete book inventory...</span>
                        </td>
                      </tr>
                    ) : filteredBooks.length > 0 ? (
                      filteredBooks.map((b) => (
                        <tr key={b.id} className={!b.is_active ? 'row-inactive' : ''}>
                          {/* Cover & Title */}
                          <td className="book-title-cell">
                            <div className="book-title-wrap">
                              {b.cover_url ? (
                                <img
                                  src={b.cover_url}
                                  alt={b.title}
                                  className="book-thumbnail-img"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="book-thumbnail-placeholder">
                                  <BookOpen size={16} />
                                </div>
                              )}
                              <div className="book-text-info">
                                <span className="book-main-title">{b.title}</span>
                                <span className="book-isbn-tag">ISBN: {b.isbn || 'N/A'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Author */}
                          <td className="author-cell">{b.author}</td>

                          {/* Category */}
                          <td>
                            <span className="category-pill">{b.category}</span>
                          </td>

                          {/* Publisher & Year */}
                          <td>
                            <div className="pub-year-cell">
                              <span className="pub-name">{b.publisher || 'Circulation Stacks'}</span>
                              <span className="pub-year">{b.publication_year || '—'}</span>
                            </div>
                          </td>

                          {/* Shelf Location */}
                          <td className="shelf-cell">{b.shelf_location || 'General Stacks'}</td>

                          {/* Copies Inventory */}
                          <td>
                            <div className="copies-indicator-cell">
                              <span className="copies-ratio">
                                <strong>{b.available_copies}</strong> of {b.total_copies} free
                              </span>
                              <div className="copies-micro-bar">
                                <div
                                  className="copies-bar-fill"
                                  style={{
                                    width: `${b.total_copies > 0 ? (b.available_copies / b.total_copies) * 100 : 0}%`
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Status Toggle */}
                          <td>
                            <button
                              type="button"
                              className={`status-toggle-pill ${b.is_active ? 'active' : 'inactive'}`}
                              onClick={() => handleToggleBookStatus(b)}
                              title={b.is_active ? 'Click to deactivate book' : 'Click to activate book'}
                            >
                              <Power size={11} />
                              <span>{b.is_active ? 'Active' : 'Inactive'}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="actions-cell">
                            <div className="action-buttons-group">
                              <button
                                type="button"
                                className="action-btn edit-btn"
                                onClick={() => {
                                  setEditingBook(b);
                                  setIsAddBookModalOpen(true);
                                }}
                                title="Edit Book Details"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                className="action-btn delete-btn"
                                onClick={() => setDeletingBook(b)}
                                title="Deactivate / Delete Book"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="table-empty-cell">
                          <BookOpen size={32} />
                          <p className="empty-title">No books match your current filter.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="admin-users-view">
              <div className="admin-view-header">
                <div>
                  <h1 className="admin-view-title">User Accounts & Governance</h1>
                  <p className="admin-view-subtitle">
                    View registered patrons and staff, monitor active borrowings, and manage account statuses safely.
                  </p>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="admin-toolbar-card">
                <div className="toolbar-search-wrap">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="toolbar-search-input"
                    placeholder="Search by patron name, email, member card no, or phone..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {userSearch && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setUserSearch('')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="toolbar-filters-group">
                  <div className="filter-select-wrap">
                    <label htmlFor="user-role-filter">Role:</label>
                    <select
                      id="user-role-filter"
                      className="toolbar-select"
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Administrator</option>
                      <option value="librarian">Librarian Staff</option>
                      <option value="user">Patron Member</option>
                    </select>
                  </div>

                  <div className="filter-select-wrap">
                    <label htmlFor="user-status-filter">Status:</label>
                    <select
                      id="user-status-filter"
                      className="toolbar-select"
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                    >
                      <option value="all">All Accounts</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Deactivated Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Patron Full Name</th>
                      <th>Email & Member Card</th>
                      <th>Phone</th>
                      <th>System Role</th>
                      <th>Active Loans</th>
                      <th>Account Status</th>
                      <th className="actions-col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingUsers ? (
                      <tr>
                        <td colSpan={7} className="table-loading-cell">
                          <div className="table-spinner" />
                          <span>Loading registered user accounts...</span>
                        </td>
                      </tr>
                    ) : usersList.length > 0 ? (
                      usersList.map((u) => {
                        const isSelf = u.id === currentUser?.id;
                        return (
                          <tr key={u.id} className={!u.is_active ? 'row-inactive' : ''}>
                            {/* Full Name */}
                            <td className="user-name-cell">
                              <div className="user-name-wrap">
                                <span className="user-fullname">{u.full_name}</span>
                                {isSelf && <span className="self-badge">You</span>}
                              </div>
                            </td>

                            {/* Email & Card */}
                            <td>
                              <div className="user-creds-cell">
                                <span className="user-email">{u.email}</span>
                                <span className="user-card-no">
                                  <Bookmark size={11} />
                                  {u.member_card_no}
                                </span>
                              </div>
                            </td>

                            {/* Phone */}
                            <td className="phone-cell">{u.phone || '—'}</td>

                            {/* Role */}
                            <td>
                              <span className={`role-badge ${u.role}`}>
                                {u.role === 'admin' ? 'Administrator' : u.role === 'librarian' ? 'Librarian' : 'Member'}
                              </span>
                            </td>

                            {/* Active Loans */}
                            <td>
                              <span className={`loans-count-pill ${u.active_loans > 0 ? 'has-loans' : ''}`}>
                                {u.active_loans} active
                              </span>
                            </td>

                            {/* Account Status Toggle */}
                            <td>
                              <button
                                type="button"
                                className={`status-toggle-pill ${u.is_active ? 'active' : 'inactive'} ${isSelf ? 'disabled' : ''}`}
                                onClick={() => !isSelf && setUserDeactivating(u)}
                                disabled={isSelf}
                                title={isSelf ? 'Cannot deactivate your own account' : (u.is_active ? 'Deactivate Account' : 'Activate Account')}
                              >
                                <Power size={11} />
                                <span>{u.is_active ? 'Active' : 'Deactivated'}</span>
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="actions-cell">
                              <button
                                type="button"
                                className="action-btn inspect-btn"
                                onClick={() => handleInspectUser(u)}
                                title="View User Details & Loan History"
                              >
                                <Eye size={14} />
                                <span>Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="table-empty-cell">
                          <Users size={32} />
                          <p className="empty-title">No user records found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT LIBRARY */}
      {/* ========================================================= */}
      {isAddLibraryModalOpen && (
        <LibraryModal
          library={editingLibrary}
          isOpen={isAddLibraryModalOpen}
          onClose={() => {
            setIsAddLibraryModalOpen(false);
            setEditingLibrary(null);
          }}
          onSave={handleSaveLibrary}
          isSubmitting={libraryFormSubmitting}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CONFIRM DELETE LIBRARY */}
      {/* ========================================================= */}
      {deletingLibrary && (
        <div className="admin-confirm-modal-overlay">
          <div className="admin-confirm-modal">
            <div className="confirm-icon danger">
              <AlertTriangle size={32} />
            </div>
            <h3 className="confirm-title">Delete Library Branch?</h3>
            <p className="confirm-message">
              Are you sure you want to permanently delete <strong>{deletingLibrary.name}</strong> from the civic directory? This operation cannot be undone.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="admin-modal-btn cancel"
                onClick={() => setDeletingLibrary(null)}
                disabled={libraryFormSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-modal-btn delete"
                onClick={handleDeleteLibraryConfirm}
                disabled={libraryFormSubmitting}
              >
                {libraryFormSubmitting ? 'Deleting...' : 'Yes, Delete Branch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADD / EDIT BOOK */}
      {/* ========================================================= */}
      {isAddBookModalOpen && (
        <BookModalAdmin
          book={editingBook}
          isOpen={isAddBookModalOpen}
          onClose={() => {
            setIsAddBookModalOpen(false);
            setEditingBook(null);
          }}
          onSave={handleSaveBook}
          isSubmitting={bookFormSubmitting}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 4: CONFIRM DELETE BOOK */}
      {/* ========================================================= */}
      {deletingBook && (
        <div className="admin-confirm-modal-overlay">
          <div className="admin-confirm-modal">
            <div className="confirm-icon danger">
              <AlertTriangle size={32} />
            </div>
            <h3 className="confirm-title">Deactivate Book from Circulation?</h3>
            <p className="confirm-message">
              Are you sure you want to deactivate <strong>"{deletingBook.title}"</strong>? It will no longer appear on the public explore page.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="admin-modal-btn cancel"
                onClick={() => setDeletingBook(null)}
                disabled={bookFormSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-modal-btn delete"
                onClick={handleDeleteBookConfirm}
                disabled={bookFormSubmitting}
              >
                {bookFormSubmitting ? 'Processing...' : 'Deactivate Book'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: USER DETAILS & LOAN HISTORY */}
      {/* ========================================================= */}
      {inspectingUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box user-details-modal">
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <Users size={20} className="modal-icon" />
                <h3>Patron Account Record</h3>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setInspectingUser(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {inspectingUserLoading ? (
                <div className="modal-loading-box">
                  <div className="table-spinner" />
                  <span>Loading patron borrowing history...</span>
                </div>
              ) : (
                <div className="user-details-content">
                  {/* Summary Profile Header */}
                  <div className="patron-summary-card">
                    <div className="patron-name-block">
                      <h4>{inspectingUser.full_name}</h4>
                      <span className="patron-email">{inspectingUser.email}</span>
                    </div>
                    <div className="patron-meta-pills">
                      <span className="patron-card-pill">{inspectingUser.member_card_no}</span>
                      <span className={`role-badge ${inspectingUser.role}`}>{inspectingUser.role}</span>
                      <span className={`status-pill ${inspectingUser.is_active ? 'active' : 'inactive'}`}>
                        {inspectingUser.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </div>
                  </div>

                  {/* Borrowing History Table */}
                  <div className="user-loans-section">
                    <h5>Complete Borrowing Records</h5>
                    {inspectingUser.borrowing_history?.length > 0 ? (
                      <div className="loans-table-wrap">
                        <table className="mini-loans-table">
                          <thead>
                            <tr>
                              <th>Book Title</th>
                              <th>Borrow Date</th>
                              <th>Due Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inspectingUser.borrowing_history.map((l) => (
                              <tr key={l.id}>
                                <td>{l.book_title}</td>
                                <td>{l.borrow_date}</td>
                                <td>{l.due_date}</td>
                                <td>
                                  <span className={`status-tag ${l.status}`}>
                                    {l.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="no-loans-notice">No borrowing records registered for this account.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-modal-btn cancel"
                onClick={() => setInspectingUser(null)}
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: CONFIRM TOGGLE USER ACCOUNT */}
      {/* ========================================================= */}
      {userDeactivating && (
        <div className="admin-confirm-modal-overlay">
          <div className="admin-confirm-modal">
            <div className="confirm-icon danger">
              <AlertTriangle size={32} />
            </div>
            <h3 className="confirm-title">
              {userDeactivating.is_active ? 'Deactivate Account?' : 'Activate Account?'}
            </h3>
            <p className="confirm-message">
              Are you sure you want to {userDeactivating.is_active ? 'deactivate' : 'activate'} the account for{' '}
              <strong>{userDeactivating.full_name}</strong> ({userDeactivating.email})?
              {userDeactivating.is_active && ' They will be blocked from borrowing books and logging into the platform.'}
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="admin-modal-btn cancel"
                onClick={() => setUserDeactivating(null)}
                disabled={userActionProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-modal-btn delete"
                onClick={() => handleToggleUserStatus(userDeactivating)}
                disabled={userActionProcessing}
              >
                {userActionProcessing ? 'Updating...' : (userDeactivating.is_active ? 'Yes, Deactivate' : 'Yes, Activate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUBCOMPONENT: LIBRARY MODAL (ADD / EDIT)
// ---------------------------------------------------------------------------
function LibraryModal({ library, isOpen, onClose, onSave, isSubmitting }) {
  const isEdit = Boolean(library);
  const [formData, setFormData] = useState({
    name: library?.name || '',
    area: library?.area || '',
    locality: library?.locality || '',
    region: library?.region || 'South Mumbai',
    city: library?.city || 'Mumbai',
    state: library?.state || 'Maharashtra',
    pincode: library?.pincode || '400001',
    address: library?.address || '',
    phone: library?.phone || '+91 (022) ',
    email: library?.email || '',
    website: library?.website || '',
    supervisor: library?.supervisor || 'Chief Librarian',
    hours_weekdays: library?.hours?.weekdays || '09:00 AM – 08:00 PM',
    hours_saturday: library?.hours?.saturday || '09:00 AM – 06:00 PM',
    hours_sunday: library?.hours?.sunday || 'Closed',
    services: library?.services?.join(', ') || 'General Book Lending, Reference Reading Hall, Free Civic Wi-Fi, Rare Heritage Archives',
    description: library?.description || library?.accessNote || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      alert('Please fill in Library Name and Address.');
      return;
    }

    const servicesArray = formData.services
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name.trim(),
      area: formData.area.trim() || formData.locality.trim() || 'Mumbai',
      locality: formData.locality.trim() || formData.area.trim() || 'Mumbai',
      region: formData.region,
      city: formData.city.trim() || 'Mumbai',
      state: formData.state.trim() || 'Maharashtra',
      pincode: formData.pincode.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      website: formData.website.trim(),
      supervisor: formData.supervisor.trim(),
      description: formData.description.trim(),
      hours: {
        weekdays: formData.hours_weekdays,
        saturday: formData.hours_saturday,
        sunday: formData.hours_sunday
      },
      services: servicesArray,
      isVerified: true,
      isActive: true
    };

    onSave(payload, isEdit);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-box library-form-modal">
        <div className="admin-modal-header">
          <div className="modal-title-wrap">
            <Building2 size={20} className="modal-icon" />
            <h3>{isEdit ? 'Edit Library Branch' : 'Add New Library Branch'}</h3>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-modal-body form-grid">
            {/* Library Name */}
            <div className="form-group full-width">
              <label>Library Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. David Sassoon Library and Reading Room"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Address */}
            <div className="form-group full-width">
              <label>Street Address *</label>
              <textarea
                required
                rows={2}
                className="form-textarea"
                placeholder="Complete street address..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Locality & Area */}
            <div className="form-group">
              <label>Locality / Area *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Fort / Kala Ghoda"
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value, area: e.target.value })}
              />
            </div>

            {/* PIN Code */}
            <div className="form-group">
              <label>PIN Code *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="400001"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>

            {/* City & State */}
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                className="form-input"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            {/* Phone & Email */}
            <div className="form-group">
              <label>Contact Phone *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="+91 (022) 2284-3703"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Official Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="info@davidsassoonlibrary.org"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Opening Hours */}
            <div className="form-group">
              <label>Weekdays Hours</label>
              <input
                type="text"
                className="form-input"
                placeholder="09:00 AM – 08:00 PM"
                value={formData.hours_weekdays}
                onChange={(e) => setFormData({ ...formData, hours_weekdays: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Saturday / Sunday Hours</label>
              <input
                type="text"
                className="form-input"
                placeholder="09:00 AM – 06:00 PM (Sat) / Closed (Sun)"
                value={formData.hours_saturday}
                onChange={(e) => setFormData({ ...formData, hours_saturday: e.target.value })}
              />
            </div>

            {/* Facilities / Amenities */}
            <div className="form-group full-width">
              <label>Facilities & Services (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Reading Hall, High-Speed Wi-Fi, Air Conditioned, Rare Archives"
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label>Description & Architectural Note</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Historical significance, public access details, and collections overview..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-modal-btn cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-modal-btn save"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Branch...' : (isEdit ? 'Save Changes' : 'Create Library')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUBCOMPONENT: BOOK MODAL (ADD / EDIT INCLUDING MISSING FIELDS)
// ---------------------------------------------------------------------------
function BookModalAdmin({ book, isOpen, onClose, onSave, isSubmitting }) {
  const isEdit = Boolean(book);
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    category: book?.category || 'Computer Science',
    publisher: book?.publisher || '',
    publication_year: book?.publication_year || 2023,
    description: book?.description || '',
    cover_url: book?.cover_url || '',
    shelf_location: book?.shelf_location || 'General Stacks A1',
    total_copies: book?.total_copies || 3,
    available_copies: book?.available_copies ?? 3,
    tags: book?.tags || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) {
      alert('Please fill in Title and Author.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      isbn: formData.isbn.trim() || undefined,
      category: formData.category,
      publisher: formData.publisher.trim() || undefined,
      publication_year: parseInt(formData.publication_year, 10) || 2023,
      description: formData.description.trim(),
      cover_url: formData.cover_url.trim() || undefined,
      shelf_location: formData.shelf_location.trim(),
      total_copies: parseInt(formData.total_copies, 10) || 1,
      available_copies: Math.min(parseInt(formData.available_copies, 10) || 0, parseInt(formData.total_copies, 10) || 1),
      tags: formData.tags.trim()
    };

    onSave(payload, isEdit);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-box book-form-modal">
        <div className="admin-modal-header">
          <div className="modal-title-wrap">
            <BookOpen size={20} className="modal-icon" />
            <h3>{isEdit ? 'Edit Book Details' : 'Add New Book to Catalog'}</h3>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-modal-body form-grid">
            {/* Title */}
            <div className="form-group full-width">
              <label>Book Title *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Designing Data-Intensive Applications"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Author */}
            <div className="form-group">
              <label>Author *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Martin Kleppmann"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>

            {/* ISBN */}
            <div className="form-group">
              <label>ISBN</label>
              <input
                type="text"
                className="form-input"
                placeholder="978-1449373320"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Self-Help & Motivation">Self-Help & Motivation</option>
                <option value="Science & Nature">Science & Nature</option>
                <option value="Fantasy & Adventure">Fantasy & Adventure</option>
                <option value="Classic Literature">Classic Literature</option>
                <option value="Historical Fiction">Historical Fiction</option>
                <option value="Economics & Business">Economics & Business</option>
                <option value="Philosophy & Essays">Philosophy & Essays</option>
              </select>
            </div>

            {/* Publisher */}
            <div className="form-group">
              <label>Publisher</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. O'Reilly Media"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              />
            </div>

            {/* Publication Year */}
            <div className="form-group">
              <label>Publication Year</label>
              <input
                type="number"
                className="form-input"
                placeholder="2023"
                value={formData.publication_year}
                onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
              />
            </div>

            {/* Shelf Location */}
            <div className="form-group">
              <label>Shelf Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="Aisle 3, Shelf CS-08"
                value={formData.shelf_location}
                onChange={(e) => setFormData({ ...formData, shelf_location: e.target.value })}
              />
            </div>

            {/* Total Copies */}
            <div className="form-group">
              <label>Total Physical Copies *</label>
              <input
                type="number"
                min={1}
                required
                className="form-input"
                value={formData.total_copies}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 1;
                  setFormData({
                    ...formData,
                    total_copies: val,
                    available_copies: Math.min(formData.available_copies, val)
                  });
                }}
              />
            </div>

            {/* Available Copies */}
            <div className="form-group">
              <label>Available On Shelf *</label>
              <input
                type="number"
                min={0}
                max={formData.total_copies}
                required
                className="form-input"
                value={formData.available_copies}
                onChange={(e) => setFormData({ ...formData, available_copies: parseInt(e.target.value, 10) || 0 })}
              />
            </div>

            {/* Cover Image URL */}
            <div className="form-group full-width">
              <label>Cover Image URL (Direct HTTPS link)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={formData.cover_url}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label>Synopsis & Book Description *</label>
              <textarea
                required
                rows={3}
                className="form-textarea"
                placeholder="Detailed summary for catalog discovery and AI recommendations..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-modal-btn cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-modal-btn save"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Book...' : (isEdit ? 'Save Changes' : 'Add to Catalog')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
