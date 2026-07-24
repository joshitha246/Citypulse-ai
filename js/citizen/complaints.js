/* ============================================
   CityPulse AI — Citizen Complaints Tracker
   ============================================ */

function renderMyComplaints() {
  const container = document.getElementById('my-complaints-list');
  const incidents = CityPulseData.getIncidents();

  // Get citizen's own complaints (submitted by this user + some seed data for demo)
  const myComplaints = incidents.filter(i => i.citizenSubmitted || Math.random() > 0.7).slice(0, 8);

  if (myComplaints.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:var(--space-xl);">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">No complaints submitted yet. Submit your first complaint!</div>
      </div>
    `;
    return;
  }

  container.innerHTML = myComplaints.map(inc => {
    const statusLabel = inc.status.charAt(0).toUpperCase() + inc.status.slice(1);
    const badgeClass = inc.status === 'resolved' ? 'badge-resolved' :
                       inc.status === 'dispatched' ? 'badge-dispatched' :
                       inc.status === 'assigned' ? 'badge-active' : 'badge-pending';

    // Timeline progress
    const totalSteps = 7;
    const progress = Math.min((inc.statusIndex / (totalSteps - 1)) * 100, 100);

    return `
      <div class="my-complaint-card" onclick="showComplaintTimeline('${inc.id}')">
        <div class="complaint-card-header">
          <div class="complaint-card-type">
            <span>${inc.typeIcon}</span>
            ${inc.typeLabel}
          </div>
          <span class="badge ${badgeClass}">${statusLabel}</span>
        </div>
        <div class="complaint-card-desc">${inc.description.substring(0, 80)}...</div>
        <div class="progress-bar" style="margin-bottom:var(--space-sm);">
          <div class="progress-fill" style="width:${progress}%;"></div>
        </div>
        <div class="complaint-card-footer">
          <span>📍 ${inc.wardName}</span>
          <span>${CityPulseData.formatRelative(inc.createdAt)}</span>
        </div>
        <div style="margin-top:var(--space-sm);display:flex;gap:6px;align-items:center;justify-content:space-between;flex-wrap:wrap;">
          <div style="font-size:0.75rem;font-family:var(--font-mono);color:var(--accent-blue);">${inc.id}</div>
          <div style="display:flex;gap:6px;">
            <button class="btn-share" onclick="event.stopPropagation();shareComplaintLink('${inc.id}')" style="padding:3px 8px;font-size:0.72rem;">🔗 Share</button>
            <button class="btn-download" onclick="event.stopPropagation();downloadComplaintReceipt('${inc.id}')" style="padding:3px 8px;font-size:0.72rem;">📥 Receipt</button>
          </div>
        </div>
        ${inc.status === 'resolved' ? `
          <div style="margin-top:var(--space-sm);padding-top:var(--space-sm);border-top:1px solid var(--border-subtle);">
            <div style="font-size:0.75rem;color:var(--text-tertiary);margin-bottom:4px;">Rate this resolution:</div>
            <div class="star-rating">
              ${[1,2,3,4,5].map(s => `<span onclick="event.stopPropagation();rateFeedback('${inc.id}',${s})">${s <= (inc.feedback || 0) ? '⭐' : '☆'}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function showComplaintTimeline(id) {
  const inc = CityPulseData.getIncidents().find(i => i.id === id);
  if (!inc) return;

  // Build inline timeline view
  const container = document.getElementById('my-complaints-list');
  const timelineHtml = inc.timeline.map(step => {
    const dotClass = step.completed ? 'completed' : step.active ? 'active' : 'pending';
    const icon = step.completed ? '✓' : step.active ? '●' : '○';
    return `
      <div class="timeline-item" style="opacity:1;">
        <div class="timeline-dot ${dotClass}">${icon}</div>
        <div>
          <div class="timeline-label">${step.step}</div>
          <div class="timeline-time">${step.time ? CityPulseData.formatTime(step.time) + ' · ' + CityPulseData.formatDate(step.time) : 'Pending'}</div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <button class="btn btn-ghost btn-sm" onclick="renderMyComplaints()" style="margin-bottom:var(--space-md);">← Back to complaints</button>
    <div class="my-complaint-card">
      <div class="complaint-card-header">
        <div class="complaint-card-type">
          <span>${inc.typeIcon}</span>
          ${inc.typeLabel}
        </div>
        <span class="badge badge-${inc.priority}">${inc.priority}</span>
      </div>
      <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin:var(--space-sm) 0;">${inc.description}</div>
      <div style="font-size:0.78rem;color:var(--text-tertiary);margin-bottom:var(--space-md);">
        <div>📍 ${inc.wardName} · Ward ${inc.ward}</div>
        <div>🏢 ${inc.departmentName}</div>
        <div>🤖 AI Confidence: ${inc.aiConfidence}%</div>
        ${inc.eta ? `<div>⏱ ETA: ${inc.eta}</div>` : ''}
      </div>
      <div style="display:flex;gap:8px;margin-bottom:var(--space-md);">
        <button class="btn-share" onclick="shareComplaintLink('${inc.id}')">🔗 Share Tracking Link</button>
        <button class="btn-download" onclick="downloadComplaintReceipt('${inc.id}')">📥 Download Receipt</button>
      </div>
      <div style="font-weight:700;font-size:0.9rem;margin-bottom:var(--space-md);">📋 Status Timeline</div>
      <div class="timeline">${timelineHtml}</div>
    </div>
  `;
}

function shareComplaintLink(ticketId) {
  const baseUrl = window.location.href.split('?')[0].split('#')[0];
  const shareUrl = `${baseUrl}?track=${ticketId}`;
  CityPulseUtils.copyToClipboard(shareUrl, `Tracking Link for Ticket ${ticketId} copied! 🔗`);
}

function downloadComplaintReceipt(ticketId) {
  const inc = CityPulseData.getIncidents().find(i => i.id === ticketId);
  if (!inc) return;

  let receipt = `====================================================\n`;
  receipt += `CITYPULSE AI — CITIZEN COMPLAINT RECEIPT\n`;
  receipt += `====================================================\n`;
  receipt += `Ticket ID: ${inc.id}\n`;
  receipt += `Category: ${inc.typeLabel} (${inc.type})\n`;
  receipt += `Status: ${inc.status.toUpperCase()}\n`;
  receipt += `Ward/Location: ${inc.wardName}\n`;
  receipt += `Submitted By: ${inc.citizen}\n`;
  receipt += `Submission Date: ${new Date(inc.createdAt).toLocaleString()}\n`;
  receipt += `Assigned Department: ${inc.departmentName}\n`;
  receipt += `\nDESCRIPTION:\n${inc.description}\n\n`;
  receipt += `Thank you for contributing to smart city governance!\n`;

  CityPulseUtils.downloadFile(`Receipt_${inc.id}.txt`, receipt);
}

function shareSubmittedComplaint() {
  const ticketId = document.getElementById('success-ticket-id').textContent;
  shareComplaintLink(ticketId);
}

function downloadSubmittedReceipt() {
  const ticketId = document.getElementById('success-ticket-id').textContent;
  downloadComplaintReceipt(ticketId);
}

function rateFeedback(id, rating) {
  CityPulseData.updateIncident(id, { feedback: rating });
  renderMyComplaints();
}

