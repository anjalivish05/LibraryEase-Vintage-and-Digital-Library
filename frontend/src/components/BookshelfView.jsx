import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Bookmark, 
  Library
} from 'lucide-react';
import './BookshelfView.css';

// Pre-defined spine color themes matching the heritage library design
const SPINE_COLORS = [
  'color-burgundy',
  'color-emerald',
  'color-navy',
  'color-parchment',
  'color-plum',
  'color-caramel',
  'color-teal'
];

export default function BookshelfView({
  books,
  onSelectBook,
  onBorrowToggle,
  borrowedBookIds = [],
  searchTerm = '',
  selectedCategory = 'All Categories'
}) {
  const [pulledBookId, setPulledBookId] = useState(null);

  // Group books by Stack Tiers
  const shelfStacks = [
    {
      id: 'stack-a',
      tag: 'STACK A • CLASSICAL LITERATURE & FICTION',
      categories: ['Fiction', 'Classical Literature', 'Literature & Fiction'],
      books: books.filter(b => ['Fiction', 'Classical Literature', 'Literature & Fiction'].some(c => b.category?.includes(c) || b.genre?.includes(c)))
    },
    {
      id: 'stack-b',
      tag: 'STACK B • NATURAL SCIENCES, ECOLOGY & TECH',
      categories: ['Science', 'Technology', 'Science & Technology', 'Science & Nature'],
      books: books.filter(b => ['Science', 'Technology', 'Nature', 'Ecology'].some(c => b.category?.includes(c)))
    },
    {
      id: 'stack-c',
      tag: 'STACK C • HISTORY, PHILOSOPHY & BIOGRAPHY',
      categories: ['History', 'Philosophy', 'Biography', 'History & Society', 'Personal Development'],
      books: books.filter(b => !['Fiction', 'Classical Literature', 'Literature & Fiction', 'Science', 'Technology', 'Science & Technology', 'Science & Nature'].some(c => b.category?.includes(c)))
    }
  ];

  // Helper to determine book dimensions deterministically based on book id
  const getBookDimensions = (book) => {
    const id = Number(String(book.id).replace(/\D/g, '')) || 1;
    // Heights between 195px and 240px
    const heights = [205, 220, 235, 212, 238, 198, 225, 232];
    // Widths between 36px and 48px
    const widths = [38, 44, 40, 48, 36, 42, 46];
    
    const height = heights[id % heights.length];
    const width = widths[id % widths.length];
    const colorClass = SPINE_COLORS[id % SPINE_COLORS.length];

    return { height, width, colorClass };
  };

  const isBookMatchingSearch = (book) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      (book.isbn && book.isbn.toLowerCase().includes(query)) ||
      (book.category && book.category.toLowerCase().includes(query)) ||
      (book.shelfLocation && book.shelfLocation.toLowerCase().includes(query)) ||
      (book.shelf_location && book.shelf_location.toLowerCase().includes(query))
    );
  };

  return (
    <div className="bookshelf-experience-container">
      <div className="bookshelf-room-backdrop">
        {/* Bookshelf Crown Header */}
        <div className="bookshelf-crown-header">
          <div className="bookshelf-title-wrap">
            <div className="bookshelf-crest-emblem">
              <Library size={22} />
            </div>
            <div>
              <h2 className="bookshelf-heading">The Grand Reading Stacks</h2>
              <p className="bookshelf-subheading">EST. 1898 • PHYSICAL CATALOGUE NAVIGATION</p>
            </div>
          </div>

          <div className="bookshelf-hint-pill">
            <Sparkles size={14} className="hint-sparkle" />
            <span>Hover or click any spine to pull the volume from the shelf</span>
          </div>
        </div>

        {/* Render Shelves */}
        {shelfStacks.map((stack) => {
          // Filter books based on search or category
          let displayBooks = stack.books;
          if (selectedCategory !== 'All Categories') {
            displayBooks = stack.books.filter(b => b.category === selectedCategory || b.category?.includes(selectedCategory));
          }

          if (displayBooks.length === 0) return null;

          return (
            <div key={stack.id} className="shelf-tier">
              {/* Brass Nameplate Plaque */}
              <div className="shelf-brass-plaque-wrap">
                <div className="shelf-brass-plaque">
                  <span className="plaque-screw" />
                  <span className="plaque-text">{stack.tag}</span>
                  <span className="plaque-count">{displayBooks.length} VOLS</span>
                  <span className="plaque-screw" />
                </div>
              </div>

              {/* Row of Books on Shelf */}
              <div className="shelf-books-row">
                <div className="shelf-bookend left" />

                {displayBooks.map((book, bookIdx) => {
                  const { height, width, colorClass } = getBookDimensions(book);
                  const isPulled = pulledBookId === book.id;
                  const isMatch = isBookMatchingSearch(book);
                  const isBorrowed = borrowedBookIds.includes(book.id);
                  const isNearLeftEdge = bookIdx < 2;
                  const isNearRightEdge = bookIdx >= displayBooks.length - 2;

                  return (
                    <div
                      key={book.id}
                      className={`physical-book-spine ${colorClass} ${isPulled ? 'is-pulled' : ''} ${!isMatch && searchTerm ? 'is-dimmed' : ''} ${isMatch && searchTerm ? 'is-highlighted' : ''}`}
                      style={{
                        width: `${width}px`,
                        height: `${height}px`
                      }}
                      onMouseEnter={() => setPulledBookId(book.id)}
                      onMouseLeave={() => setPulledBookId(null)}
                      onClick={() => onSelectBook(book)}
                      title={`"${book.title}" by ${book.author}`}
                    >
                      <div className="spine-top-pages" />
                      
                      <div className="spine-outer-wrap">
                        {/* Gold Foil Ribs Top */}
                        <div className="spine-gold-ribs-top">
                          <span className="spine-rib-line" />
                          <span className="spine-rib-line" />
                        </div>

                        {/* Gold Embossed Vertical Title */}
                        <div className="spine-title-container">
                          <span className="spine-vertical-title">{book.title}</span>
                        </div>

                        {/* Shelf Callout Author Code */}
                        <div className="spine-author-code">
                          {book.author ? book.author.split(' ').pop().slice(0, 4).toUpperCase() : 'LIB'}
                        </div>

                        {/* Gold Foil Ribs Bottom */}
                        <div className="spine-gold-ribs-bottom">
                          <span className="spine-rib-line" />
                          <span className="spine-rib-line" />
                        </div>
                      </div>

                      {/* Translucent Callout Preview Card */}
                      {isPulled && (
                        <div 
                          className={`shelf-callout-card ${isNearLeftEdge ? 'align-left-edge' : ''} ${isNearRightEdge ? 'align-right-edge' : ''}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="shelf-callout-caret" />
                          
                          <h4 className="callout-title">{book.title}</h4>
                          <p className="callout-author">By {book.author} ({book.year || 'Heritage Edition'})</p>

                          <div className="callout-badge-row">
                            <span className="callout-avail-badge">
                              {book.available_copies !== undefined 
                                ? `${book.available_copies} Available` 
                                : (book.copiesAvailable !== undefined ? `${book.copiesAvailable} Available` : (book.availability || 'Available'))}
                            </span>
                            <span className="callout-shelf-loc">
                              {book.shelfLocation || book.shelf_location || 'Stacks Section A'}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="callout-pull-btn"
                            onClick={() => onBorrowToggle(book.id)}
                          >
                            <Bookmark size={13} />
                            <span>{isBorrowed ? 'Return Book' : 'Pull From Shelf (Borrow)'}</span>
                          </button>

                          <button
                            type="button"
                            className="callout-preview-link"
                            onClick={() => onSelectBook(book)}
                          >
                            Inspect Full Volume Details &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="shelf-bookend right" />
              </div>

              {/* Polished Mahogany Wooden Plank */}
              <div className="shelf-wooden-plank" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
