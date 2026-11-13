import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  Library, 
  Clock, 
  ArrowRight, 
  Compass, 
  CheckCircle2, 
  Bookmark,
  CalendarDays,
  MapPin,
  Laptop,
  GraduationCap
} from 'lucide-react';
import BookCard from './BookCard';
import { CATEGORIES } from '../data/booksData';

export default function HomePage({ 
  books, 
  onSelectBook, 
  onBorrowToggle, 
  borrowedBookIds, 
  onNavigate, 
  onSearchFromHome 
}) {
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchFromHome(searchInput, selectedCategory);
  };

  const featuredBooks = books.filter((b) => b.featured).slice(0, 4);

  // 4 Core Public Services required: Book Discovery, Library Locations, Borrowing Reminders, AI Recommendations
  const coreServices = [
    {
      id: 'book-discovery',
      title: 'Book Discovery',
      badge: 'Catalog & Stacks',
      desc: 'Browse over 48,000 catalogued volumes across literature, science, history, philosophy, and modern fiction.',
      action: 'Explore Catalogue',
      page: 'explore',
      isAi: false
    },
    {
      id: 'library-locations',
      title: 'Library Locations',
      badge: 'Mumbai Hubs',
      desc: 'Discover public libraries and reading sanctums across Mumbai, from historic Fort archives to suburban study halls.',
      action: 'Find a Library',
      page: 'libraries',
      isAi: false
    },
    {
      id: 'borrowing-reminders',
      title: 'Borrowing Reminders',
      badge: 'Patron Account',
      desc: 'Track borrowed loans, receive 3-day return notifications, and renew books online with ₹0 overdue fees.',
      action: 'View Loans & Holds',
      page: 'my-library',
      isAi: false
    },
    {
      id: 'ai-recommendations',
      title: 'AI Recommendations',
      badge: 'Smart Curator',
      desc: 'Receive tailored reading recommendations matched to your mood and pace through our smart heuristic engine.',
      action: 'Consult AI Assistant',
      page: 'ai-assistant',
      isAi: true
    }
  ];

  return (
    <div className="home-page-view">
      {/* Editorial Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-crest-badge">
              <span>Public Library Website & Digital System</span>
            </div>

            <h1 className="hero-heading">
              LibraryEase – Your Gateway to <span className="highlight-text">Knowledge</span>
            </h1>

            <p className="hero-subtitle">
              Step into a warm sanctuary of world literature and community learning. 
              LibraryEase is a modern public library management system providing free access to expansive literary archives, 
              catalog search, neighborhood study sanctuaries, and intelligent digital discovery.
            </p>

            {/* Large Search Bar */}
            <form className="hero-search-form" onSubmit={handleSearchSubmit}>
              <div className="search-input-group">
                <Search size={20} className="search-icon-hero" />
                <input
                  type="text"
                  placeholder="Search books, authors, subjects, or ISBNs..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="hero-search-input"
                  aria-label="Search catalog"
                />
              </div>

              <select
                className="hero-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
              >
                {CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>

              <button type="submit" className="hero-submit-btn">
                <span>Find Books</span>
                <ArrowRight size={17} />
              </button>
            </form>

            {/* Prominent Explore & Find Library Buttons */}
            <div className="hero-cta-buttons-row">
              <button
                type="button"
                className="btn-hero-primary"
                onClick={() => onNavigate('explore')}
              >
                <BookOpen size={17} />
                <span>Explore Books</span>
              </button>

              <button
                type="button"
                className="btn-hero-secondary"
                onClick={() => onNavigate('libraries')}
              >
                <Compass size={17} />
                <span>Find a Library</span>
              </button>

              <button
                type="button"
                className="btn-hero-ai"
                onClick={() => onNavigate('ai-assistant')}
              >
                <Sparkles size={16} />
                <span>AI Book Assistant</span>
              </button>
            </div>

            {/* Quick trending searches */}
            <div className="quick-tags-row">
              <span className="quick-tags-label">Popular in Stacks:</span>
              {['Project Hail Mary', 'Robin Wall Kimmerer', 'Marcus Aurelius', 'Ecology', 'Dystopian'].map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-search-pill"
                  onClick={() => onSearchFromHome(tag, 'All Categories')}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Warm Library Reading-Room Visual Illustration */}
          <div className="hero-visual-side">
            <div className="vintage-illustration-card">
              <div className="illustration-inner-frame">
                {/* SVG Visual of Vintage Library Reading Room */}
                <div className="reading-room-scene" role="img" aria-label="Vintage library reading room with arched window, bookshelf stacks, warm reading lamp, and leather-bound books">
                  <svg viewBox="0 0 460 360" className="reading-room-svg" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#5C4033" />
                        <stop offset="100%" stopColor="#3B2820" />
                      </linearGradient>
                      <linearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F8F2EA" />
                        <stop offset="100%" stopColor="#B6A89C" />
                      </linearGradient>
                      <linearGradient id="woodTone" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4A3426" />
                        <stop offset="100%" stopColor="#382519" />
                      </linearGradient>
                      <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FFF8E7" stopOpacity="0.9" />
                        <stop offset="40%" stopColor="#B6A89C" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#B6A89C" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Room Background */}
                    <rect x="0" y="0" width="460" height="360" rx="8" fill="url(#wallGrad)" />

                    {/* Arched Classical Window */}
                    <path d="M 230 40 C 160 40, 150 110, 150 200 L 310 200 C 310 110, 300 40, 230 40 Z" fill="url(#windowGlow)" opacity="0.85" />
                    {/* Window Mullions */}
                    <line x1="230" y1="40" x2="230" y2="200" stroke="#6B1E2B" strokeWidth="4" />
                    <line x1="150" y1="120" x2="310" y2="120" stroke="#6B1E2B" strokeWidth="3" />
                    <line x1="155" y1="160" x2="305" y2="160" stroke="#6B1E2B" strokeWidth="3" />
                    <path d="M 180 80 Q 230 110 280 80" stroke="#6B1E2B" strokeWidth="2" fill="none" opacity="0.6"/>

                    {/* Bookshelf Columns on Left & Right */}
                    {/* Left Stack */}
                    <rect x="20" y="50" width="105" height="230" rx="4" fill="url(#woodTone)" stroke="#271911" strokeWidth="2"/>
                    <line x1="20" y1="110" x2="125" y2="110" stroke="#271911" strokeWidth="4" />
                    <line x1="20" y1="170" x2="125" y2="170" stroke="#271911" strokeWidth="4" />
                    <line x1="20" y1="230" x2="125" y2="230" stroke="#271911" strokeWidth="4" />
                    {/* Books Shelf 1 */}
                    <rect x="25" y="65" width="12" height="45" fill="#ECE5DE" rx="1" />
                    <rect x="38" y="60" width="15" height="50" fill="#6B1E2B" rx="1" />
                    <rect x="54" y="68" width="14" height="42" fill="#B6A89C" rx="1" />
                    <rect x="69" y="62" width="16" height="48" fill="#884C38" rx="1" />
                    <rect x="86" y="66" width="18" height="44" fill="#B68A4C" rx="1" />
                    <rect x="105" y="70" width="15" height="40" fill="#6B1E2B" rx="1" />
                    {/* Books Shelf 2 */}
                    <rect x="25" y="125" width="16" height="45" fill="#B6A89C" rx="1" />
                    <rect x="42" y="120" width="14" height="50" fill="#6B1E2B" rx="1" />
                    <rect x="57" y="128" width="20" height="42" fill="#ECE5DE" rx="1" />
                    <rect x="78" y="122" width="15" height="48" fill="#B68A4C" rx="1" />
                    <rect x="94" y="124" width="26" height="46" fill="#884C38" rx="1" />

                    {/* Right Stack */}
                    <rect x="335" y="50" width="105" height="230" rx="4" fill="url(#woodTone)" stroke="#271911" strokeWidth="2"/>
                    <line x1="335" y1="110" x2="440" y2="110" stroke="#271911" strokeWidth="4" />
                    <line x1="335" y1="170" x2="440" y2="170" stroke="#271911" strokeWidth="4" />
                    <line x1="335" y1="230" x2="440" y2="230" stroke="#271911" strokeWidth="4" />
                    {/* Books Right */}
                    <rect x="340" y="62" width="18" height="48" fill="#B68A4C" rx="1"/>
                    <rect x="359" y="66" width="14" height="44" fill="#B6A89C" rx="1"/>
                    <rect x="374" y="58" width="22" height="52" fill="#6B1E2B" rx="1"/>
                    <rect x="397" y="64" width="16" height="46" fill="#ECE5DE" rx="1"/>
                    <rect x="414" y="68" width="20" height="42" fill="#884C38" rx="1"/>

                    {/* Reading Table in Foreground */}
                    <rect x="30" y="270" width="400" height="90" rx="6" fill="#422E22" stroke="#271911" strokeWidth="3"/>
                    <rect x="40" y="280" width="380" height="12" fill="#583E2F" opacity="0.8"/>

                    {/* Banker's Lamp */}
                    <circle cx="230" cy="245" r="90" fill="url(#lampGlow)" opacity="0.75" />
                    {/* Brass Stand */}
                    <rect x="227" y="235" width="6" height="45" fill="#B68A4C" rx="2" />
                    <ellipse cx="230" cy="280" rx="18" ry="5" fill="#8F6830" />
                    {/* Rich Burgundy Glass Shade with Gold Trim */}
                    <path d="M 205 235 C 205 220, 255 220, 255 235 Z" fill="#6B1E2B" stroke="#B68A4C" strokeWidth="1.5" />
                    <ellipse cx="230" cy="235" rx="25" ry="4" fill="#B68A4C" opacity="0.6"/>

                    {/* Open Book on Table */}
                    <path d="M 170 300 Q 200 295 230 302 Q 260 295 290 300 L 295 330 Q 260 323 230 330 Q 200 323 165 330 Z" fill="#F8F2EA" stroke="#2B1E1A" strokeWidth="1.5"/>
                    <line x1="230" y1="302" x2="230" y2="330" stroke="#6B1E2B" strokeWidth="2"/>
                    <line x1="180" y1="308" x2="220" y2="308" stroke="#2B1E1A" strokeWidth="1" opacity="0.4"/>
                    <line x1="180" y1="314" x2="220" y2="314" stroke="#2B1E1A" strokeWidth="1" opacity="0.4"/>
                    <line x1="180" y1="320" x2="215" y2="320" stroke="#2B1E1A" strokeWidth="1" opacity="0.4"/>
                    <line x1="240" y1="308" x2="280" y2="308" stroke="#2B1E1A" strokeWidth="1" opacity="0.4"/>
                    <line x1="240" y1="314" x2="280" y2="314" stroke="#2B1E1A" strokeWidth="1" opacity="0.4"/>
                    <line x1="240" y1="320" x2="275" y2="320" stroke="#2B1E1A" strokeWidth="1" opacity="0.4"/>

                    {/* Stack of Closed Books */}
                    <rect x="315" y="312" width="60" height="10" rx="1" fill="#6B1E2B" stroke="#5C4033"/>
                    <rect x="318" y="302" width="55" height="10" rx="1" fill="#ECE5DE" stroke="#6B1E2B"/>
                    <rect x="322" y="294" width="48" height="8" rx="1" fill="#B68A4C" stroke="#8F6830"/>
                  </svg>
                </div>

                <div className="illustration-caption">
                  <div className="caption-branch-title">
                    <span className="branch-dot" />
                    <strong>Central Carnegie Reading Hall</strong>
                  </div>
                  <span className="caption-hours">Open Daily • Quiet Study & Wi-Fi Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section (Required: Book Discovery, Library Locations, Borrowing Reminders, AI Recommendations) */}
      <section className="section-services-quad">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-eyebrow">Public Library Management & Services</span>
            <h2 className="section-heading">Essential Services at LibraryEase</h2>
            <p className="section-subtext">
              Connecting traditional book preservation with modern public digital library services for all residents.
            </p>
          </div>

          <div className="services-quad-grid">
            {coreServices.map((srv) => (
              <div 
                key={srv.id} 
                className={`service-card ${srv.isAi ? 'service-card-ai' : ''}`}
                onClick={() => onNavigate(srv.page)}
                role="button"
                tabIndex={0}
              >
                <div className="service-card-header">
                  <span className={`service-pill-tag ${srv.isAi ? 'tag-ai' : ''}`}>
                    {srv.isAi && <Sparkles size={12} className="pill-ai-sparkle" />}
                    {srv.badge}
                  </span>
                  <ArrowRight size={16} className="service-arrow" />
                </div>

                <h3 className="service-card-title">{srv.title}</h3>
                <p className="service-card-desc">{srv.desc}</p>

                <div className="service-card-footer">
                  <span className="service-action-link">{srv.action} &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured in Stacks Section */}
      <section className="section-featured-books">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-eyebrow">Curated Volumes</span>
              <h2 className="section-heading">Featured in Our Collection</h2>
              <p className="section-subtext">
                Handpicked titles by our librarians, ready for borrowing in physical and digital editions.
              </p>
            </div>
            <button
              type="button"
              className="view-all-link-btn"
              onClick={() => onNavigate('explore')}
            >
              <span>Explore All Books</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="books-grid">
            {featuredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSelectBook={onSelectBook}
                onBorrowToggle={onBorrowToggle}
                isBorrowed={borrowedBookIds.includes(book.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Decorative Vintage Bookplate Banner */}
      <section className="section-vintage-bookplate">
        <div className="container">
          <div className="bookplate-card">
            <div className="bookplate-border-decor">
              <div className="bookplate-corner top-left">❦</div>
              <div className="bookplate-corner top-right">❦</div>
              <div className="bookplate-corner bottom-left">❦</div>
              <div className="bookplate-corner bottom-right">❦</div>

              <div className="bookplate-content">
                <span className="bookplate-ex-libris">EX LIBRIS • PUBLICUM</span>
                <h3 className="bookplate-quote">
                  “A public library is the most democratic institution on earth — an open invitation to every seeking mind.”
                </h3>
                <p className="bookplate-sub">
                  Free library cards are available to all Mumbai residents, students, and educators across Maharashtra.
                </p>
                <div className="bookplate-actions">
                  <button
                    type="button"
                    className="bookplate-btn-primary"
                    onClick={() => onNavigate('explore')}
                  >
                    Browse the Stacks
                  </button>
                  <button
                    type="button"
                    className="bookplate-btn-secondary"
                    onClick={() => onNavigate('libraries')}
                  >
                    View 6 Local Branches &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
