import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  ArrowRight
} from 'lucide-react';
import { ABOUT_INFO } from '../data/servicesData';

export default function AboutPage({ onNavigateToExplore, onNavigateToLibraries }) {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'Who is eligible for a free LibraryEase card?',
      a: 'Any resident or student residing in Mumbai or across Maharashtra is eligible for a full-privilege LibraryEase digital card. Children under 16 can obtain a youth card with parent or guardian co-signature.'
    },
    {
      q: 'Are there fines for overdue books?',
      a: 'No! In 2024, our library board voted unanimously to eliminate overdue daily fines. While we ask patrons to return items promptly so neighbors can read them, you will never be charged punitive fines.'
    },
    {
      q: 'How many books and digital media can I borrow at once?',
      a: 'Patrons can check out up to 30 physical books simultaneously and up to 10 digital items (eBooks, audiobooks, and streaming videos) through our cloud portal.'
    },
    {
      q: 'Can I return books to any branch?',
      a: 'Yes. Books borrowed from participating Mumbai branches can be returned to any participating branch or designated return counter across the city.'
    },
    {
      q: 'How does the AI Book Assistant work?',
      a: 'Our smart discovery tool operates transparently using a rule-based heuristic matcher on our verified local catalogue. It evaluates your selected moods, reading pace, and keywords without sending data to external ad networks.'
    }
  ];

  const trustees = [
    { name: 'Dr. Evelyn Martinez', role: 'Executive Library Director', bio: 'Doctorate in Information Science; champion of civic digital equality and archival preservation.' },
    { name: 'Hon. Marcus Sterling', role: 'President, Library Board of Trustees', bio: 'Former municipal judge and lifelong advocate for free public literacy across all communities.' },
    { name: 'Soraya Chen, AIA', role: 'Director of Facilities & Architecture', bio: 'Oversees historic Carnegie reading room restorations and sustainable public spaces.' }
  ];

  return (
    <div className="about-page-view">
      {/* Header Band */}
      <section className="page-header-band">
        <div className="container">
          <span className="page-breadcrumb">Our Mission & Community &gt; About LibraryEase</span>
          <h1 className="page-title">About LibraryEase Public Library</h1>
          <p className="page-description">
            Connecting readers of all generations to world-class literature, credible knowledge, 
            and civic spaces of quiet contemplation and shared learning since 1898.
          </p>
        </div>
      </section>

      <div className="container main-about-container">
        {/* Story Section */}
        <div className="about-story-section">
          <div className="story-text-col">
            <span className="story-tag">Our History & Legacy</span>
            <h2 className="story-heading">From Historic Reading Rooms to Digital Sanctuaries</h2>
            <p className="story-p">
              Originally established in 1898 through a philanthropic grant and expanded across 
              generations, LibraryEase has evolved from traditional mahogany book stacks into a 
              vibrant metropolitan learning ecosystem.
            </p>
            <p className="story-p">
              Today, LibraryEase bridges heritage manuscript archives with modern digital lending, 
              interactive discovery tools, and community innovation labs. We believe that curiosity 
              is every citizen’s birthright and that public libraries are the democratic heart of 
              every thriving neighborhood.
            </p>

            <div className="story-highlights-grid">
              <div className="highlight-item">
                <span className="highlight-num">1898</span>
                <span className="highlight-desc">First Branch Opened</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-num">48,500+</span>
                <span className="highlight-desc">Catalogued Works</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-num">6</span>
                <span className="highlight-desc">Neighborhood Hubs</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-num">100%</span>
                <span className="highlight-desc">Free Civic Access</span>
              </div>
            </div>
          </div>

          <div className="story-card-col">
            <div className="mission-statement-card">
              <div className="mission-card-badge">Our Guiding Mission</div>
              <blockquote className="mission-quote">
                "{ABOUT_INFO.mission}"
              </blockquote>
              <div className="mission-footer-row">
                <BookOpen size={18} className="mission-book-icon" />
                <span>The Board of Library Trustees</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values / Pillars */}
        <div className="about-values-section">
          <div className="values-header">
            <span className="section-eyebrow">Our Principles</span>
            <h2 className="section-heading">Core Values That Guide Us</h2>
            <p className="section-subtext">Four fundamental pillars anchor every acquisition, service, and program we provide.</p>
          </div>

          <div className="values-grid">
            {ABOUT_INFO.values.map((val, idx) => (
              <div key={idx} className="value-pillar-card">
                <div className="pillar-num">0{idx + 1}</div>
                <h3 className="pillar-title">{val.title}</h3>
                <p className="pillar-desc">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Board of Trustees */}
        <div className="trustees-section">
          <div className="values-header">
            <span className="section-eyebrow">Governance & Stewardship</span>
            <h2 className="section-heading">Executive Leadership & Board</h2>
            <p className="section-subtext">Dedicated public servants safeguarding literacy, preservation, and community enrichment.</p>
          </div>

          <div className="trustees-grid">
            {trustees.map((t, idx) => (
              <div key={idx} className="trustee-card">
                <div className="trustee-avatar-circle">
                  <Users size={22} />
                </div>
                <h4 className="trustee-name">{t.name}</h4>
                <span className="trustee-role">{t.role}</span>
                <p className="trustee-bio">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="about-faq-section">
          <div className="values-header">
            <span className="section-eyebrow">Patron Inquiries</span>
            <h2 className="section-heading">Frequently Asked Questions</h2>
            <p className="section-subtext">Learn more about card eligibility, loan periods, and public privileges.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`faq-item ${openFaq === idx ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  aria-expanded={openFaq === idx}
                >
                  <span className="faq-question-text">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                </button>
                {openFaq === idx && (
                  <div className="faq-answer-panel">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="about-cta-footer">
          <button
            type="button"
            className="about-btn-primary"
            onClick={onNavigateToExplore}
          >
            <span>Explore the Catalogue</span>
            <BookOpen size={15} />
          </button>
          <button
            type="button"
            className="about-btn-secondary"
            onClick={onNavigateToLibraries}
          >
            <span>Find Nearest Branch</span>
            <Compass size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
