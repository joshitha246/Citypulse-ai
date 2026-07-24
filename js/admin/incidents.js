/* ============================================
   CityPulse AI — Incidents Queue
   ============================================ */

// Populate type filter dropdown
(function() {
  const select = document.getElementById('incident-filter-type');
  CityPulseData.incidentTypes.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.icon} ${t.label}`;
    select.appendChild(opt);
  });
})();

function renderIncidents() {
  const list = document.getElementById('incident-list');
  let incidents = [...CityPulseData.getIncidents()];

  // Filter by type
  const typeFilter = document.getElementById('incident-filter-type').value;
  if (typeFilter !== 'all') {
    incidents = incidents.filter(i => i.type === typeFilter);
  }

  // Filter by status
  const statusFilter = document.getElementById('incident-filter-status').value;
  if (statusFilter !== 'all') {
    incidents = incidents.filter(i => i.status === statusFilter);
  }

  // Search
  const search = document.getElementById('incident-search-input').value.toLowerCase();
  if (search) {
    incidents = incidents.filter(i =>
      i.id.toLowerCase().includes(search) ||
      i.typeLabel.toLowerCase().includes(search) ||
      i.wardName.toLowerCase().includes(search) ||
      i.description.toLowerCase().includes(search) ||
      i.citizen.toLowerCase().includes(search)
    );
  }

  // Sort
  const sort = document.getElementById('incident-sort').value;
  if (sort === 'priority') {
    incidents.sort((a, b) => CityPulseData.priorityOrder[a.priority] - CityPulseData.priorityOrder[b.priority]);
  } else if (sort === 'status') {
    const statusOrder = { reported: 0, assigned: 1, dispatched: 2, resolved: 3 };
    incidents.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  } else {
    incidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (incidents.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">No incidents match your filters</div>
      </div>
    `;
    return;
  }

  list.innerHTML = incidents.map((inc, idx) => `
    <div class="incident-card priority-${inc.priority}" onclick="showIncidentDetail('${inc.id}')" style="animation-delay:${idx * 0.05}s;">
      <div class="incident-card-header">
        <div class="incident-card-type">
          <span class="icon">${inc.typeIcon}</span>
          <span class="label">${inc.typeLabel}</span>
          <span class="badge badge-${inc.priority}">${inc.priority}</span>
          <span class="badge badge-${inc.status === 'resolved' ? 'resolved' : inc.status === 'dispatched' ? 'dispatched' : inc.status === 'assigned' ? 'active' : 'pending'}">${inc.status}</span>
        </div>
        <span class="incident-card-id">${inc.id}</span>
      </div>
      <div class="incident-card-desc">${inc.description}</div>
      <div class="incident-card-meta">
        <span>📍 ${inc.wardName}</span>
        <span>👤 ${inc.citizen}</span>
        <span>🏢 ${inc.departmentName}</span>
        <span>🕐 ${CityPulseData.formatRelative(inc.createdAt)}</span>
      </div>
      <div class="incident-card-footer">
        <div class="incident-card-ai">
          <span>🤖 AI Confidence: ${inc.aiConfidence}%</span>
          <div class="confidence-bar">
            <div class="confidence-fill" style="width:${inc.aiConfidence}%"></div>
          </div>
        </div>
        ${inc.eta ? `<span style="font-size:0.78rem;color:var(--accent-amber);">⏱ ETA: ${inc.eta}</span>` : ''}
        ${inc.feedback ? `<span style="font-size:0.78rem;color:var(--accent-amber);">⭐ ${inc.feedback}/5</span>` : ''}
      </div>
    </div>
  `).join('');
}

