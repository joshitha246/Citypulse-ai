/* ============================================
   CityPulse AI — Notification System
   ============================================ */

function updateNotifBadge() {
  const count = CityPulseData.getUnreadCount();
  const badge = document.getElementById('notif-badge');
  if (count > 0) {
    badge.textContent = count > 9 ? '9+' : count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function toggleNotifications() {
  const dropdown = document.getElementById('notif-dropdown');
  const isOpen = dropdown.classList.contains('active');

  if (isOpen) {
    dropdown.classList.remove('active');
  } else {
    renderNotifications();
    dropdown.classList.add('active');
  }
}

// Close notifications when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('notif-dropdown');
  const btn = document.getElementById('notif-btn');
  if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
    dropdown.classList.remove('active');
  }
});

function renderNotifications() {
  const list = document.getElementById('notif-list');
  const notifications = CityPulseData.getNotifications();

  if (notifications.length === 0) {
    list.innerHTML = `
      <div class="empty-state" style="padding:var(--space-xl);">
        <div class="empty-state-icon">🔔</div>
        <div class="empty-state-text">No notifications yet</div>
      </div>
    `;
    return;
  }

  list.innerHTML = notifications.slice(0, 15).map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}" onclick="handleNotifClick('${n.id}')">
      <div class="notif-item-content">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-message">${n.message}</div>
        <div class="notif-item-time">${CityPulseData.formatRelative(n.time)}</div>
      </div>
    </div>
  `).join('');
}

function handleNotifClick(id) {
  CityPulseData.markNotificationRead(id);
  updateNotifBadge();
  renderNotifications();
}

function markAllRead() {
  CityPulseData.markAllNotificationsRead();
  updateNotifBadge();
  renderNotifications();
  showToast('info', 'Notifications', 'All notifications marked as read');
}

// ── Departments Page ──
function renderDepartments() {
  const incidents = CityPulseData.getIncidents();
  const deptGrid = document.getElementById('dept-grid');

  deptGrid.innerHTML = CityPulseData.departments.map(dept => {
    const deptIncidents = incidents.filter(i => i.department === dept.id);
    const active = deptIncidents.filter(i => i.status !== 'resolved').length;
    const resolved = deptIncidents.filter(i => i.status === 'resolved').length;
    const total = deptIncidents.length;

    return `
      <div class="dept-card">
        <div class="dept-header">
          <div class="dept-icon" style="background:${dept.color}20;color:${dept.color};">${dept.icon}</div>
          <div>
            <div class="dept-name">${dept.name}</div>
            <div style="font-size:0.75rem;color:var(--text-tertiary);">${total} total incidents</div>
          </div>
        </div>
        <div class="progress-bar" style="margin-bottom:var(--space-md);">
          <div class="progress-fill" style="width:${total > 0 ? (resolved / total * 100) : 0}%;background:${dept.color};"></div>
        </div>
        <div class="dept-stats">
          <div>
            <div class="dept-stat-label">Active</div>
            <div class="dept-stat-value" style="color:var(--accent-amber);">${active}</div>
          </div>
          <div>
            <div class="dept-stat-label">Resolved</div>
            <div class="dept-stat-value" style="color:var(--accent-emerald);">${resolved}</div>
          </div>
          <div>
            <div class="dept-stat-label">Rate</div>
            <div class="dept-stat-value" style="color:${dept.color};">${total > 0 ? Math.round(resolved / total * 100) : 0}%</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
