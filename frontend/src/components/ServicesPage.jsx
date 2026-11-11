import React from 'react';
import { 
  Tablet, 
  DoorClosed, 
  Cpu, 
  Compass, 
  Share2, 
  Users, 
  Check, 
  ArrowRight, 
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';
import { LIBRARY_SERVICES } from '../data/servicesData';

export default function ServicesPage({ onNavigateToExplore, onNavigateToAssistant, onShowToast }) {
  const iconMap = {
    Tablet: Tablet,
    DoorClosed: DoorClosed,
    Cpu: Cpu,
    Compass: Compass,
    Share2: Share2,
    Users: Users
  };

  const borrowingRules = [
    { label: 'Standard Loan Period', value: '21 Days for all physical books and audiobooks' },
    { label: 'Automatic Renewals', value: 'Up to 2 renewals (14 days each) if no holds pending' },
    { label: 'Fine-Free Policy', value: '₹0 overdue fines — removing civic barriers for all readers' },
    { label: 'Digital Checkouts', value: '10 simultaneous eBooks or audiobooks on Libby/Hoopla' },
    { label: 'Inter-Library Loan', value: 'Free delivery from over 40 partner state library archives' }
  ];

  return (
    <div className="services-page-view">
      {/* Header Band */}
      <section className="page-header-band">
        <div className="container">
          <span className="page-breadcrumb">Patron Resources &gt; Public Library Services</span>
          <h1 className="page-title">Services & Community Amenities</h1>
          <p className="page-description">
            Beyond physical books, LibraryEase provides state-of-the-art technological tools, 
            quiet collaborative study sanctuaries, 3D printing maker spaces, and personalized research consultations.
          </p>
        </div>
      </section>

      <div className="container main-services-container">
        {/* Core Services Grid */}
        <div className="services-cards-grid">
          {LIBRARY_SERVICES.map((srv) => {
            const IconComp = iconMap[srv.icon] || FileText;
            return (
              <div key={srv.id} className="service-detail-card">
                <div className="srv-card-top">
                  <div className="srv-icon-badge">
                    <IconComp size={22} />
                  </div>
                  <span className="srv-badge-tag">{srv.badge}</span>
                </div>

                <span className="srv-category-name">{srv.category}</span>
                <h3 className="srv-card-title">{srv.title}</h3>
                <p className="srv-short-desc">{srv.shortDesc}</p>

                <div className="srv-features-list">
                  <span className="srv-features-title">What is included:</span>
                  <ul>
                    {srv.details.map((detail, dIdx) => (
                      <li key={dIdx}>
                        <Check size={13} className="check-sage" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="srv-card-footer">
                  <button
                    type="button"
                    className="srv-action-btn"
                    onClick={() => {
                      if (srv.id === 'service-digital') {
                        onNavigateToExplore();
                      } else if (onShowToast) {
                        onShowToast(`Service Reservation: Booking for "${srv.title}" is simulated for demonstration.`);
                      }
                    }}
                  >
                    <span>{srv.actionText}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Borrowing Policies & Guidelines Table */}
        <div className="borrowing-policies-card">
          <div className="policies-header">
            <Clock size={20} className="policies-icon" />
            <div>
              <h3 className="policies-title">Public Borrowing Policies & Guidelines</h3>
              <p className="policies-sub">Transparent rules designed to ensure equitable access for all residents.</p>
            </div>
          </div>

          <div className="policies-table">
            {borrowingRules.map((rule, idx) => (
              <div key={idx} className="policy-row">
                <span className="policy-label">{rule.label}</span>
                <span className="policy-value">{rule.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Discovery Callout Banner with Dusty Lavender Accent */}
        <div className="services-help-banner">
          <div className="help-banner-text">
            <div className="lavender-sparkle-pill">
              <Sparkles size={18} />
            </div>
            <div>
              <strong>Looking for customized reading recommendations?</strong>
              <p>Try our rule-based AI Book Assistant to match titles against your reading preferences.</p>
            </div>
          </div>
          <button
            type="button"
            className="help-banner-btn"
            onClick={onNavigateToAssistant}
          >
            Launch Assistant &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
