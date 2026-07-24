/* ============================================
   CityPulse AI — Admin Dashboard Controller
   ============================================ */

// ── Auth Check ──
const session = CityPulseAuth.requireAuth('admin');
if (!session) throw new Error('Not authenticated');

// ── Initialize Data ──
const appState = CityPulseData.init();

// ── Setup User Info ──
document.getElementById('user-name').textContent = session.fullName || session.name;
document.getElementById('user-avatar').textContent = session.avatar;

// ── Theme ──
const savedTheme = appState.theme || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  CityPulseData.setTheme(next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  document.getElementById('theme-toggle').textContent = theme === 'dark' ? '🌙' : '☀️';
}

// ── Page Navigation ──
const pageTitles = {
  map: { icon: '🗺️', title: 'Live Incident Map' },
  incidents: { icon: '📋', title: 'Incidents Queue' },
  analytics: { icon: '📊', title: 'Analytics Panel' },
  copilot: { icon: '🤖', title: 'AI Copilot Chat' },
  autonomous: { icon: '⚙️', title: 'Autonomous AI Engine' },
  departments: { icon: '🏢', title: 'Departments' }
};

let currentPage = 'map';

function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  // Update topbar title
  const info = pageTitles[page];
  if (info) {
    document.getElementById('topbar-title').innerHTML = `<span>${info.icon}</span> ${info.title}`;
  }

  currentPage = page;

  // Initialize page-specific content
  if (page === 'map') initMap();
  if (page === 'incidents') renderIncidents();
  if (page === 'analytics') renderAnalytics();
  if (page === 'copilot') initCopilot();
  if (page === 'autonomous') renderAutonomous();
  if (page === 'departments') renderDepartments();
}

// ── Division Change ──
function handleDivisionChange(value) {
  showToast('info', 'Division Changed', `Switched to ${value} division`);
}

// ── Autonomous Toggle ──
function toggleAutonomous() {
  const state = CityPulseData.getState();
  const newState = !state.autonomousMode;
  CityPulseData.setAutonomousMode(newState);

  document.querySelectorAll('.autonomous-toggle').forEach(el => {
    el.classList.toggle('active', newState);
  });

  showToast(
    newState ? 'success' : 'warning',
    'Autonomous AI',
    newState ? 'AI Autonomous Mode activated' : 'AI Autonomous Mode deactivated'
  );
}

// ── Reset Data ──
function handleReset() {
  if (confirm('Reset all incident data? This will regenerate all incidents.')) {
    CityPulseData.resetData();
    location.reload();
  }
}

// ── Broadcast ──
function openBroadcast() {
  document.getElementById('broadcast-modal').classList.add('active');
}

function closeBroadcast() {
  document.getElementById('broadcast-modal').classList.remove('active');
}

function sendBroadcast() {
  const type = document.getElementById('broadcast-type').value;
  const message = document.getElementById('broadcast-message').value;
  if (!message.trim()) {
    showToast('warning', 'Missing Message', 'Please enter a broadcast message');
    return;
  }
  showToast('success', '📡 Broadcast Sent', `Alert delivered to all citizens`);
  closeBroadcast();
  document.getElementById('broadcast-message').value = '';
}

// ── Modal ──
function openModal(title, bodyHtml) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('incident-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('incident-modal').classList.remove('active');
}

// Click outside modal to close
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('active');
  });
});

