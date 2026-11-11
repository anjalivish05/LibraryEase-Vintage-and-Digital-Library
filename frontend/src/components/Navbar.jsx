import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  User, 
  Menu, 
  X, 
  Bookmark,
  Compass, 
  ArrowRight,
  Bell,
  LogIn,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ 
  activePage, 
  setActivePage, 
  borrowedCount = 0,
  unreadNotifications = 0,
  currentUser = null,
  onOpenNotifications,
  onOpenAuth
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore Books' },
    { id: 'libraries', label: 'Find Libraries' },
    { id: 'services', label: 'Services' },
    { id: 'ai-assistant', label: 'AI Assistant', isAi: true },
    { id: 'about', label: 'About' },
    { id: 'feedback', label: 'Feedback' },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Vintage Editorial Ribbon */}
      <div className="top-notice-bar">
        <div className="container top-notice-content">
          <div className="ribbon-leaf-accent left">❦</div>
          <span className="notice-pill">Free Civic Membership</span>
          <p className="notice-text">
            Welcome to LibraryEase — connecting Mumbai readers and scholars to public libraries, heritage archives & smart discovery across Maharashtra.
          </p>
          <button 
            type="button" 
            className="notice-link-btn"
            onClick={() => handleNavClick('libraries')}
          >
            Find Branches &rarr;
          </button>
          <div className="ribbon-leaf-accent right">❦</div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="main-header">
        <div className="container header-inner">
          {/* Logo with Vintage Open-Book Icon */}
          <button 
            type="button" 
            className="brand-logo" 
            onClick={() => handleNavClick('home')}
            aria-label="LibraryEase Home"
          >
            <div className="logo-icon-wrap">
              <BookOpen className="logo-icon" size={22} />
            </div>
            <div className="logo-text-block">
              <span className="logo-title">LibraryEase</span>
              <span className="logo-subtitle">Est. 1898 • Public Library</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                className={`nav-link ${activePage === link.id ? 'active' : ''} ${link.isAi ? 'nav-link-ai' : ''}`}
                onClick={() => handleNavClick(link.id)}
              >
                {link.isAi && <Sparkles size={14} className="nav-ai-sparkle" />}
                <span>{link.label}</span>
                {activePage === link.id && <span className="active-dot" />}
              </button>
            ))}
          </nav>

          {/* Header Action Buttons */}
          <div className="header-actions">
            {/* Notification Bell Button */}
            <button
              type="button"
              className="notif-bell-action-btn"
              onClick={onOpenNotifications}
              title="View Due-Date Reminders and Circulation Notices"
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unreadNotifications > 0 && (
                <span className="header-notif-badge" aria-label={`${unreadNotifications} unread notifications`}>
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* My Library Dashboard Link */}
            <button
              type="button"
              className={`cta-account-btn ${activePage === 'my-library' ? 'active' : ''}`}
              onClick={() => handleNavClick('my-library')}
              title="View Borrowed Books and Due Dates"
            >
              <User size={15} />
              <span className="account-text">My Library</span>
              {borrowedCount > 0 && (
                <span className="badge-counter" aria-label={`${borrowedCount} borrowed books`}>
                  {borrowedCount}
                </span>
              )}
            </button>

            {/* Patron Profile / Sign In Pill */}
            <button
              type="button"
              className={`patron-sign-in-btn ${currentUser ? 'signed-in' : ''}`}
              onClick={onOpenAuth}
              title={currentUser ? `Account: ${currentUser.full_name}` : 'Sign In or Register Member Card'}
            >
              {currentUser ? (
                <>
                  {currentUser.role === 'librarian' ? (
                    <ShieldCheck size={14} className="user-icon-badge" />
                  ) : (
                    <User size={14} className="user-icon-badge" />
                  )}
                  <span className="patron-btn-text">
                    {currentUser.full_name.split(' ')[0]} ({currentUser.member_card_no})
                  </span>
                </>
              ) : (
                <>
                  <LogIn size={14} />
                  <span className="patron-btn-text">Patron Sign In</span>
                </>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <div className="container mobile-nav-inner">
              <div className="mobile-links-list">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    className={`mobile-nav-item ${activePage === link.id ? 'active' : ''} ${link.isAi ? 'mobile-ai-item' : ''}`}
                    onClick={() => handleNavClick(link.id)}
                  >
                    <span className="mobile-item-title">
                      {link.isAi && <Sparkles size={15} className="nav-ai-sparkle" />}
                      {link.label}
                    </span>
                    {activePage === link.id && <span className="badge-current">Current</span>}
                  </button>
                ))}
              </div>

              <div className="mobile-drawer-footer">
                <button
                  type="button"
                  className="mobile-drawer-btn library-btn"
                  onClick={() => handleNavClick('my-library')}
                >
                  <User size={17} />
                  <span>My Library Dashboard ({borrowedCount} Borrowed)</span>
                </button>

                <div className="mobile-aux-actions">
                  <button
                    type="button"
                    className="mobile-aux-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenNotifications();
                    }}
                  >
                    <Bell size={16} />
                    <span>Notifications ({unreadNotifications})</span>
                  </button>
                  <button
                    type="button"
                    className="mobile-aux-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                  >
                    <User size={16} />
                    <span>{currentUser ? currentUser.full_name : 'Sign In / Register'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
