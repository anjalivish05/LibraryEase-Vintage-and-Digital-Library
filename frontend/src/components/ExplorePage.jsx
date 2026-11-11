import React, { useState, useMemo } from 'react';
import { 
  Search, 
  RotateCcw, 
  BookOpen, 
  Sparkles,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import BookCard from './BookCard';
import { CATEGORIES } from '../data/booksData';

export default function ExplorePage({ 
  books, 
  onSelectBook, 
  onBorrowToggle, 
  borrowedBookIds, 
  initialSearch = '', 
  initialCategory = 'All Categories',
  onNavigateToAssistant
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  // Filter & Sort logic
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !query ||
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.category.toLowerCase().includes(query) ||
          book.isbn.toLowerCase().includes(query) ||
          book.description.toLowerCase().includes(query) ||
          (book.tags && book.tags.some((t) => t.toLowerCase().includes(query)));

        const matchesCategory =
          selectedCategory === 'All Categories' || book.category === selectedCategory;

        let matchesAvailability = true;
        if (availabilityFilter === 'shelf') {
          matchesAvailability = book.availability.includes('Available on Shelf');
        } else if (availabilityFilter === 'ebook') {
          matchesAvailability = book.availability.includes('eBook');
        } else if (availabilityFilter === 'loan') {
          matchesAvailability = book.availability.includes('Loan') || book.availability.includes('Reserved');
        }

        return matchesSearch && matchesCategory && matchesAvailability;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
        if (sortBy === 'year-desc') return b.year - a.year;
        if (sortBy === 'reviews') return b.reviewsCount - a.reviewsCount;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [books, searchTerm, selectedCategory, availabilityFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setAvailabilityFilter('All');
    setSortBy('featured');
  };

  return (
    <div className="explore-page-view">
      {/* Editorial Header */}
      <section className="page-header-band">
        <div className="container">
          <span className="page-breadcrumb">Catalogues & Archives &gt; Explore Books</span>
          <h1 className="page-title">Explore the Public Catalogue</h1>
          <p className="page-description">
            Search 48,000+ works spanning classical literature, ecological sciences, world history, 
            and modern philosophies. Available for shelf pickup or immediate digital lending.
          </p>
        </div>
      </section>

      <div className="container main-explore-container">
        {/* Modern Filter & Search Controls on Cream Card */}
        <div className="explore-controls-card">
          <div className="search-sort-bar">
            <div className="search-input-box">
              <Search size={18} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Search titles, authors, keywords, or ISBNs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="explore-search-input"
                aria-label="Search catalog"
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

            <div className="sort-input-box">
              <label htmlFor="sort-select" className="control-label">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="control-select"
              >
                <option value="featured">Featured Curations</option>
                <option value="rating">Highest Rated</option>
                <option value="title-asc">Title (A – Z)</option>
                <option value="year-desc">Publication Year</option>
                <option value="reviews">Patron Reviews</option>
              </select>
            </div>
          </div>

          {/* Category Pills (Uses restrained Dusty Lavender #C7B9D8 for selected categories) */}
          <div className="category-scroll-wrapper">
            <span className="filter-lead-label">Departments:</span>
            <div className="category-pills-list">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`category-pill-btn ${selectedCategory === cat ? 'active-lavender' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Availability Filter */}
          <div className="secondary-filter-bar">
            <div className="avail-filter-group" role="group" aria-label="Filter by availability">
              <span className="filter-group-label">Availability:</span>
              <button
                type="button"
                className={`avail-pill-btn ${availabilityFilter === 'All' ? 'active-forest' : ''}`}
                onClick={() => setAvailabilityFilter('All')}
              >
                All Volumes
              </button>
              <button
                type="button"
                className={`avail-pill-btn ${availabilityFilter === 'shelf' ? 'active-sage' : ''}`}
                onClick={() => setAvailabilityFilter('shelf')}
              >
                On Shelf (Branch)
              </button>
              <button
                type="button"
                className={`avail-pill-btn ${availabilityFilter === 'ebook' ? 'active-sage' : ''}`}
                onClick={() => setAvailabilityFilter('ebook')}
              >
                Digital eBook
              </button>
              <button
                type="button"
                className={`avail-pill-btn ${availabilityFilter === 'loan' ? 'active-amber' : ''}`}
                onClick={() => setAvailabilityFilter('loan')}
              >
                On Loan / Reserved
              </button>
            </div>

            <div className="results-count-box">
              <span>Showing <strong>{filteredBooks.length}</strong> of {books.length} titles</span>
              {(searchTerm || selectedCategory !== 'All Categories' || availabilityFilter !== 'All') && (
                <button
                  type="button"
                  className="reset-filters-link"
                  onClick={handleResetFilters}
                  title="Clear all active filters"
                >
                  <RotateCcw size={13} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AI Assistant Help Banner in Lavender Accents */}
        <div className="ai-discovery-banner-lavender">
          <div className="ai-banner-content">
            <div className="lavender-sparkle-circle">
              <Sparkles size={18} />
            </div>
            <div>
              <strong className="ai-banner-title">Need personalized recommendations from our librarian AI?</strong>
              <p className="ai-banner-sub">
                Tell our rule-based assistant your current reading mood, pace, and interests for curated title pairings.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="ai-banner-btn-lavender"
            onClick={onNavigateToAssistant}
          >
            Launch Assistant &rarr;
          </button>
        </div>

        {/* Books Grid on Antique Cream */}
        {filteredBooks.length > 0 ? (
          <div className="books-grid">
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
          <div className="empty-catalog-state">
            <div className="empty-icon-wrap">
              <BookOpen size={36} />
            </div>
            <h3 className="empty-title">No volumes matched your criteria</h3>
            <p className="empty-desc">
              We could not find any titles matching "{searchTerm}" in department "{selectedCategory}". 
              Try checking your spelling or selecting 'All Categories'.
            </p>
            <button
              type="button"
              className="empty-reset-btn"
              onClick={handleResetFilters}
            >
              <RotateCcw size={15} />
              <span>Show All Available Books</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