// ── Toast System ──
function showToast(type, title, message, duration = 4000) {
  const container = document.getElementById('toast-container');
  const icons = { critical: '🚨', warning: '⚠️', success: '✅', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-dismiss" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Start Simulation ──
CityPulseData.startSimulation((newInc) => {
  showToast(
    newInc.priority === 'critical' ? 'critical' : 'info',
    `${newInc.typeIcon} New ${newInc.typeLabel}`,
    `${newInc.wardName} — ${newInc.description.substring(0, 50)}...`
  );

  updateNotifBadge();

  // Refresh current page
  if (currentPage === 'map') refreshMapMarkers();
  if (currentPage === 'incidents') renderIncidents();
  if (currentPage === 'analytics') renderAnalytics();
  if (currentPage === 'autonomous') renderAutonomous();

  // Update incident count badge
  const unresolved = CityPulseData.getIncidents().filter(i => i.status !== 'resolved').length;
  const badge = document.getElementById('incident-count-badge');
  if (badge) badge.textContent = unresolved;
});

// ── Admin Share & Export Center ──
function openAdminShareModal() {
  const modal = document.getElementById('share-modal');
  if (!modal) return;

  const currentUrl = window.location.href.split('?')[0].split('#')[0];
  document.getElementById('admin-share-url').value = currentUrl;

  // Populate incident selector
  const select = document.getElementById('share-incident-select');
  if (select) {
    const incidents = CityPulseData.getIncidents();
    select.innerHTML = '<option value="">Select an Incident to Link...</option>' +
      incidents.map(inc => `<option value="${inc.id}">${inc.id} — ${inc.typeLabel} (${inc.wardName})</option>`).join('');
  }

  modal.classList.add('active');
}

function closeAdminShareModal() {
  document.getElementById('share-modal').classList.remove('active');
}

function copyAdminShareUrl() {
  const url = document.getElementById('admin-share-url').value;
  CityPulseUtils.copyToClipboard(url, 'Command Center Link Copied! 📋');
}

function copySelectedIncidentLink() {
  const incId = document.getElementById('share-incident-select').value;
  if (!incId) {
    showToast('warning', 'Select Incident', 'Please select an incident first');
    return;
  }
  const baseUrl = window.location.href.split('?')[0].split('#')[0];
  const shareUrl = `${baseUrl}?incident=${incId}`;
  CityPulseUtils.copyToClipboard(shareUrl, `Link for ${incId} copied! 🔗`);
}

function downloadFullSystemReport() {
  const incidents = CityPulseData.getIncidents();
  const analytics = CityPulseData.calculateAnalytics();
  
  let reportText = `====================================================\n`;
  reportText += `CITYPULSE AI — MUNICIPAL COMMAND CENTER REPORT\n`;
  reportText += `Generated: ${new Date().toLocaleString()}\n`;
  reportText += `====================================================\n\n`;
  
  reportText += `SUMMARY STATS:\n`;
  reportText += `- Total Incidents: ${analytics.total}\n`;
  reportText += `- Critical Active: ${analytics.criticalCount}\n`;
  reportText += `- Active Incidents: ${analytics.active}\n`;
  reportText += `- Resolved Incidents: ${analytics.resolved}\n`;
  reportText += `- Resolution Rate: ${analytics.resolutionRate}%\n`;
  reportText += `- Avg Resolution Time: ${analytics.avgResolutionTime} mins\n\n`;

  reportText += `INCIDENTS LIST:\n`;
  reportText += `----------------------------------------------------\n`;
  incidents.forEach(inc => {
    reportText += `[${inc.id}] ${inc.typeLabel.toUpperCase()} | Priority: ${inc.priority.toUpperCase()} | Status: ${inc.status}\n`;
    reportText += `Location: ${inc.wardName} (${inc.lat}, ${inc.lng})\n`;
    reportText += `Department: ${inc.departmentName}\n`;
    reportText += `Description: ${inc.description}\n`;
    reportText += `Time: ${inc.createdAt}\n\n`;
  });

  CityPulseUtils.downloadFile(`CityPulse_System_Report_${Date.now()}.txt`, reportText);
}

function downloadIncidentsCSV() {
  const incidents = CityPulseData.getIncidents();
  let csv = 'ID,Type,Priority,Status,Ward,Department,Latitude,Longitude,CreatedTime,Description\n';
  
  incidents.forEach(i => {
    const desc = `"${(i.description || '').replace(/"/g, '""')}"`;
    csv += `${i.id},${i.typeLabel},${i.priority},${i.status},${i.wardName},${i.departmentName},${i.lat},${i.lng},${i.createdAt},${desc}\n`;
  });

  CityPulseUtils.downloadFile(`CityPulse_Incidents_${Date.now()}.csv`, csv, 'text/csv');
}

// ── Initialize Default Page & Check Direct Links ──
navigateTo('map');
updateNotifBadge();

// Update incident count badge
const unresolvedCount = CityPulseData.getIncidents().filter(i => i.status !== 'resolved').length;
document.getElementById('incident-count-badge').textContent = unresolvedCount;

// ── Auto-open Shared Incident Link on page load ──
setTimeout(() => {
  const sharedIncidentId = CityPulseUtils.getURLParam('incident');
  if (sharedIncidentId) {
    if (typeof openIncidentModal === 'function') {
      openIncidentModal(sharedIncidentId);
    }
  }
}, 500);

