/* ============================================
   CityPulse AI — Citizen Nearby Incidents Map
   ============================================ */

let nearbyMap = null;
let nearbyInitialized = false;

function initNearbyMap() {
  if (nearbyInitialized) {
    if (nearbyMap) nearbyMap.invalidateSize();
    return;
  }
  nearbyInitialized = true;

  // Small delay to ensure container is visible
  setTimeout(() => {
    nearbyMap = L.map('nearby-map', {
      center: [12.9352, 77.6245], // Koramangala
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(nearbyMap);

    // Citizen location marker
    const citizenIcon = L.divIcon({
      html: `<div style="
        width:16px;height:16px;
        background:var(--accent-blue);
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 10px rgba(59,130,246,0.5);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      className: 'custom-marker'
    });

    L.marker([12.9352, 77.6245], { icon: citizenIcon })
      .addTo(nearbyMap)
      .bindPopup('<div style="font-family:Inter;"><strong>📍 Your Location</strong><br>Koramangala, Ward 3</div>');

    // Nearby incidents
    const incidents = CityPulseData.getIncidents();
    const nearby = incidents.filter(i => {
      const dist = Math.sqrt(
        Math.pow(i.lat - 12.9352, 2) + Math.pow(i.lng - 77.6245, 2)
      );
      return dist < 0.05 && i.status !== 'resolved';
    });

    nearby.forEach(inc => {
      const incIcon = L.divIcon({
        html: `<div style="
          width:24px;height:24px;
          background:${inc.typeColor}25;
          border:2px solid ${inc.typeColor};
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:0.7rem;
          box-shadow:0 2px 6px ${inc.typeColor}40;
        ">${inc.typeIcon}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: 'custom-marker'
      });

      L.marker([inc.lat, inc.lng], { icon: incIcon })
        .addTo(nearbyMap)
        .bindPopup(`
          <div style="font-family:Inter;min-width:180px;">
            <strong>${inc.typeIcon} ${inc.typeLabel}</strong><br>
            <span style="font-size:0.8em;color:#94A3B8;">${inc.description.substring(0, 60)}...</span><br>
            <span style="font-size:0.75em;">📍 ${inc.wardName} · ${CityPulseData.formatRelative(inc.createdAt)}</span>
          </div>
        `);
    });

    // Render nearby list
    renderNearbyList(nearby);
  }, 200);
}

function renderNearbyList(nearby) {
  const container = document.getElementById('nearby-list');

  if (!nearby || nearby.length === 0) {
    const incidents = CityPulseData.getIncidents().filter(i => i.status !== 'resolved').slice(0, 5);
    nearby = incidents;
  }

  container.innerHTML = nearby.slice(0, 6).map(inc => `
    <div class="alert-card info" style="cursor:pointer;">
      <span class="alert-icon">${inc.typeIcon}</span>
      <div style="flex:1;">
        <div class="alert-title">${inc.typeLabel}</div>
        <div class="alert-message">${inc.description.substring(0, 60)}...</div>
        <div class="alert-time">📍 ${inc.wardName} · ${CityPulseData.formatRelative(inc.createdAt)}</div>
      </div>
      <span class="badge badge-${inc.priority}" style="align-self:flex-start;">${inc.priority}</span>
    </div>
  `).join('');
}

/* Custom popup styles for citizen map */
const citizenMapStyle = document.createElement('style');
citizenMapStyle.textContent = `
  .custom-marker { background: none !important; border: none !important; }
  .leaflet-popup-content-wrapper {
    background: #111827 !important;
    border: 1px solid rgba(148,163,184,0.15) !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
    color: #F1F5F9 !important;
  }
  .leaflet-popup-tip { background: #111827 !important; }
  .leaflet-popup-close-button { color: #94A3B8 !important; }
`;
document.head.appendChild(citizenMapStyle);
