/* ============================================
   CityPulse AI — Live Incident Map (Leaflet)
   ============================================ */

let map = null;
let markers = [];
let markerLayer = null;
let activeFilters = new Set();

function initMap() {
  if (map) {
    map.invalidateSize();
    return;
  }

  // Create map centered on Bangalore
  map = L.map('incident-map', {
    center: [12.9716, 77.5946],
    zoom: 12,
    zoomControl: false,
    attributionControl: false
  });

  // Dark tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(map);

  // Add zoom control to top-right
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Attribution
  L.control.attribution({ position: 'bottomright', prefix: '© OpenStreetMap' }).addTo(map);

  // Build filter buttons
  buildMapFilters();

  // Add markers
  refreshMapMarkers();
}

function buildMapFilters() {
  const container = document.getElementById('map-controls');
  container.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'map-filter-btn active';
  allBtn.textContent = '🌐 All';
  allBtn.onclick = () => {
    activeFilters.clear();
    document.querySelectorAll('.map-filter-btn').forEach(b => b.classList.remove('active'));
    allBtn.classList.add('active');
    refreshMapMarkers();
  };
  container.appendChild(allBtn);

  CityPulseData.incidentTypes.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'map-filter-btn';
    btn.dataset.type = type.id;
    btn.innerHTML = `${type.icon} ${type.label}`;
    btn.onclick = () => {
      // Toggle filter
      if (activeFilters.has(type.id)) {
        activeFilters.delete(type.id);
        btn.classList.remove('active');
      } else {
        activeFilters.add(type.id);
        btn.classList.add('active');
      }

      // Remove "All" active
      allBtn.classList.toggle('active', activeFilters.size === 0);
      refreshMapMarkers();
    };
    container.appendChild(btn);
  });
}

function refreshMapMarkers() {
  if (!map) return;

  // Clear existing markers
  if (markerLayer) {
    map.removeLayer(markerLayer);
  }
  markerLayer = L.layerGroup().addTo(map);
  markers = [];

  const incidents = CityPulseData.getIncidents();
  const filtered = activeFilters.size > 0
    ? incidents.filter(i => activeFilters.has(i.type))
    : incidents;

  filtered.forEach(inc => {
    const marker = createIncidentMarker(inc);
    marker.addTo(markerLayer);
    markers.push(marker);
  });

  // Update map stats
  updateMapStats(filtered);
}

