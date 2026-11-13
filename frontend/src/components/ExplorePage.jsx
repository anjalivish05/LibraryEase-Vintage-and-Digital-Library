import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  ChevronDown,
  CheckCircle2,
  Bookmark,
  Library,
  SlidersHorizontal,
  LayoutGrid,
  ArrowRight
} from 'lucide-react';
import BookCard from './BookCard';
import BookshelfView from './BookshelfView';
import { CATEGORIES } from '../data/booksData';
import './ExplorePage.css';

export default function ExplorePage({ 
  books = [], 
  onSelectBook, 
  onBorrowToggle, 
  borrowedBookIds = [], 
  initialSearch = '', 
  initialCategory = 'All Categories',
  onNavigateToAssistant
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [activeQuickFilter, setActiveQuickFilter] = useState('all'); // 'all' | 'available' | 'fiction' | 'non-fiction' | 'classic'
  const [sortBy, setSortBy] = useState('featured');
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  
  // Responsive mode detection: Desktop/Tablet = Bookshelf by default; Mobile = Card grid
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState('shelf'); // 'shelf' | 'grid'

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode('grid');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Quick filter toggle handler
  const handleQuickFilterClick = (filterKey) => {
    if (activeQuickFilter === filterKey) {
      setActiveQuickFilter('all');
    } else {
      setActiveQuickFilter(filterKey);
    }
  };

  // Reset all active filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setActiveQuickFilter('all');
    setSortBy('featured');
  };

  // Filtering and sorting logic
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // 1. Search filter: title, author, ISBN, category, tags
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !query ||
          (book.title && book.title.toLowerCase().includes(query)) ||
          (book.author && book.author.toLowerCase().includes(query)) ||
          (book.isbn && book.isbn.toLowerCase().includes(query)) ||
          (book.category && book.category.toLowerCase().includes(query)) ||
          (book.description && book.description.toLowerCase().includes(query)) ||
          (book.tags && book.tags.some((t) => t.toLowerCase().includes(query)));

        // 2. Category Dropdown filter
        const matchesCategory =
          selectedCategory === 'All Categories' || 
          book.category === selectedCategory ||
          (book.category && book.category.includes(selectedCategory));

        // 3. Horizontal Quick Filter Buttons
        let matchesQuick = true;
        if (activeQuickFilter === 'available') {
          matchesQuick = 
            (book.available_copies !== undefined && book.available_copies > 0) ||
            (book.copiesAvailable !== undefined && book.copiesAvailable > 0) ||
            (book.availability && book.availability.toLowerCase().includes('available'));
        } else if (activeQuickFilter === 'fiction') {
          matchesQuick = 
            (book.category && book.category.toLowerCase().includes('fiction')) ||
            (book.genre && book.genre.toLowerCase().includes('fiction'));
        } else if (activeQuickFilter === 'non-fiction') {
          const isFiction = (book.category && book.category.toLowerCase().includes('fiction')) ||
                            (book.genre && book.genre.toLowerCase().includes('fiction'));
          matchesQuick = !isFiction || 
                         (book.category && (book.category.includes('Science') || book.category.includes('History') || book.category.includes('Nature') || book.category.includes('Society') || book.category.includes('Development')));
        } else if (activeQuickFilter === 'classic') {
          matchesQuick = 
            (book.genre && book.genre.toLowerCase().includes('classic')) ||
            (book.badge && book.badge.toLowerCase().includes('classic')) ||
            (book.tags && book.tags.some(t => t.toLowerCase().includes('classic'))) ||
            (book.year && book.year < 1980);
        }

        return matchesSearch && matchesCategory && matchesQuick;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
        if (sortBy === 'year-desc') return (b.year || 0) - (a.year || 0);
        if (sortBy === 'reviews') return (b.reviewsCount || 0) - (a.reviewsCount || 0);
        return ((b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      });
  }, [books, searchTerm, selectedCategory, activeQuickFilter, sortBy]);

  return (
    <div className="explore-page-view">
      <div className="explore-container">
        {/* ------------------------------------------------------------------
            1. SEARCH SECTION
            ------------------------------------------------------------------ */}
        <section className="explore-search-section">
          <div className="explore-search-header">
            <h1 className="explore-main-heading">Search for Books</h1>
            <p className="explore-main-subtitle">Find your next favorite read...</p>
          </div>

          <div className="explore-search-bar-wrap">
            {/* Search Input Box (Title, Author, ISBN) */}
            <div className="search-input-field">
              <Search size={18} className="search-field-icon" />
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="explore-search-input"
                aria-label="Search catalog by title, author, or ISBN"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search input"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="search-category-dropdown">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-dropdown-select"
                aria-label="Filter by Category"
              >
                {CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown size={14} className="dropdown-arrow-icon" />
            </div>

            {/* Forest-Green Search Button */}
            <button
              type="button"
              className="explore-search-action-btn"
              onClick={() => {
                // Focus / trigger view update
                window.scrollTo({ top: 320, behavior: 'smooth' });
              }}
              aria-label="Execute search"
            >
              <Search size={16} />
              <span>Search</span>
            </button>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            2. FILTER SECTION (Horizontal Filters)
            ------------------------------------------------------------------ */}
        <section className="explore-quick-filters-section">
          <div className="quick-filters-row">
            {/* Available Only */}
            <button
              type="button"
              className={`quick-filter-btn ${activeQuickFilter === 'available' ? 'active' : ''}`}
              onClick={() => handleQuickFilterClick('available')}
            >
              <CheckCircle2 size={14} />
              <span>Available Only</span>
            </button>

            {/* Fiction */}
            <button
              type="button"
              className={`quick-filter-btn ${activeQuickFilter === 'fiction' ? 'active' : ''}`}
              onClick={() => handleQuickFilterClick('fiction')}
            >
              <BookOpen size={14} />
              <span>Fiction</span>
            </button>

            {/* Non-Fiction */}
            <button
              type="button"
              className={`quick-filter-btn ${activeQuickFilter === 'non-fiction' ? 'active' : ''}`}
              onClick={() => handleQuickFilterClick('non-fiction')}
            >
              <Library size={14} />
              <span>Non-Fiction</span>
            </button>

            {/* Classic */}
            <button
              type="button"
              className={`quick-filter-btn ${activeQuickFilter === 'classic' ? 'active' : ''}`}
              onClick={() => handleQuickFilterClick('classic')}
            >
              <Bookmark size={14} />
              <span>Classic</span>
            </button>

            {/* More Filters Toggle */}
            <button
              type="button"
              className={`quick-filter-btn more-filters-btn ${moreFiltersOpen ? 'active' : ''}`}
              onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
            >
              <SlidersHorizontal size={14} />
              <span>More Filters</span>
              <ChevronDown size={13} style={{ transform: moreFiltersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>

            {/* Reset Filters Link */}
            {(searchTerm || selectedCategory !== 'All Categories' || activeQuickFilter !== 'all' || sortBy !== 'featured') && (
              <button
                type="button"
                className="quick-reset-btn"
                onClick={handleResetFilters}
                title="Clear all active filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}

            {/* Results Count Pill */}
            <div className="quick-results-pill">
              <span><strong>{filteredBooks.length}</strong> {filteredBooks.length === 1 ? 'title' : 'titles'} found</span>
            </div>
          </div>

          {/* More Filters Expandable Drawer */}
          {moreFiltersOpen && (
            <div className="more-filters-drawer">
              <div className="more-filters-header">
                <span>Filter by Specialized Department</span>
                <span style={{ fontSize: '0.75rem', color: '#726A5F' }}>Select any department tag</span>
              </div>

              <div className="category-tags-grid">
                {CATEGORIES.map((cat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`category-tag-chip ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="more-filters-sort-row">
                <span style={{ fontWeight: 600, color: '#2B1E1A' }}>Sort catalog order:</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: '1px solid #B6A89C',
                      background: '#F8F2EA',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#2B1E1A',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="featured">Featured Curations</option>
                    <option value="rating">Highest Rated</option>
                    <option value="title-asc">Title (A – Z)</option>
                    <option value="year-desc">Publication Year</option>
                    <option value="reviews">Patron Reviews</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ------------------------------------------------------------------
            3. AI RECOMMENDATION BANNER (Dusty Lavender)
            ------------------------------------------------------------------ */}
        <section className="explore-ai-recommendation-banner">
          <div className="ai-banner-left">
            <div className="ai-banner-icon-circle">
              <Sparkles size={20} className="ai-banner-sparkle" />
            </div>
            <div className="ai-banner-text-block">
              <h3 className="ai-banner-heading">Need personalized recommendations from our librarian AI?</h3>
              <p className="ai-banner-subtitle">
                Tell our rule-based assistant your current reading mood, pace, and interests for curated title pairings.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="ai-banner-launch-btn"
            onClick={onNavigateToAssistant}
          >
            <span>Launch Assistant</span>
            <ArrowRight size={15} />
          </button>
        </section>

        {/* ------------------------------------------------------------------
            4. GRAND READING STACKS & CATALOG VIEW
            ------------------------------------------------------------------ */}
        <section className="explore-catalog-section">
          {/* Header Bar with View Switcher (Desktop & Tablet) */}
          <div className="explore-catalog-header-bar">
            <div className="catalog-section-badge">
              <Library size={15} />
              <span>Library Ease Physical Stacks &amp; Digital Lending</span>
            </div>

            {/* Desktop Switcher: Bookshelves vs Card Grid */}
            {!isMobile && (
              <div className="view-mode-toggle-group">
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === 'shelf' ? 'active' : ''}`}
                  onClick={() => setViewMode('shelf')}
                  title="Browse Realistic Wooden Bookshelves"
                >
                  <Library size={13} />
                  <span>Bookshelves</span>
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Browse Catalog Cards Grid"
                >
                  <LayoutGrid size={13} />
                  <span>Card Grid</span>
                </button>
              </div>
            )}
          </div>

          {/* Catalog Content: Bookshelf View or Card Grid */}
          {filteredBooks.length > 0 ? (
            isMobile || viewMode === 'grid' ? (
              <div className="mobile-book-cards-grid">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onSelectBook={onSelectBook}
                    onBorrowToggle={onBorrowToggle}
                    isBorrowed={borrowedBookIds.includes(book.id)}
                  />
                ))}
              </div>
            ) : (
              <BookshelfView
                books={filteredBooks}
                onSelectBook={onSelectBook}
                onBorrowToggle={onBorrowToggle}
                borrowedBookIds={borrowedBookIds}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
              />
            )
          ) : (
            <div className="empty-catalog-box">
              <div className="empty-catalog-icon-wrap">
                <BookOpen size={36} />
              </div>
              <h3 className="empty-catalog-title">No volumes matched your criteria</h3>
              <p className="empty-catalog-desc">
                We could not find any titles matching &ldquo;{searchTerm || activeQuickFilter}&rdquo; in department &ldquo;{selectedCategory}&rdquo;.
              </p>
              <button
                type="button"
                className="explore-search-action-btn"
                style={{ margin: '0 auto' }}
                onClick={handleResetFilters}
              >
                <RotateCcw size={15} />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
