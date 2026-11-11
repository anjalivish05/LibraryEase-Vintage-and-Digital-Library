import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  User, 
  AlertTriangle, 
  Search, 
  Check, 
  Compass, 
  Navigation, 
  ExternalLink, 
  Map as MapIcon, 
  Grid, 
  Info,
  Plus,
  Minus,
  RotateCcw,
  ShieldCheck,
  Building,
  Award,
  Globe,
  Train
} from 'lucide-react';
import { 
  MUMBAI_LIBRARIES, 
  MUMBAI_LOCALITIES, 
  MUMBAI_FACILITIES, 
  BRANCH_POSITIONS 
} from '../data/librariesData';
import { api } from '../services/api';

export default function LibrariesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('All Localities');
  const [selectedAmenity, setSelectedAmenity] = useState('All Facilities');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [activeBranchId, setActiveBranchId] = useState('mumbai-lib-1');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [zoomScale, setZoomScale] = useState(1);
  const [librariesList, setLibrariesList] = useState(MUMBAI_LIBRARIES);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);

  // Fetch verified libraries from backend /api/libraries
  useEffect(() => {
    let isMounted = true;
    const fetchLibrariesFromBackend = async () => {
      try {
        setIsLoadingBackend(true);
        const data = await api.libraries.getAll();
        if (isMounted && data?.libraries && data.libraries.length > 0) {
          setLibrariesList(data.libraries);
        }
      } catch (err) {
        // Fall back gracefully to local MUMBAI_LIBRARIES data
      } finally {
        if (isMounted) setIsLoadingBackend(false);
      }
    };

    fetchLibrariesFromBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLibraries = useMemo(() => {
    return librariesList.filter((lib) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lib.name.toLowerCase().includes(q) ||
        lib.area.toLowerCase().includes(q) ||
        lib.locality.toLowerCase().includes(q) ||
        lib.address.toLowerCase().includes(q) ||
        (lib.pincode && lib.pincode.includes(q)) ||
        lib.services.some((s) => s.toLowerCase().includes(q));

      const matchesLocality =
        selectedLocality === 'All Localities' ||
        lib.area.toLowerCase().includes(selectedLocality.toLowerCase().split('/')[0].trim()) ||
        lib.locality.toLowerCase().includes(selectedLocality.toLowerCase().split('/')[0].trim());

      const matchesAmenity =
        selectedAmenity === 'All Facilities' ||
        lib.services.some((s) => s.toLowerCase().includes(selectedAmenity.toLowerCase()));

      const matchesVerified = !verifiedOnly || lib.isVerified === true;

      return matchesSearch && matchesLocality && matchesAmenity && matchesVerified;
    });
  }, [searchQuery, selectedLocality, selectedAmenity, verifiedOnly, librariesList]);

  const activeBranch = useMemo(() => {
    return (
      librariesList.find((b) => b.id === activeBranchId) ||
      filteredLibraries[0] ||
      librariesList[0]
    );
  }, [activeBranchId, librariesList, filteredLibraries]);

  const activeBranchPin = BRANCH_POSITIONS[activeBranch?.id] || { top: '88%', left: '46%' };

  const getMapLink = (lib) => {
    if (lib.coordinates?.lat && lib.coordinates?.lng) {
      return `https://www.google.com/maps/search/?api=1&query=${lib.coordinates.lat},${lib.coordinates.lng}`;
    }
    const query = lib.mapSearchQuery || `${lib.name}, ${lib.address}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(1.6, Number((prev + 0.2).toFixed(1))));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(0.85, Number((prev - 0.2).toFixed(1))));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
  };

  const handleSelectBranch = (id) => {
    setActiveBranchId(id);
  };

  const handleCardViewOnMap = (id) => {
    setActiveBranchId(id);
    setViewMode('map');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedLocality('All Localities');
    setSelectedAmenity('All Facilities');
    setVerifiedOnly(false);
  };

  return (
    <div className="libraries-page-view">
      {/* Header Band — Indian Editorial Aesthetics */}
      <section className="page-header-band">
        <div className="container">
          <div className="location-pill-badge">
            <MapPin size={13} />
            <span>Mumbai, Maharashtra, India</span>
          </div>
          <span className="page-breadcrumb">Libraries & Reading Rooms &gt; Mumbai Directory</span>
          <h1 className="page-title">Discover Libraries Near You</h1>
          <p className="page-description">
            Explore libraries and reading spaces across Mumbai, discover local collections, and find a place to read, learn, and study.
          </p>
        </div>
      </section>

      <div className="container main-libraries-container">
        {/* Verification and Authenticity Context Banner */}
        <div className="unverified-data-banner mumbai-banner" role="region" aria-label="Mumbai Library Verification Notice">
          <div className="unverified-banner-icon">
            <ShieldCheck size={24} className="shield-icon-sage" />
          </div>
          <div className="unverified-banner-text">
            <h4 className="unverified-title">
              Curated Directory of Mumbai Public Libraries & Heritage Archives
            </h4>
            <p className="unverified-desc">
              Featured institutions including the <strong>David Sassoon Library (Fort)</strong>, 
              <strong> The Asiatic Society of Mumbai (Town Hall)</strong>, 
              <strong> Mumbai Marathi Grantha Sangrahalaya (Dadar)</strong>, 
              <strong> The J. N. Petit Institute (Fort)</strong>, and 
              <strong> People's Free Reading Room (Marine Lines)</strong> are verified historical and civic public institutions. 
              Suburban student study halls and demonstrative reading spaces are distinctly labelled to assist scholars and readers.
            </p>
          </div>
        </div>

        {/* Filter & View Mode Bar */}
        <div className="libraries-filter-card">
          <div className="lib-top-controls-row">
            {/* Search Input with Mumbai Context */}
            <div className="lib-search-input-wrap">
              <Search size={18} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Search by library name or Mumbai locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="lib-search-input"
                aria-label="Search by library name or Mumbai locality"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                >
                  &times;
                </button>
              )}
            </div>

            {/* View Switcher Toggle (Preserved responsive layout) */}
            <div className="lib-view-toggle" role="tablist" aria-label="Branch view mode">
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'grid'}
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Branch Cards View"
              >
                <Grid size={15} />
                <span>Branch Cards</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'map'}
                className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
                title="Interactive Map View"
              >
                <MapIcon size={15} />
                <span>Interactive Map</span>
              </button>
            </div>
          </div>

          {/* Mumbai Locality Filter Pills */}
          <div className="amenity-filter-group">
            <span className="amenity-label">Mumbai Area / Locality:</span>
            <div className="amenity-pills-list">
              {MUMBAI_LOCALITIES.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`amenity-pill ${selectedLocality === loc ? 'active-forest' : ''}`}
                  onClick={() => setSelectedLocality(loc)}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Facilities Filter & Verified Toggle */}
          <div className="amenity-filter-group secondary-filters-row">
            <span className="amenity-label">Services & Facilities:</span>
            <div className="amenity-pills-list">
              {MUMBAI_FACILITIES.map((facility, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`amenity-pill ${selectedAmenity === facility ? 'active-forest' : ''}`}
                  onClick={() => setSelectedAmenity(facility)}
                >
                  {facility}
                </button>
              ))}
              <button
                type="button"
                className={`amenity-pill filter-verified-pill ${verifiedOnly ? 'active-forest' : ''}`}
                onClick={() => setVerifiedOnly(!verifiedOnly)}
              >
                {verifiedOnly ? '✓ Verified Institutions Only' : 'Show Verified Only'}
              </button>
            </div>
          </div>

          {/* Search Result Feedback Bar */}
          <div className="results-summary-strip">
            <span className="results-count-text">
              Showing <strong>{filteredLibraries.length}</strong> of {librariesList.length} libraries across Mumbai, Maharashtra, India
            </span>
            {(searchQuery || selectedLocality !== 'All Localities' || selectedAmenity !== 'All Facilities' || verifiedOnly) && (
              <button
                type="button"
                className="results-clear-link"
                onClick={handleResetAllFilters}
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* View Mode 1: Interactive Mumbai Cartographic Map */}
        {viewMode === 'map' && (
          <div className="interactive-map-layout">
            <div className="interactive-map-visual">
              {/* Zoom Controls */}
              <div className="map-zoom-controls" aria-label="Mumbai Map Navigation Controls">
                <button
                  type="button"
                  className="map-zoom-btn"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <Plus size={15} />
                </button>
                <button
                  type="button"
                  className="map-zoom-btn"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <Minus size={15} />
                </button>
                <button
                  type="button"
                  className="map-zoom-btn"
                  onClick={handleResetZoom}
                  title="Fit All Mumbai Libraries"
                  aria-label="Fit All Mumbai Libraries"
                >
                  <RotateCcw size={13} />
                </button>
              </div>

              <div className="map-canvas-mockup mumbai-cartography">
                {/* Transform Layer for Zoom & Pan */}
                <div
                  className="map-transform-layer"
                  style={{
                    transform: `scale(${zoomScale})`,
                    transformOrigin: `${activeBranchPin.left} ${activeBranchPin.top}`
                  }}
                >
                  {/* Vintage Cartographic Grid */}
                  <div className="map-grid-lines" />
                  
                  {/* Compass Rose */}
                  <div className="map-compass-rose" aria-hidden="true">
                    <Compass size={38} />
                  </div>

                  {/* Mumbai Coastline, Arabian Sea, Harbour & Arterials SVG */}
                  <svg className="map-vector-overlay" viewBox="0 0 600 520" preserveAspectRatio="none">
                    <defs>
                      <pattern id="seaPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 0,10 Q 5,6 10,10 T 20,10" fill="none" stroke="#D3E0D2" strokeWidth="1" opacity="0.6" />
                      </pattern>
                      <linearGradient id="arabianSeaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#EAF1E9" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#F5EBDD" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="harbourGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#E8EEEC" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#F5EBDD" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Arabian Sea Water Body on West (Left) */}
                    <rect x="0" y="0" width="200" height="520" fill="url(#arabianSeaGrad)" />
                    <rect x="0" y="0" width="180" height="520" fill="url(#seaPattern)" opacity="0.5" />
                    
                    {/* Mumbai Harbour / Thane Creek Water Body on East (Right) */}
                    <rect x="420" y="0" width="180" height="520" fill="url(#harbourGrad)" />

                    {/* Stylized Mumbai Coastal Contour Line (Arabian Sea shoreline) */}
                    <path 
                      d="M 190,0 
                         C 195,50 190,90 200,130 
                         C 205,170 215,200 220,240 
                         C 210,270 205,300 225,330 
                         C 235,360 250,380 255,410 
                         C 260,440 262,470 270,520"
                      fill="none" 
                      stroke="#8FA892" 
                      strokeWidth="3.5" 
                      opacity="0.85" 
                    />

                    {/* Stylized Eastern Shoreline (Thane Creek & Harbour) */}
                    <path 
                      d="M 450,0 
                         C 440,70 435,140 420,200 
                         C 410,260 400,320 380,380 
                         C 365,420 345,460 330,520"
                      fill="none" 
                      stroke="#8FA892" 
                      strokeWidth="2.5" 
                      opacity="0.75" 
                    />

                    {/* Powai Lake (Inland Water Body in Eastern Suburbs) */}
                    <ellipse cx="400" cy="210" rx="35" ry="18" fill="#DCE7DB" stroke="#8FA892" strokeWidth="1.5" />
                    <text x="400" y="214" textAnchor="middle" fill="#5A745F" fontSize="8" fontFamily="serif" fontStyle="italic">
                      Powai Lake
                    </text>

                    {/* Mahim Bay & Mithi River Mouth */}
                    <path 
                      d="M 220,295 C 255,300 290,290 320,285" 
                      fill="none" 
                      stroke="#A5BFA8" 
                      strokeWidth="4" 
                      opacity="0.6" 
                    />
                    <text x="245" y="312" fill="#69856C" fontSize="7.5" fontStyle="italic">Mahim Bay</text>

                    {/* Bandra-Worli Sea Link Arc */}
                    <path 
                      d="M 228,300 C 240,325 245,345 250,365" 
                      fill="none" 
                      stroke="#D9A441" 
                      strokeWidth="2.2" 
                      strokeDasharray="4,2" 
                      opacity="0.85" 
                    />
                    <text x="260" y="340" fill="#946C1C" fontSize="6.8" transform="rotate(75, 260, 340)">
                      Sea Link
                    </text>

                    {/* Western Railway & Western Express Highway Transit Spine */}
                    <line x1="205" y1="20" x2="275" y2="480" stroke="#C4B495" strokeWidth="2.5" strokeDasharray="6,3" opacity="0.8" />
                    {/* Central Railway Transit Spine */}
                    <line x1="390" y1="20" x2="285" y2="470" stroke="#C4B495" strokeWidth="2" strokeDasharray="6,3" opacity="0.7" />

                    {/* Geographic Cartographic Labels */}
                    <text x="60" y="260" fill="#758E77" fontSize="13" fontFamily="serif" letterSpacing="4" opacity="0.75">
                      ARABIAN SEA
                    </text>
                    <text x="440" y="330" fill="#758E77" fontSize="10" fontFamily="serif" letterSpacing="2" opacity="0.7">
                      MUMBAI HARBOUR
                    </text>
                    <text x="450" y="100" fill="#758E77" fontSize="9" fontFamily="serif" letterSpacing="2" opacity="0.7">
                      THANE CREEK
                    </text>

                    {/* Regional Suburb Annotations */}
                    <text x="280" y="55" fill="#8C7F6C" fontSize="8.5" fontWeight="bold" letterSpacing="1">
                      NORTHERN SUBURBS (Borivali • Kandivali)
                    </text>
                    <text x="290" y="170" fill="#8C7F6C" fontSize="8.5" fontWeight="bold" letterSpacing="1">
                      WESTERN SUBURBS (Goregaon • Andheri)
                    </text>
                    <text x="295" y="360" fill="#8C7F6C" fontSize="8.5" fontWeight="bold" letterSpacing="1">
                      CENTRAL (Dadar • Parel)
                    </text>
                    <text x="300" y="455" fill="#8C7F6C" fontSize="9" fontWeight="bold" letterSpacing="1">
                      SOUTH MUMBAI (Fort • Colaba)
                    </text>
                  </svg>

                  {/* Mumbai Library Location Pins */}
                  {filteredLibraries.map((lib) => {
                    const pos = BRANCH_POSITIONS[lib.id] || lib.mapPosition || { top: '50%', left: '50%' };
                    const isSelected = activeBranch?.id === lib.id;
                    const isHeritage = lib.isVerified;

                    return (
                      <button
                        key={lib.id}
                        type="button"
                        className={`map-pin-btn ${isSelected ? 'pin-selected' : ''} ${isHeritage ? 'pin-heritage' : ''}`}
                        style={{ top: pos.top, left: pos.left }}
                        onClick={() => handleSelectBranch(lib.id)}
                        title={`${lib.name} (${lib.area})`}
                        aria-pressed={isSelected}
                      >
                        <MapPin size={16} className={`pin-icon ${isHeritage ? 'icon-heritage' : ''}`} />
                        <span className="pin-label">
                          {lib.area || lib.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Map Bottom Legend */}
                <div className="map-legend mumbai-map-legend">
                  <div className="legend-item">
                    <span className="legend-dot dot-heritage" />
                    <span>Verified Historic / Public Libraries ({librariesList.filter(l => l.isVerified).length})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot dot-demo" />
                    <span>Demonstration Suburb Facilities ({librariesList.filter(l => !l.isVerified).length})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Branch Detail Card — Indian Context & Verification */}
            {activeBranch && (
              <div className="active-branch-detail-panel">
                <div>
                  <div className="active-panel-top">
                    <span className={`active-branch-badge ${activeBranch.isVerified ? 'badge-verified-gold' : 'badge-demo'}`}>
                      {activeBranch.isVerified ? '✓ ' + activeBranch.verificationStatus : 'Demonstration Record'}
                    </span>
                    {activeBranch.establishedYear && (
                      <span className="active-branch-distance">Est. {activeBranch.establishedYear}</span>
                    )}
                  </div>

                  <h3 className="active-branch-title">{activeBranch.name}</h3>
                  <span className="active-branch-locality">
                    {activeBranch.locality} • {activeBranch.region}
                  </span>
                  
                  <p className="active-branch-address">
                    <MapPin size={14} className="inline-address-pin" />
                    {activeBranch.address}
                  </p>

                  {activeBranch.nearestTransit && (
                    <div className="active-transit-strip">
                      <Train size={13} className="transit-icon" />
                      <span>{activeBranch.nearestTransit}</span>
                    </div>
                  )}

                  <div className="active-branch-meta">
                    <div className="meta-row">
                      <Clock size={16} className="meta-icon" />
                      <div>
                        <strong>Opening Hours:</strong>
                        <p>{activeBranch.hours?.weekdays}</p>
                        <p className="text-muted">
                          {activeBranch.hours?.saturday}
                          {activeBranch.hours?.sunday ? ` • ${activeBranch.hours.sunday}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="meta-row">
                      <Phone size={16} className="meta-icon" />
                      <div>
                        <strong>Telephone:</strong>{' '}
                        <a href={`tel:${activeBranch.phone}`} className="phone-link">
                          {activeBranch.phone}
                        </a>
                      </div>
                    </div>

                    {activeBranch.email && (
                      <div className="meta-row">
                        <Mail size={16} className="meta-icon" />
                        <div>
                          <strong>Email:</strong>{' '}
                          <a href={`mailto:${activeBranch.email}`} className="email-link">
                            {activeBranch.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {activeBranch.supervisor && (
                      <div className="meta-row">
                        <User size={16} className="meta-icon" />
                        <div>
                          <strong>Institution Contact:</strong> {activeBranch.supervisor}
                        </div>
                      </div>
                    )}
                  </div>

                  {activeBranch.accessNote && (
                    <div className="active-access-note">
                      <strong>Access & Membership:</strong> {activeBranch.accessNote}
                    </div>
                  )}

                  <div className="active-branch-services">
                    <strong>Facilities & Collections:</strong>
                    <div className="branch-tags-list">
                      {activeBranch.services?.map((s, i) => (
                        <span key={i} className="branch-tag-chip">
                          <Check size={11} /> {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="active-branch-actions">
                  <a
                    href={getMapLink(activeBranch)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lib-btn-primary"
                    aria-label={`Open ${activeBranch.name} in Google Maps`}
                  >
                    <Navigation size={15} />
                    <span>Open in Maps</span>
                    <ExternalLink size={13} />
                  </a>
                  <a
                    href={`tel:${activeBranch.phone}`}
                    className="lib-btn-secondary"
                    aria-label={`Call ${activeBranch.name}`}
                  >
                    <Phone size={15} />
                    <span>Call Library</span>
                  </a>
                  <button
                    type="button"
                    className="lib-btn-tertiary"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={14} />
                    <span>Show Cards</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Mode 2: Branch Cards Grid */}
        {viewMode === 'grid' && (
          <div className="libraries-grid">
            {filteredLibraries.map((lib) => (
              <div key={lib.id} className="library-branch-card indian-library-card">
                {/* Botanical Corner Accent */}
                <div className="branch-corner-flourish" aria-hidden="true">❦</div>

                <div className="lib-card-top">
                  <div className="lib-name-block">
                    <div className="lib-header-badges">
                      {lib.isFlagship && <span className="flagship-badge">Mumbai Landmark</span>}
                      {lib.isVerified ? (
                        <span className="verified-badge-pill">
                          <ShieldCheck size={12} /> {lib.verificationStatus}
                        </span>
                      ) : (
                        <span className="sample-badge">Demonstration Profile</span>
                      )}
                    </div>
                    <h3 className="library-card-title">{lib.name}</h3>
                    <span className="lib-neighborhood">
                      {lib.locality} • {lib.region}
                    </span>
                  </div>
                  {lib.establishedYear && (
                    <span className="lib-distance-pill">Est. {lib.establishedYear}</span>
                  )}
                </div>

                {/* Branch Information with Indian Context */}
                <div className="lib-info-block">
                  <div className="lib-info-row">
                    <MapPin size={16} className="lib-info-icon" />
                    <span className="lib-address-text">{lib.address}</span>
                  </div>

                  {lib.nearestTransit && (
                    <div className="lib-info-row transit-highlight-row">
                      <Train size={15} className="lib-info-icon transit-icon" />
                      <span className="lib-transit-text">{lib.nearestTransit}</span>
                    </div>
                  )}

                  <div className="lib-info-row">
                    <Clock size={16} className="lib-info-icon" />
                    <div className="hours-block">
                      <span className="hours-main">{lib.hours?.weekdays}</span>
                      <span className="hours-sub">
                        {lib.hours?.saturday}
                        {lib.hours?.sunday ? ` • ${lib.hours.sunday}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="lib-info-row">
                    <Phone size={16} className="lib-info-icon" />
                    <a href={`tel:${lib.phone}`} className="lib-contact-link">
                      {lib.phone}
                    </a>
                  </div>

                  {lib.email && (
                    <div className="lib-info-row">
                      <Mail size={16} className="lib-info-icon" />
                      <a href={`mailto:${lib.email}`} className="lib-contact-link">
                        {lib.email}
                      </a>
                    </div>
                  )}

                  {lib.supervisor && (
                    <div className="lib-info-row">
                      <User size={16} className="lib-info-icon" />
                      <span className="lib-contact-text">In-Charge: {lib.supervisor}</span>
                    </div>
                  )}
                </div>

                {/* Access and Membership Notice */}
                {lib.accessNote && (
                  <div className="lib-access-note-box">
                    <span className="access-note-title">Admission & Access:</span>
                    <p className="access-note-body">{lib.accessNote}</p>
                  </div>
                )}

                {/* Amenities */}
                <div className="lib-services-block">
                  <h4 className="lib-section-subhead">Facilities & Collections:</h4>
                  <div className="lib-amenities-tags">
                    {lib.services?.map((srv, sIdx) => (
                      <span key={sIdx} className="amenity-tag-item">
                        <Check size={11} className="tag-check" />
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Accessibility */}
                {lib.accessibility && lib.accessibility.length > 0 && (
                  <div className="lib-access-block">
                    <span className="access-label">Accessibility:</span>
                    <span className="access-list">{lib.accessibility.join(' • ')}</span>
                  </div>
                )}

                {/* Card Footer Actions in Forest Green (#355442) */}
                <div className="lib-card-footer">
                  <button
                    type="button"
                    className="lib-btn-primary"
                    onClick={() => handleCardViewOnMap(lib.id)}
                    title="View on Interactive Map"
                  >
                    <Compass size={14} />
                    <span>View on Map</span>
                  </button>
                  <a
                    href={getMapLink(lib)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lib-btn-secondary"
                    title="Open in Google Maps / Navigation"
                  >
                    <Navigation size={14} />
                    <span>Directions</span>
                    <ExternalLink size={12} />
                  </a>
                  <a
                    href={`tel:${lib.phone}`}
                    className="lib-btn-tertiary"
                    title="Call Library Desk"
                  >
                    <Phone size={14} />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State when Search Yields Zero Results */}
        {filteredLibraries.length === 0 && (
          <div className="empty-catalog-state mumbai-empty-state">
            <div className="empty-icon-wrap">
              <MapPin size={32} />
            </div>
            <h3 className="empty-title">No libraries found in Mumbai matching your search</h3>
            <p className="empty-desc">
              We couldn't find matching reading rooms in Mumbai for "{searchQuery || selectedLocality}". 
              Try searching by an established locality such as Fort, Dadar, Bandra, Andheri, or Borivali, 
              or reset your filters below to view all verified Mumbai institutions.
            </p>
            <button
              type="button"
              className="empty-reset-btn"
              onClick={handleResetAllFilters}
            >
              Show All Mumbai Libraries
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
