import React, { useState, useRef, useEffect } from 'react';
import { 
  Home,
  BookOpen, 
  MapPin, 
  LayoutGrid, 
  Sparkles, 
  Info, 
  MessageSquare, 
  Bell, 
  User, 
  ShieldCheck, 
  ChevronDown, 
  CreditCard,
  Bookmark,
  Calendar,
  ArrowLeftRight,
  Library,
  BarChart3,
  Menu,
  X,
  Check
} from 'lucide-react';
import './Navbar.css';

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
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Mumbai');

  const servicesRef = useRef(null);
  const locationRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setServicesDropdownOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setLocationDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mumbaiLocations = [
    { name: 'All Mumbai Branches', area: 'Municipal Network' },
    { name: 'Fort & Town Hall', area: 'South Mumbai' },
    { name: 'Kala Ghoda Heritage', area: 'David Sassoon' },
    { name: 'Dadar Civic Reading Room', area: 'Central Mumbai' },
    { name: 'Bandra Suburban Library', area: 'Western Suburbs' }
  ];

  return (
    <>
      {/* --------------------------------------------------------------------
          1. TOP ANNOUNCEMENT BAR (Slim Dark Forest-Green)
          -------------------------------------------------------------------- */}
      <div className="heritage-topbar">
        <div className="heritage-topbar-inner">
          {/* Left: Civic Badge + Separator */}
          <div className="heritage-topbar-left">
            <div className="topbar-membership-badge">
              <CreditCard size={12} className="topbar-badge-icon" />
              <span>Free Civic Membership</span>
            </div>
            <span className="topbar-divider">|</span>
          </div>

          {/* Center: Heritage message */}
          <div className="heritage-topbar-center">
            <span>
              <strong className="topbar-welcome-strong">Welcome to LibraryEase</strong> — Connecting Mumbai&apos;s readers to public libraries, heritage archives &amp; smart discovery across Maharashtra.
            </span>
          </div>

          {/* Right: Separator + Mumbai Location Dropdown */}
          <div className="heritage-topbar-right" ref={locationRef}>
            <span className="topbar-divider">|</span>
            <button 
              type="button" 
              className="topbar-location-btn"
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              aria-label="Select Library City or Branch"
              aria-expanded={locationDropdownOpen}
            >
              <MapPin size={13} className="topbar-pin-icon" />
              <span>{selectedLocation}</span>
              <ChevronDown size={12} className={`topbar-chevron ${locationDropdownOpen ? 'open' : ''}`} />
            </button>

            {locationDropdownOpen && (
              <div className="location-dropdown-menu">
                <div className="location-dropdown-header">Mumbai Reading Rooms</div>
                {mumbaiLocations.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    className={`location-dropdown-item ${selectedLocation === loc.name ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedLocation(loc.name);
                      setLocationDropdownOpen(false);
                      handleNavClick('libraries');
                    }}
                  >
                    <span>{loc.name}</span>
                    {selectedLocation === loc.name && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          2. MAIN NAVIGATION HEADER (Antique Cream, Classical Illustrations)
          -------------------------------------------------------------------- */}
      <header className="heritage-main-header">
        <div className="heritage-header-container">
          {/* Subtle Neoclassical Library Facade Watermark (Far Left) */}
          <div className="nav-watermark-left" aria-hidden="true">
            <svg width="120" height="78" viewBox="0 0 120 78" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Classical Pediment & Tympanum */}
              <polygon points="10,24 60,6 110,24" stroke="#B68A4C" strokeWidth="1.2" fill="none" />
              <polygon points="18,23 60,9 102,23" stroke="#2B1E1A" strokeWidth="0.8" fill="none" opacity="0.6" />
              <circle cx="60" cy="18" r="3.5" stroke="#B68A4C" strokeWidth="0.8" />
              {/* Entablature */}
              <rect x="10" y="24" width="100" height="5" stroke="#B68A4C" strokeWidth="1" fill="none" />
              {/* Columns */}
              <line x1="22" y1="29" x2="22" y2="65" stroke="#2B1E1A" strokeWidth="1.5" />
              <line x1="38" y1="29" x2="38" y2="65" stroke="#2B1E1A" strokeWidth="1.5" />
              <line x1="82" y1="29" x2="82" y2="65" stroke="#2B1E1A" strokeWidth="1.5" />
              <line x1="98" y1="29" x2="98" y2="65" stroke="#2B1E1A" strokeWidth="1.5" />
              {/* Column Capitals */}
              <path d="M19,29 Q22,27 25,29" stroke="#B68A4C" strokeWidth="1" />
              <path d="M35,29 Q38,27 41,29" stroke="#B68A4C" strokeWidth="1" />
              <path d="M79,29 Q82,27 85,29" stroke="#B68A4C" strokeWidth="1" />
              <path d="M95,29 Q98,27 101,29" stroke="#B68A4C" strokeWidth="1" />
              {/* Arched Central Portal */}
              <path d="M50,65 L50,44 Q60,34 70,44 L70,65 Z" stroke="#B68A4C" strokeWidth="1" fill="none" />
              {/* Grand Staircase Base */}
              <rect x="6" y="65" width="108" height="3" stroke="#B68A4C" strokeWidth="1" fill="none" />
              <rect x="3" y="68" width="114" height="3" stroke="#2B1E1A" strokeWidth="1" fill="none" opacity="0.5" />
              <rect x="0" y="71" width="120" height="4" stroke="#B68A4C" strokeWidth="1" fill="none" />
            </svg>
          </div>

          {/* Left Section: Logo & Brand Identity */}
          <button 
            type="button" 
            className="heritage-brand-btn" 
            onClick={() => handleNavClick('home')}
            aria-label="LibraryEase Public Library Home"
          >
            <div className="heritage-logo-square">
              <BookOpen size={24} strokeWidth={1.8} />
            </div>
            <div className="heritage-logo-text">
              <span className="heritage-brand-title">LibraryEase</span>
              <span className="heritage-brand-subtitle">EST. 1898 • PUBLIC LIBRARY •</span>
            </div>
          </button>

          {/* Center Section: Navigation Menu Items */}
          <nav className="heritage-nav-menu" aria-label="Main Navigation">
            {/* 1. Home (Active Forest Green Pill) */}
            <button
              type="button"
              className={`heritage-nav-item ${activePage === 'home' ? 'active-pill' : ''}`}
              onClick={() => handleNavClick('home')}
            >
              <Home size={18} className="nav-item-icon" />
              <span className="nav-item-label">Home</span>
            </button>

            {/* 2. Explore Books */}
            <button
              type="button"
              className={`heritage-nav-item ${activePage === 'explore' ? 'active-pill' : ''}`}
              onClick={() => handleNavClick('explore')}
            >
              <BookOpen size={18} className="nav-item-icon" />
              <span className="nav-item-label">
                {activePage === 'explore' ? 'Explore Books' : <>Explore<br />Books</>}
              </span>
            </button>

            {/* 3. Find Libraries */}
            <button
              type="button"
              className={`heritage-nav-item ${activePage === 'libraries' ? 'active-pill' : ''}`}
              onClick={() => handleNavClick('libraries')}
            >
              <MapPin size={18} className="nav-item-icon" />
              <span className="nav-item-label">
                {activePage === 'libraries' ? 'Find Libraries' : <>Find<br />Libraries</>}
              </span>
            </button>

            {/* 4. Services (with Mega-Dropdown) */}
            <div 
              className="services-dropdown-container" 
              ref={servicesRef}
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                type="button"
                className={`heritage-nav-item ${activePage === 'services' ? 'active-pill' : ''}`}
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                aria-expanded={servicesDropdownOpen}
                aria-haspopup="true"
              >
                <LayoutGrid size={18} className="nav-item-icon" />
                <span className="nav-item-label nav-item-label-with-caret">
                  <span>Services</span>
                  <ChevronDown size={12} />
                </span>
              </button>

              {/* Services Mega-Dropdown Panel */}
              {servicesDropdownOpen && (
                <div className="services-mega-menu" role="menu">
                  <div className="services-mega-caret" />
                  
                  {/* Service 1: Membership */}
                  <button
                    type="button"
                    className="service-card-item"
                    role="menuitem"
                    onClick={() => {
                      setServicesDropdownOpen(false);
                      onOpenAuth();
                    }}
                  >
                    <div className="service-card-icon-wrap">
                      <BookOpen size={22} strokeWidth={1.8} />
                    </div>
                    <span className="service-card-title">Membership</span>
                    <span className="service-card-desc">Register &amp; manage</span>
                  </button>

                  {/* Service 2: Book Reservation */}
                  <button
                    type="button"
                    className="service-card-item"
                    role="menuitem"
                    onClick={() => {
                      setServicesDropdownOpen(false);
                      handleNavClick('explore');
                    }}
                  >
                    <div className="service-card-icon-wrap">
                      <Calendar size={22} strokeWidth={1.8} />
                    </div>
                    <span className="service-card-title">Book Reservation</span>
                    <span className="service-card-desc">Reserve your books</span>
                  </button>

                  {/* Service 3: Circulation */}
                  <button
                    type="button"
                    className="service-card-item"
                    role="menuitem"
                    onClick={() => {
                      setServicesDropdownOpen(false);
                      if (currentUser?.role === 'librarian') {
                        handleNavClick('librarian');
                      } else {
                        handleNavClick('my-library');
                      }
                    }}
                  >
                    <div className="service-card-icon-wrap">
                      <ArrowLeftRight size={22} strokeWidth={1.8} />
                    </div>
                    <span className="service-card-title">Circulation</span>
                    <span className="service-card-desc">Issue, return &amp; renew</span>
                  </button>

                  {/* Service 4: Digital Resources */}
                  <button
                    type="button"
                    className="service-card-item"
                    role="menuitem"
                    onClick={() => {
                      setServicesDropdownOpen(false);
                      handleNavClick('explore');
                    }}
                  >
                    <div className="service-card-icon-wrap">
                      <Library size={22} strokeWidth={1.8} />
                    </div>
                    <span className="service-card-title">Digital Resources</span>
                    <span className="service-card-desc">E-books &amp; archives</span>
                  </button>

                  {/* Service 5: Reports & Analytics */}
                  <button
                    type="button"
                    className="service-card-item"
                    role="menuitem"
                    onClick={() => {
                      setServicesDropdownOpen(false);
                      handleNavClick('services');
                    }}
                  >
                    <div className="service-card-icon-wrap">
                      <BarChart3 size={22} strokeWidth={1.8} />
                    </div>
                    <span className="service-card-title">Reports &amp; Analytics</span>
                    <span className="service-card-desc">Library usage insights</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. AI Assistant (Pill with Dusty Lavender background) */}
            <button
              type="button"
              className={`heritage-ai-btn ${activePage === 'ai-assistant' ? 'active' : ''}`}
              onClick={() => handleNavClick('ai-assistant')}
            >
              <Sparkles size={15} className="ai-sparkle-icon" />
              <span>AI Assistant</span>
            </button>

            {/* 6. About */}
            <button
              type="button"
              className={`heritage-nav-item ${activePage === 'about' ? 'active-pill' : ''}`}
              onClick={() => handleNavClick('about')}
            >
              <Info size={18} className="nav-item-icon" />
              <span className="nav-item-label">About</span>
            </button>

            {/* 7. Feedback */}
            <button
              type="button"
              className={`heritage-nav-item ${activePage === 'feedback' ? 'active-pill' : ''}`}
              onClick={() => handleNavClick('feedback')}
            >
              <MessageSquare size={18} className="nav-item-icon" />
              <span className="nav-item-label">Feedback</span>
            </button>
          </nav>

          {/* Right Section: Actions (Notifications, My Library, Admin Portal, Account) */}
          <div className="heritage-nav-actions">
            {/* 1. Notification Bell with Count */}
            <button
              type="button"
              className="heritage-notif-btn"
              onClick={onOpenNotifications}
              title="View Due-Date Reminders and Notices"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="heritage-notif-badge">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* 2. My Library Button with Counter */}
            <button
              type="button"
              className={`heritage-library-btn ${activePage === 'my-library' ? 'active' : ''}`}
              onClick={() => handleNavClick('my-library')}
              title="View Borrowed Books and Due Dates"
            >
              <User size={16} />
              <span>My Library</span>
              {borrowedCount > 0 && (
                <span className="library-count-badge">{borrowedCount}</span>
              )}
            </button>

            {/* 3. Admin Portal Button (Forest Green + Gold Border) */}
            <button
              type="button"
              className={`heritage-admin-btn ${activePage === 'admin' || activePage === 'admin-login' ? 'active' : ''}`}
              onClick={() => handleNavClick(currentUser?.role === 'admin' ? 'admin' : 'admin-login')}
              title="Platform Governance & Admin Portal"
            >
              <ShieldCheck size={16} className="admin-shield-icon" />
              <span>Admin Portal</span>
            </button>

            {/* 4. User Profile / Account Menu Pill */}
            <button
              type="button"
              className="heritage-account-btn"
              onClick={onOpenAuth}
              title={currentUser ? `Signed in as ${currentUser.full_name} (${currentUser.member_card_no})` : 'Sign In or Register Member Card'}
              aria-label="User Account"
            >
              <div className="account-avatar-circle">
                <User size={14} />
              </div>
              <span className="account-online-dot" title="Active Connection" />
              <span className="account-label-text">
                {currentUser ? (currentUser.full_name ? currentUser.full_name.split(' ')[0] : 'Member') : 'LibraryEase'}
              </span>
              <ChevronDown size={13} className="account-chevron" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="heritage-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------------
            3. MOBILE NAVIGATION DRAWER
            -------------------------------------------------------------------- */}
        {mobileMenuOpen && (
          <div className="heritage-mobile-drawer">
            <div className="heritage-mobile-links">
              <button
                type="button"
                className={`heritage-mobile-link ${activePage === 'home' ? 'active' : ''}`}
                onClick={() => handleNavClick('home')}
              >
                <span>Home</span>
                <Home size={16} />
              </button>

              <button
                type="button"
                className={`heritage-mobile-link ${activePage === 'explore' ? 'active' : ''}`}
                onClick={() => handleNavClick('explore')}
              >
                <span>Explore Books</span>
                <BookOpen size={16} />
              </button>

              <button
                type="button"
                className={`heritage-mobile-link ${activePage === 'libraries' ? 'active' : ''}`}
                onClick={() => handleNavClick('libraries')}
              >
                <span>Find Libraries</span>
                <MapPin size={16} />
              </button>

              {/* Mobile Services Accordion */}
              <div>
                <button
                  type="button"
                  className={`heritage-mobile-link ${activePage === 'services' ? 'active' : ''}`}
                  onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                >
                  <span>Services</span>
                  <ChevronDown size={16} style={{ transform: servicesDropdownOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
                {servicesDropdownOpen && (
                  <div className="heritage-mobile-subservices">
                    <button
                      type="button"
                      className="mobile-subservice-btn"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAuth();
                      }}
                    >
                      <BookOpen size={15} />
                      <span>Membership (Register &amp; Manage)</span>
                    </button>
                    <button
                      type="button"
                      className="mobile-subservice-btn"
                      onClick={() => handleNavClick('explore')}
                    >
                      <Calendar size={15} />
                      <span>Book Reservation</span>
                    </button>
                    <button
                      type="button"
                      className="mobile-subservice-btn"
                      onClick={() => handleNavClick(currentUser?.role === 'librarian' ? 'librarian' : 'my-library')}
                    >
                      <ArrowLeftRight size={15} />
                      <span>Circulation</span>
                    </button>
                    <button
                      type="button"
                      className="mobile-subservice-btn"
                      onClick={() => handleNavClick('explore')}
                    >
                      <Library size={15} />
                      <span>Digital Resources</span>
                    </button>
                    <button
                      type="button"
                      className="mobile-subservice-btn"
                      onClick={() => handleNavClick('services')}
                    >
                      <BarChart3 size={15} />
                      <span>Reports &amp; Analytics</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                className={`heritage-mobile-link ${activePage === 'ai-assistant' ? 'active' : ''}`}
                onClick={() => handleNavClick('ai-assistant')}
              >
                <span>AI Assistant</span>
                <Sparkles size={16} style={{ color: '#7B6899' }} />
              </button>

              <button
                type="button"
                className={`heritage-mobile-link ${activePage === 'about' ? 'active' : ''}`}
                onClick={() => handleNavClick('about')}
              >
                <span>About</span>
                <Info size={16} />
              </button>

              <button
                type="button"
                className={`heritage-mobile-link ${activePage === 'feedback' ? 'active' : ''}`}
                onClick={() => handleNavClick('feedback')}
              >
                <span>Feedback</span>
                <MessageSquare size={16} />
              </button>
            </div>

            <div className="heritage-mobile-footer">
              <button
                type="button"
                className="heritage-library-btn"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => handleNavClick('my-library')}
              >
                <User size={16} />
                <span>My Library Dashboard ({borrowedCount} Borrowed)</span>
              </button>

              <button
                type="button"
                className="heritage-admin-btn"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => handleNavClick(currentUser?.role === 'admin' ? 'admin' : 'admin-login')}
              >
                <ShieldCheck size={16} className="admin-shield-icon" />
                <span>Admin Portal</span>
              </button>

              <button
                type="button"
                className="heritage-account-btn"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
              >
                <User size={15} />
                <span>{currentUser ? currentUser.full_name : 'Sign In / Register Card'}</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