function createIncidentMarker(inc) {
  // Create custom icon with pulse animation
  const isResolved = inc.status === 'resolved';
  const isCritical = inc.priority === 'critical';

  const iconSize = isCritical ? 36 : 28;
  const pulseSize = isCritical ? 50 : 40;

  const iconHtml = `
    <div class="map-marker ${isResolved ? 'resolved' : ''}" style="position:relative;width:${iconSize}px;height:${iconSize}px;">
      ${!isResolved ? `<div style="
        position:absolute;inset:-${(pulseSize - iconSize) / 2}px;
        width:${pulseSize}px;height:${pulseSize}px;
        border-radius:50%;
        background:${inc.typeColor}20;
        border:2px solid ${inc.typeColor}40;
        animation:marker-pulse 2s ease-in-out infinite;
      "></div>` : ''}
      <div style="
        position:relative;z-index:1;
        width:${iconSize}px;height:${iconSize}px;
        background:${isResolved ? '#1a1f37' : inc.typeColor + '25'};
        border:2px solid ${isResolved ? '#475569' : inc.typeColor};
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-size:${isCritical ? '1rem' : '0.85rem'};
        box-shadow:0 2px 8px ${inc.typeColor}40;
      ">${inc.typeIcon}</div>
    </div>
  `;

  const icon = L.divIcon({
    html: iconHtml,
    iconSize: [pulseSize, pulseSize],
    iconAnchor: [pulseSize / 2, pulseSize / 2],
    className: 'custom-marker'
  });

  const marker = L.marker([inc.lat, inc.lng], { icon });

  // Popup
  const popupContent = `
    <div style="font-family:Inter,sans-serif;min-width:240px;padding:4px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="font-size:1.3rem;">${inc.typeIcon}</span>
        <div>
          <div style="font-weight:700;font-size:0.95rem;">${inc.typeLabel}</div>
          <div style="font-size:0.75rem;color:#94A3B8;">${inc.id}</div>
        </div>
        <span style="
          margin-left:auto;
          padding:2px 8px;border-radius:20px;
          font-size:0.65rem;font-weight:600;text-transform:uppercase;
          background:${getPriorityBg(inc.priority)};
          color:${getPriorityColor(inc.priority)};
          border:1px solid ${getPriorityColor(inc.priority)}30;
        ">${inc.priority}</span>
      </div>
      <p style="font-size:0.82rem;color:#CBD5E1;line-height:1.5;margin-bottom:8px;">${inc.description}</p>
      <div style="font-size:0.75rem;color:#64748B;">
        <div>📍 ${inc.wardName} · Ward ${inc.ward}</div>
        <div>👤 ${inc.citizen}</div>
        <div>🏢 ${inc.departmentName}</div>
        <div>🕐 ${CityPulseData.formatRelative(inc.createdAt)}</div>
        <div>🤖 AI Confidence: ${inc.aiConfidence}%</div>
      </div>
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid #1e293b;">
        <span style="
          padding:3px 10px;border-radius:20px;
          font-size:0.7rem;font-weight:600;
          background:${getStatusBg(inc.status)};
          color:${getStatusColor(inc.status)};
        ">${inc.status.toUpperCase()}</span>
        ${inc.eta ? `<span style="margin-left:8px;font-size:0.7rem;color:#F59E0B;">⏱ ETA: ${inc.eta}</span>` : ''}
      </div>
    </div>
  `;

  marker.bindPopup(popupContent, {
    className: 'custom-popup',
    maxWidth: 320
  });

  return marker;
}

function updateMapStats(incidents) {
  const container = document.getElementById('map-stats');
  const total = incidents.length;
  const active = incidents.filter(i => i.status !== 'resolved').length;
  const critical = incidents.filter(i => i.priority === 'critical' && i.status !== 'resolved').length;

  container.innerHTML = `
    <div class="map-stat-chip">
      📊 Total: <span class="stat-value">${total}</span>
    </div>
    <div class="map-stat-chip">
      🔴 Active: <span class="stat-value" style="color:var(--accent-amber);">${active}</span>
    </div>
    <div class="map-stat-chip">
      🚨 Critical: <span class="stat-value" style="color:var(--priority-critical);">${critical}</span>
    </div>
  `;
}

function getPriorityColor(p) {
  const map = { critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#10B981' };
  return map[p] || '#94A3B8';
}

function getPriorityBg(p) {
  const map = { critical: '#EF444420', high: '#F9731620', medium: '#F59E0B20', low: '#10B98120' };
  return map[p] || '#94A3B820';
}

function getStatusColor(s) {
  const map = { reported: '#F59E0B', assigned: '#3B82F6', dispatched: '#8B5CF6', resolved: '#10B981' };
  return map[s] || '#94A3B8';
}

function getStatusBg(s) {
  const map = { reported: '#F59E0B15', assigned: '#3B82F615', dispatched: '#8B5CF615', resolved: '#10B98115' };
  return map[s] || '#94A3B815';
}

/* Custom popup styles */
const mapStyle = document.createElement('style');
mapStyle.textContent = `
  .custom-marker { background: none !important; border: none !important; }
  .custom-popup .leaflet-popup-content-wrapper {
    background: #111827;
    border: 1px solid rgba(148,163,184,0.15);
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    color: #F1F5F9;
  }
  .custom-popup .leaflet-popup-tip { background: #111827; border: 1px solid rgba(148,163,184,0.15); }
  .custom-popup .leaflet-popup-close-button { color: #94A3B8 !important; font-size: 18px !important; }
  .leaflet-control-zoom a {
    background: #111827 !important;
    color: #F1F5F9 !important;
    border-color: rgba(148,163,184,0.15) !important;
  }
  [data-theme="light"] .custom-popup .leaflet-popup-content-wrapper { background: #fff; color: #0f172a; border-color: #e2e8f0; }
  [data-theme="light"] .custom-popup .leaflet-popup-tip { background: #fff; border-color: #e2e8f0; }
  [data-theme="light"] .leaflet-control-zoom a { background: #fff !important; color: #0f172a !important; border-color: #e2e8f0 !important; }
`;
document.head.appendChild(mapStyle);
