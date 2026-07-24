/* ============================================
   CityPulse AI — Citizen Panel Controller
   ============================================ */

// ── Auth Check ──
const citizenSession = CityPulseAuth.requireAuth('citizen');
if (!citizenSession) throw new Error('Not authenticated');

// ── Initialize Data ──
CityPulseData.init();

// ── Setup Greeting ──
const greeting = CityPulseAuth.getGreeting();
document.getElementById('citizen-greeting').textContent =
  `${greeting}, ${citizenSession.fullName || 'Citizen'}`;

// ── Update Status Bar Time ──
function updateStatusTime() {
  const now = new Date();
  document.getElementById('status-time').textContent =
    now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
updateStatusTime();
setInterval(updateStatusTime, 60000);

// ── Tab Navigation ──
function switchTab(tab) {
  document.querySelectorAll('.citizen-tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.citizen-tab').forEach(el => el.classList.remove('active'));

  const content = document.getElementById('tab-' + tab);
  if (content) content.classList.add('active');

  const tabBtn = document.querySelector(`.citizen-tab[data-tab="${tab}"]`);
  if (tabBtn) tabBtn.classList.add('active');

  if (tab === 'complaints') renderMyComplaints();
  if (tab === 'nearby') initNearbyMap();
  if (tab === 'alerts') renderAlerts();
}

// ── Category Grid ──
let selectedCategory = null;

function buildCategoryGrid() {
  const grid = document.getElementById('category-grid');
  const categories = CityPulseData.incidentTypes.slice(0, 9);

  grid.innerHTML = categories.map(type => `
    <button class="category-btn" data-type="${type.id}" onclick="selectCategory('${type.id}')">
      <span class="cat-icon">${type.icon}</span>
      ${type.label}
    </button>
  `).join('');
}
buildCategoryGrid();

function selectCategory(typeId) {
  selectedCategory = typeId;
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.type === typeId);
  });
}

// ── Mini Map for Location ──
let citizenMiniMap = null;
let citizenMarker = null;