function showIncidentDetail(id) {
  const inc = CityPulseData.getIncidents().find(i => i.id === id);
  if (!inc) return;

  const timelineHtml = inc.timeline.map(step => {
    const dotClass = step.completed ? 'completed' : step.active ? 'active' : 'pending';
    const icon = step.completed ? '✓' : step.active ? '●' : '○';
    return `
      <div class="timeline-item" style="animation-delay:${inc.timeline.indexOf(step) * 0.1}s; opacity:1;">
        <div class="timeline-dot ${dotClass}">${icon}</div>
        <div>
          <div class="timeline-label">${step.step}</div>
          <div class="timeline-time">${step.time ? CityPulseData.formatTime(step.time) + ' · ' + CityPulseData.formatDate(step.time) : 'Pending'}</div>
        </div>
      </div>
    `;
  }).join('');

  const bodyHtml = `
    <div class="incident-detail-body">
      <div>
        <div class="detail-section">
          <div class="detail-label">Type</div>
          <div class="detail-value">${inc.typeIcon} ${inc.typeLabel}</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Priority</div>
          <div class="detail-value"><span class="badge badge-${inc.priority}">${inc.priority}</span></div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Status</div>
          <div class="detail-value"><span class="badge badge-${inc.status === 'resolved' ? 'resolved' : 'active'}">${inc.status}</span></div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Location</div>
          <div class="detail-value">📍 ${inc.wardName} (Ward ${inc.ward})</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Reported By</div>
          <div class="detail-value">👤 ${inc.citizen}</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Contact</div>
          <div class="detail-value">📞 ${inc.citizenPhone}</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Department</div>
          <div class="detail-value">🏢 ${inc.departmentName}</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">AI Confidence</div>
          <div class="detail-value">🤖 ${inc.aiConfidence}%</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">Description</div>
          <div class="detail-value" style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">${inc.description}</div>
        </div>
        ${inc.eta ? `<div class="detail-section"><div class="detail-label">ETA</div><div class="detail-value">⏱ ${inc.eta}</div></div>` : ''}
        ${inc.feedback ? `<div class="detail-section"><div class="detail-label">Citizen Feedback</div><div class="detail-value">⭐ ${inc.feedback}/5</div></div>` : ''}
      </div>
      <div>
        <h3 style="font-size:0.95rem;font-weight:700;margin-bottom:var(--space-md);">📋 Incident Timeline</h3>
        <div class="timeline">${timelineHtml}</div>
        <div style="margin-top:var(--space-lg);display:flex;gap:var(--space-sm);flex-wrap:wrap;">
          ${inc.status !== 'resolved' ? `
            <button class="btn btn-primary btn-sm" onclick="advanceIncident('${inc.id}')">⏭ Advance Status</button>
            <button class="btn btn-secondary btn-sm" onclick="resolveIncident('${inc.id}')">✅ Mark Resolved</button>
          ` : ''}
          <button class="btn-share" onclick="shareSingleIncident('${inc.id}')">🔗 Share Link</button>
          <button class="btn-download" onclick="downloadSingleIncidentReport('${inc.id}')">📥 Download Report</button>
        </div>
      </div>
    </div>
  `;

  openModal(`${inc.typeIcon} ${inc.typeLabel} — ${inc.id}`, bodyHtml);
}

function openIncidentModal(id) {
  showIncidentDetail(id);
}

function shareSingleIncident(id) {
  const baseUrl = window.location.href.split('?')[0].split('#')[0];
  const link = `${baseUrl}?incident=${id}`;
  CityPulseUtils.copyToClipboard(link, `Direct link for ${id} copied! 🔗`);
}

function downloadSingleIncidentReport(id) {
  const inc = CityPulseData.getIncidents().find(i => i.id === id);
  if (!inc) return;

  let report = `====================================================\n`;
  report += `CITYPULSE AI — INCIDENT REPORT: ${inc.id}\n`;
  report += `====================================================\n`;
  report += `Type: ${inc.typeLabel} (${inc.type})\n`;
  report += `Priority: ${inc.priority.toUpperCase()}\n`;
  report += `Status: ${inc.status}\n`;
  report += `Location: ${inc.wardName} (Ward ${inc.ward})\n`;
  report += `Coordinates: Lat ${inc.lat}, Lng ${inc.lng}\n`;
  report += `Department: ${inc.departmentName}\n`;
  report += `Reported By: ${inc.citizen} (Phone: ${inc.citizenPhone})\n`;
  report.concat(`Reported Time: ${inc.createdAt}\n`);
  report += `AI Confidence: ${inc.aiConfidence}%\n`;
  if (inc.eta) report += `ETA: ${inc.eta}\n`;
  report += `\nDESCRIPTION:\n${inc.description}\n\n`;

  report += `TIMELINE:\n`;
  inc.timeline.forEach(t => {
    report += `- [${t.completed ? 'COMPLETED' : 'PENDING'}] ${t.step} ${t.time ? '(' + t.time + ')' : ''}\n`;
  });

  CityPulseUtils.downloadFile(`${inc.id}_Report.txt`, report);
}

function advanceIncident(id) {
  const inc = CityPulseData.getIncidents().find(i => i.id === id);
  if (!inc || inc.statusIndex >= 6) return;

  const newIdx = inc.statusIndex + 1;
  const statusMap = { 0: 'reported', 1: 'assigned', 2: 'assigned', 3: 'dispatched', 4: 'dispatched', 5: 'resolved', 6: 'resolved' };

  CityPulseData.updateIncident(id, {
    statusIndex: newIdx,
    status: statusMap[newIdx] || 'resolved',
    timeline: CityPulseData.generateTimeline(inc.createdAt, newIdx)
  });

  showToast('success', 'Status Updated', `${inc.typeLabel} advanced to: ${CityPulseData.statusSteps[newIdx]}`);
  closeModal();
  renderIncidents();
}

function resolveIncident(id) {
  CityPulseData.updateIncident(id, {
    statusIndex: 5,
    status: 'resolved',
    feedback: Math.floor(Math.random() * 2) + 4,
    eta: null,
    timeline: CityPulseData.generateTimeline(
      CityPulseData.getIncidents().find(i => i.id === id).createdAt, 5
    )
  });

  showToast('success', 'Incident Resolved', 'Incident marked as resolved');
  closeModal();
  renderIncidents();
}
