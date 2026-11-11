import React, { useState } from 'react';
import { 
  BookOpen, 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';

export default function Footer({ onNavigate }) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="vintage-footer">
      {/* Newsletter Gazette Bar in Parchment / Forest Green */}
      <div className="footer-gazette-bar">
        <div className="container gazette-inner">
          <div className="gazette-text-block">
            <span className="gazette-eyebrow">Monthly Literary Dispatch</span>
            <h3 className="gazette-title">The LibraryEase Gazette</h3>
            <p className="gazette-sub">
              Curated book selections, author visits, and community literacy workshop dispatches.
            </p>
          </div>

          <div className="gazette-form-wrap">
            {subscribed ? (
              <div className="gazette-success-pill">
                <CheckCircle2 size={16} />
                <span>Thank you! You are subscribed to our monthly literary gazette.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="gazette-form">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="gazette-input"
                  required
                />
                <button type="submit" className="gazette-btn">
                  <span>Subscribe</span>
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="footer-main-links">
        <div className="container footer-grid">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-logo" onClick={() => onNavigate('home')}>
              <div className="footer-logo-icon">
                <BookOpen size={20} />
              </div>
              <div>
                <span className="footer-brand-title">LibraryEase</span>
                <span className="footer-brand-sub">Mumbai Public Libraries & Digital Archives</span>
              </div>
            </div>

            <p className="footer-tagline">
              Connecting readers to open literature, historical archives, and AI-assisted discovery. 
              Free, civic, and welcoming to all seekers of knowledge across Mumbai.
            </p>

            <div className="footer-contact-items">
              <div className="contact-item">
                <MapPin size={14} className="footer-icon-sage" />
                <span>David Sassoon Heritage Building, 152 M.G. Road, Fort, Mumbai, Maharashtra 400001, India</span>
              </div>
              <div className="contact-item">
                <Phone size={14} className="footer-icon-sage" />
                <span>+91 (022) 2284-3703 (Patron Inquiries)</span>
              </div>
              <div className="contact-item">
                <Mail size={14} className="footer-icon-sage" />
                <span>contact@libraryease.in</span>
              </div>
            </div>
          </div>

          {/* Quick Links: Stacks & Discovery */}
          <div className="footer-col">
            <h4 className="footer-col-title">Stacks & Discovery</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => onNavigate('explore')}>
                  Explore All Books
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('ai-assistant')}>
                  <span className="ai-footer-link-tag">AI</span> Book Assistant
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('explore')}>
                  Digital eBooks & Audio
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('explore')}>
                  Curated Staff Picks
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('services')}>
                  Inter-Library Loan (ILL)
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links: Branch Services */}
          <div className="footer-col">
            <h4 className="footer-col-title">Branch Amenities</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => onNavigate('libraries')}>
                  Find Local Branches
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('services')}>
                  Quiet Study Pods & Carrels
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('services')}>
                  Maker Space & 3D Lab
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('services')}>
                  Book A Librarian Consultation
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('about')}>
                  Library Trustees & Board
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links: Patron Portal */}
          <div className="footer-col">
            <h4 className="footer-col-title">Patron Portal</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => onNavigate('my-library')}>
                  Borrowing Dashboard
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('my-library')}>
                  Due-Date Reminders
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('feedback')}>
                  Share Patron Feedback
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('about')}>
                  Borrowing Policy & ₹0 Fines
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('about')}>
                  Accessibility Commitments
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Unverified Sample Data Disclaimer Bar */}
      <div className="footer-disclaimer-bar">
        <div className="container">
          <p className="disclaimer-text">
            <strong>Mumbai Public Library Network Notice:</strong> LibraryEase connects readers across 
            Mumbai municipal and heritage reading rooms, including Fort, Dadar, Bandra, and suburban civic centers, 
            blending vintage library preservation with modern AI services.
          </p>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="footer-bottom-bar">
        <div className="container bottom-bar-inner">
          <p className="copy-text">
            &copy; 2026 LibraryEase Mumbai Public Library System. All rights reserved.
          </p>
          <div className="footer-decor-tag">
            <span>Vintage Library + Modern AI Design System</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
