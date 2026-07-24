/* ============================================
   CityPulse AI — Autonomous AI Engine
   ============================================ */

function renderAutonomous() {
  const state = CityPulseData.getState();
  const incidents = CityPulseData.getIncidents();
  const analytics = CityPulseData.calculateAnalytics(incidents);

  // ── Stats ──
  const autoClassified = incidents.filter(i => i.statusIndex >= 1).length;
  const autoAssigned = incidents.filter(i => i.statusIndex >= 2).length;
  const duplicatesFound = 5;
  const avgEta = '2.4 hrs';

  const statsEl = document.getElementById('autonomous-stats');
  statsEl.innerHTML = `
    <div class="card kpi-card" style="animation:slide-in-up 0.3s ease forwards;">
      <div class="kpi-icon blue">🧠</div>
      <div>
        <div class="card-title">Auto-Classified</div>
        <div class="card-value">${autoClassified}</div>
      </div>
    </div>
    <div class="card kpi-card" style="animation:slide-in-up 0.3s ease 0.05s forwards;opacity:0;">
      <div class="kpi-icon purple">📋</div>
      <div>
        <div class="card-title">Auto-Assigned</div>
        <div class="card-value">${autoAssigned}</div>
      </div>
    </div>
    <div class="card kpi-card" style="animation:slide-in-up 0.3s ease 0.1s forwards;opacity:0;">
      <div class="kpi-icon amber">🔄</div>
      <div>
        <div class="card-title">Duplicates Merged</div>
        <div class="card-value">${duplicatesFound}</div>
      </div>
    </div>
    <div class="card kpi-card" style="animation:slide-in-up 0.3s ease 0.15s forwards;opacity:0;">
      <div class="kpi-icon emerald">⏱</div>
      <div>
        <div class="card-title">Avg ETA Prediction</div>
        <div class="card-value">${avgEta}</div>
      </div>
    </div>
  `;

  // ── Activity Feed ──
  const feedEl = document.getElementById('autonomous-feed');
  feedEl.innerHTML = state.autonomousLog.map((log, i) => `
    <div class="feed-item" style="animation-delay:${i * 0.05}s;">
      <div class="feed-icon">🤖</div>
      <div class="feed-text">
        <div class="feed-action">${log.action}</div>
        <div class="feed-result">→ ${log.result}</div>
        <div class="feed-time">${CityPulseData.formatRelative(log.time)}</div>
      </div>
    </div>
  `).join('');

  // ── Capabilities ──
  const capsEl = document.getElementById('ai-capabilities');
  const capabilities = [
    { icon: '🧠', name: 'Incident Classification', desc: 'Automatically categorizes complaints using NLP analysis', accuracy: '94.7%', status: 'Active' },
    { icon: '🔄', name: 'Duplicate Detection', desc: 'Identifies and merges similar complaints within same ward', accuracy: '91.2%', status: 'Active' },
    { icon: '📋', name: 'Department Auto-Assignment', desc: 'Routes incidents to correct department based on type', accuracy: '97.3%', status: 'Active' },
    { icon: '⏱', name: 'ETA Prediction', desc: 'Predicts resolution time based on historical data', accuracy: '86.5%', status: 'Active' },
    { icon: '🔮', name: 'Incident Forecasting', desc: 'Predicts complaint patterns for next 24-48 hours', accuracy: '82.1%', status: 'Active' },
    { icon: '🚨', name: 'Priority Escalation', desc: 'Auto-escalates incidents based on severity signals', accuracy: '96.0%', status: 'Active' }
  ];

  capsEl.innerHTML = capabilities.map(cap => `
    <div class="card" style="margin-bottom:var(--space-sm);padding:var(--space-md);">
      <div style="display:flex;align-items:center;gap:var(--space-md);">
        <span style="font-size:1.3rem;">${cap.icon}</span>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:0.88rem;">${cap.name}</div>
          <div style="font-size:0.78rem;color:var(--text-tertiary);">${cap.desc}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:var(--font-mono);font-weight:700;font-size:0.9rem;color:var(--accent-emerald);">${cap.accuracy}</div>
          <div class="badge badge-resolved" style="margin-top:4px;">${cap.status}</div>
        </div>
      </div>
    </div>
  `).join('');
}
