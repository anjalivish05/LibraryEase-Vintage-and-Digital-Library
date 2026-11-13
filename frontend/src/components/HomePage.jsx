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

          {/* Featured Heritage Library Card — The Asiatic Society of Mumbai */}
          <div className="hero-visual-side">
            <div className="vintage-illustration-card hero-featured-library-card">
              <div className="illustration-inner-frame">
                {/* AI-Generated Architectural Illustration Media */}
                <div className="hero-library-media">
                  <img
                    src="/images/libraries/asiatic-society.jpg"
                    alt="The Asiatic Society of Mumbai"
                    className="hero-library-img"
                  />
                  <div className="hero-media-overlay" />
                  <span className="hero-badge-illustrative">
                    <Sparkles size={11} className="badge-sparkle-icon" />
                    <span>AI-Generated Illustration</span>
                  </span>
                </div>

                {/* Library Card Information */}
                <div className="hero-library-caption">
                  <div className="hero-library-title-row">
                    <span className="hero-branch-dot" />
                    <h3 className="hero-library-name">The Asiatic Society of Mumbai</h3>
                  </div>
                  <div className="hero-library-subtitle">
                    <MapPin size={13} className="hero-subtitle-pin" />
                    <span>Town Hall • Fort, Mumbai</span>
                  </div>
                  <p className="hero-library-desc">
                    Historic Heritage Library • Literary Collections & Research
                  </p>
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