function initCitizenMap() {
  if (citizenMiniMap) return;

  citizenMiniMap = L.map('citizen-mini-map', {
    center: [12.9716, 77.5946],
    zoom: 13,
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(citizenMiniMap);

  // Default marker
  citizenMarker = L.marker([12.9352, 77.6245], {
    draggable: true
  }).addTo(citizenMiniMap);

  citizenMarker.on('dragend', () => {
    const pos = citizenMarker.getLatLng();
    document.getElementById('complaint-location').value =
      `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
  });

  document.getElementById('complaint-location').value = '12.9352, 77.6245 (Koramangala)';
}

// Init map on load
setTimeout(initCitizenMap, 300);

// ── Voice Complaint ──
let isRecording = false;

function toggleVoice() {
  const btn = document.getElementById('voice-btn');
  const label = document.getElementById('voice-label');

  if (isRecording) {
    isRecording = false;
    btn.classList.remove('recording');
    label.textContent = 'Voice Complaint';
    // Simulate transcription
    const desc = document.getElementById('complaint-desc');
    if (!desc.value) {
      desc.value = 'There is a large pothole on the main road near my house. Multiple vehicles have been damaged. Please fix it urgently.';
    }
  } else {
    isRecording = true;
    btn.classList.add('recording');
    label.textContent = 'Recording... Tap to stop';

    // Auto stop after 5 seconds
    setTimeout(() => {
      if (isRecording) toggleVoice();
    }, 5000);
  }
}

// ── Photo Upload Simulation ──
function simulateUpload() {
  const content = document.getElementById('upload-content');
  content.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;justify-content:center;">
      <span>📷</span>
      <span style="color:var(--accent-emerald);">photo_evidence.jpg uploaded</span>
      <span>✅</span>
    </div>
  `;
  document.getElementById('upload-area').style.borderColor = 'var(--accent-emerald)';
}

// ── Submit Complaint ──
function submitComplaint() {
  if (!selectedCategory) {
    alert('Please select a category');
    return;
  }

  const desc = document.getElementById('complaint-desc').value;
  if (!desc.trim()) {
    alert('Please describe the issue');
    return;
  }

  // Generate incident
  const typeData = CityPulseData.incidentTypes.find(t => t.id === selectedCategory);
  const ward = CityPulseData.wards[2]; // Koramangala

  const incident = {
    id: CityPulseData.generateId(),
    type: typeData.id,
    typeLabel: typeData.label,
    typeIcon: typeData.icon,
    typeColor: typeData.color,
    priority: typeData.priority,
    status: 'reported',
    statusIndex: 0,
    ward: ward.id,
    wardName: ward.name,
    lat: ward.lat + (Math.random() - 0.5) * 0.005,
    lng: ward.lng + (Math.random() - 0.5) * 0.005,
    description: desc,
    citizen: citizenSession.fullName || 'Priya Sharma',
    citizenPhone: '+91 98765 43210',
    department: typeData.dept,
    departmentName: CityPulseData.departments.find(d => d.id === typeData.dept).name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: CityPulseData.generateTimeline(new Date().toISOString(), 0),
    aiConfidence: Math.floor(Math.random() * 10) + 90,
    eta: (Math.floor(Math.random() * 5) + 2) + ' hours',
    feedback: null,
    duplicate: false,
    merged: false,
    citizenSubmitted: true
  };

  CityPulseData.addIncident(incident);

  // Show success
  document.getElementById('complaint-form').style.display = 'none';
  document.getElementById('submit-success').style.display = 'flex';
  document.getElementById('success-ticket-id').textContent = incident.id;

  // Auto classify after 2 seconds (simulate AI)
  setTimeout(() => {
    CityPulseData.updateIncident(incident.id, {
      status: 'assigned',
      statusIndex: 2,
      timeline: CityPulseData.generateTimeline(incident.createdAt, 2)
    });
  }, 2000);
}

function resetComplaintForm() {
  document.getElementById('complaint-form').style.display = 'flex';
  document.getElementById('submit-success').style.display = 'none';
  document.getElementById('complaint-desc').value = '';
  selectedCategory = null;
  document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
  document.getElementById('upload-content').innerHTML = '📸 Tap to upload photo<br><span style="font-size:0.7rem;color:var(--text-muted);">Supports JPG, PNG (max 5MB)</span>';
  document.getElementById('upload-area').style.borderColor = '';
}

// ── Alerts ──
function renderAlerts() {
  const container = document.getElementById('alerts-list');
  const alerts = [
    { type: 'emergency', icon: '🚨', title: 'Flood Alert — Marathahalli', message: 'Heavy rainfall expected. Avoid low-lying areas and underpasses. Emergency teams have been deployed.', time: '5 min ago' },
    { type: 'warning', icon: '⚠️', title: 'Road Closure — Silk Board Junction', message: 'Road repair in progress. Use alternative routes via Hosur Road or Outer Ring Road.', time: '1 hour ago' },
    { type: 'warning', icon: '⚠️', title: 'Water Supply Disruption', message: 'BWSSB maintenance work in Whitefield area. Water supply will be restored by 6 PM.', time: '2 hours ago' },
    { type: 'info', icon: 'ℹ️', title: 'BBMP Garbage Collection', message: 'Door-to-door garbage collection schedule for your ward: Mon/Wed/Fri — 7:00 AM to 10:00 AM.', time: '5 hours ago' },
    { type: 'info', icon: '📢', title: 'Community Update', message: 'Ward 3 monthly review meeting scheduled for Saturday at BBMP Community Hall, 10:00 AM.', time: '1 day ago' }
  ];

  container.innerHTML = alerts.map(alert => `
    <div class="alert-card ${alert.type}">
      <span class="alert-icon">${alert.icon}</span>
      <div>
        <div class="alert-title">${alert.title}</div>
        <div class="alert-message">${alert.message}</div>
        <div class="alert-time">${alert.time}</div>
      </div>
    </div>
  `).join('');
}

// ── Check Shared Tracking Link on Load ──
setTimeout(() => {
  const trackId = CityPulseUtils.getURLParam('track');
  if (trackId) {
    switchTab('complaints');
    if (typeof showComplaintTimeline === 'function') {
      showComplaintTimeline(trackId);
    }
  }
}, 400);

