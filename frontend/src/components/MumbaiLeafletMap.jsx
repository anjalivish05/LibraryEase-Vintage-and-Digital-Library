import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, ExternalLink, Sparkles, MapPin, ShieldCheck, Train } from 'lucide-react';

// Default Mumbai Metropolitan Center & Zoom
const MUMBAI_CENTER = [19.0760, 72.8777];
const DEFAULT_ZOOM = 11;

// Custom Burgundy + Bronze SVG Marker Icons for Antique Brocade Theme
function createCustomPin(isSelected, isVerified, label) {
  const bg = isSelected ? '#4A151E' : '#6B1E2B'; // Deep Wine / Burgundy
  const border = isSelected ? '#C49A52' : '#B68A4C'; // Antique Gold / Bronze
  const size = isSelected ? 36 : 30;

  const html = `
    <div class="leaflet-custom-marker ${isSelected ? 'is-selected' : ''}" style="width: ${size}px; height: ${size}px;">
      <div class="pin-bubble" style="background: ${bg}; border: 2px solid ${border}; width: ${size}px; height: ${size}px;">
        <svg viewBox="0 0 24 24" width="${isSelected ? 16 : 14}" height="${isSelected ? 16 : 14}" fill="none" stroke="#F8F2EA" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
          <path d="M6 6h10"></path>
          <path d="M6 10h10"></path>
        </svg>
      </div>
      <div class="pin-pulse"></div>
      <div class="pin-tag-label">${label || ''}</div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-div-icon',
    html: html,
    iconSize: [size, size + 14],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 10)]
  });
}

// Controller component inside MapContainer for reactive zoom, flyTo, fitBounds, reset, and size invalidation
function MapController({ filteredLibraries, activeBranch, resetKey, onResetComplete }) {
  const map = useMap();

  // Invalidate map size on mount and container resize to prevent gray tiles
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Initial delayed invalidations to ensure smooth container transition
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 450);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  // Fly to active branch when patron clicks a branch
  useEffect(() => {
    if (activeBranch?.coordinates?.lat && activeBranch?.coordinates?.lng) {
      const currentCenter = map.getCenter();
      const targetLat = activeBranch.coordinates.lat;
      const targetLng = activeBranch.coordinates.lng;
      const dist = Math.hypot(currentCenter.lat - targetLat, currentCenter.lng - targetLng);

      // Only fly if not already centered on this target
      if (dist > 0.002) {
        map.flyTo([targetLat, targetLng], Math.max(map.getZoom(), 13), {
          duration: 0.8
        });
      }
    }
  }, [activeBranch?.id, map]);

  // Handle Reset to full Mumbai overview
  useEffect(() => {
    if (resetKey > 0) {
      if (filteredLibraries.length > 1) {
        const validCoords = filteredLibraries
          .filter(l => l.coordinates?.lat && l.coordinates?.lng)
          .map(l => [l.coordinates.lat, l.coordinates.lng]);
        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        }
      } else {
        map.flyTo(MUMBAI_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
      }
    }
  }, [resetKey, filteredLibraries, map]);

  return null;
}

export default function MumbaiLeafletMap({
  libraries,
  activeBranchId,
  onSelectBranch,
  getMapLink,
  resetKey
}) {
  const activeBranch = useMemo(() => {
    return libraries.find(b => b.id === activeBranchId) || libraries[0];
  }, [libraries, activeBranchId]);

  return (
    <div className="leaflet-map-wrapper">
      <MapContainer
        center={MUMBAI_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="leaflet-map-container"
        attributionControl={true}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* Dynamic Map Controller for centering & fitting */}
        <MapController
          filteredLibraries={libraries}
          activeBranch={activeBranch}
          resetKey={resetKey}
        />

        {/* Location Markers for Mumbai Libraries */}
        {libraries.map((lib) => {
          if (!lib.coordinates?.lat || !lib.coordinates?.lng) return null;
          const isSelected = lib.id === activeBranchId;
          const label = lib.area || lib.locality?.split('/')[0]?.trim() || lib.name.split(' ')[0];
          const icon = createCustomPin(isSelected, lib.isVerified, label);

          return (
            <Marker
              key={lib.id}
              position={[lib.coordinates.lat, lib.coordinates.lng]}
              icon={icon}
              zIndexOffset={isSelected ? 1000 : 100}
              eventHandlers={{
                click: () => onSelectBranch(lib.id)
              }}
            >
              <Popup className="antique-leaflet-popup" autoPan={false}>
                <div className="popup-inner-card">
                  <div className="popup-header-row">
                    <span className="popup-badge">
                      {lib.isVerified ? '✓ Verified Institution' : 'Demonstration Hub'}
                    </span>
                    {lib.establishedYear && (
                      <span className="popup-year">Est. {lib.establishedYear}</span>
                    )}
                  </div>

                  <h4 className="popup-lib-title">{lib.cardName || lib.name}</h4>
                  <p className="popup-lib-locality">
                    <MapPin size={12} className="inline-pin" />
                    <span>{lib.locality} • {lib.region}</span>
                  </p>

                  <p className="popup-lib-address">{lib.address}</p>

                  {lib.nearestTransit && (
                    <div className="popup-transit">
                      <Train size={12} />
                      <span>{lib.nearestTransit}</span>
                    </div>
                  )}

                  {/* Directions Button — strictly redirects to Google Maps */}
                  <div className="popup-action-row">
                    <a
                      href={getMapLink(lib)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="popup-directions-btn"
                      onClick={(e) => e.stopPropagation()}
                      title={`Get directions to ${lib.name} on Google Maps`}
                    >
                      <Navigation size={13} />
                      <span>Get Directions (Google Maps)</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
