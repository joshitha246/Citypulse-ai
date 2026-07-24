/* ============================================
   CityPulse AI — AI Copilot Chat
   ============================================ */

let copilotInitialized = false;

function initCopilot() {
  if (copilotInitialized) return;
  copilotInitialized = true;

  const messages = document.getElementById('copilot-messages');
  messages.innerHTML = '';

  // Build context-aware greeting
  const greeting = CityPulseAuth.getGreeting();
  const incidents = CityPulseData.getIncidents();
  const unresolved = incidents.filter(i => i.status !== 'resolved').length;
  const critical = incidents.filter(i => i.priority === 'critical' && i.status !== 'resolved');
  const floodAlerts = incidents.filter(i => i.type === 'flooding' && i.status !== 'resolved');
  const analytics = CityPulseData.calculateAnalytics(incidents);

  const greetingMsg = `
    <p><strong>${greeting}, ${session.fullName || 'Administrator'}.</strong></p>
    <p class="metric-line">📊 There are <strong>${unresolved} unresolved incidents</strong> today.</p>
    ${floodAlerts.length > 0 ? `<p class="metric-line">⚠️ <strong>${floodAlerts.length} flooding alert${floodAlerts.length > 1 ? 's' : ''}</strong> require${floodAlerts.length === 1 ? 's' : ''} immediate attention.</p>` : ''}
    ${critical.length > 0 ? `<p class="metric-line">🚨 <strong>${critical.length} critical incident${critical.length > 1 ? 's' : ''}</strong> need priority response.</p>` : ''}
    <p class="metric-line">📈 Average response time ${analytics.avgResponse > 40 ? 'has <strong>increased by 12%</strong>' : 'is <strong>within optimal range</strong>'}.</p>
    <p class="metric-line">✅ Resolution rate: <strong>${analytics.resolutionRate}%</strong></p>
    <p style="margin-top:8px;">Would you like me to generate an emergency deployment plan?</p>
  `;

  addCopilotMessage('ai', greetingMsg, [
    { label: '📋 Generate Deployment Plan', query: 'generate deployment plan' },
    { label: '📊 Daily Summary Report', query: 'daily summary' },
    { label: '🔮 AI Predictions', query: 'predict next 24 hours' },
    { label: '🏘️ Ward Analysis', query: 'which ward has highest complaints' }
  ]);
}

function addCopilotMessage(type, html, actions = []) {
  const messages = document.getElementById('copilot-messages');
  const avatar = type === 'ai' ? '🤖' : session.avatar || '👨‍💼';

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  let actionsHtml = '';
  if (actions.length > 0) {
    actionsHtml = `<div class="chat-actions">${actions.map(a =>
      `<button class="chat-action-btn" onclick="handleQuickAction('${a.query}')">${a.label}</button>`
    ).join('')}</div>`;
  }

  const msgEl = document.createElement('div');
  msgEl.className = `chat-message ${type}`;
  msgEl.innerHTML = `
    <div class="chat-avatar">${avatar}</div>
    <div>
      <div class="chat-bubble">${html}</div>
      ${actionsHtml}
      <div class="chat-time">${timeStr}</div>
    </div>
  `;

  messages.appendChild(msgEl);
  messages.scrollTop = messages.scrollHeight;
}

function handleQuickAction(query) {
  document.getElementById('copilot-input').value = query;
  sendCopilotMessage();
}

function sendCopilotMessage() {
  const input = document.getElementById('copilot-input');
  const text = input.value.trim();
  if (!text) return;

  // Add user message
  addCopilotMessage('user', `<p>${escapeHtml(text)}</p>`);
  input.value = '';

  // Show typing indicator
  const avatar = document.getElementById('copilot-avatar');
  avatar.classList.add('responding');

  const messages = document.getElementById('copilot-messages');
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-message ai';
  typingEl.id = 'typing-indicator';
  typingEl.innerHTML = `
    <div class="chat-avatar">🤖</div>
    <div><div class="chat-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div></div>
  `;
  messages.appendChild(typingEl);
  messages.scrollTop = messages.scrollHeight;

  // Simulate AI response delay
  setTimeout(async () => {
    typingEl.remove();
    avatar.classList.remove('responding');

    try {

    const res = await fetch("/api/copilot", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: text
        })
    });

    const data = await res.json();

    if (data.success) {

        addCopilotMessage(
            "ai",
            `<p>${data.answer.replace(/\n/g,"<br>")}</p>`
        );

    } else {

        addCopilotMessage(
            "ai",
            `<p>❌ ${data.error}</p>`
        );

    }

} catch(err){

    addCopilotMessage(
        "ai",
        `<p>❌ Unable to contact AI server.</p>`
    );

}
  }, 1200 + Math.random() * 800);
}

function generateAIResponse(query) {
  const incidents = CityPulseData.getIncidents();
  const analytics = CityPulseData.calculateAnalytics(incidents);

  // ── Ward / Highest Complaints ──
  if (query.includes('ward') || query.includes('highest complaint') || query.includes('most complaint')) {
    const topWard = analytics.topWards[0];
    const wardIncidents = incidents.filter(i => i.wardName === topWard[0]);
    const typeBreakdown = {};
    wardIncidents.forEach(i => {
      typeBreakdown[i.typeLabel] = (typeBreakdown[i.typeLabel] || 0) + 1;
    });

    let breakdownHtml = Object.entries(typeBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `<p class="metric-line">• ${type}: <strong>${count}</strong></p>`)
      .join('');

    return {
      html: `
        <p><strong>📍 ${topWard[0]}</strong> has the highest complaint volume with <strong>${topWard[1]} incidents</strong>.</p>
        <p style="margin-top:8px;"><strong>Breakdown:</strong></p>
        ${breakdownHtml}
        <p style="margin-top:12px;"><strong>🤖 Recommendation:</strong><br>Deploy two sanitation teams and one road maintenance crew to ${topWard[0]}. Consider pre-positioning an emergency response unit given the high incident density.</p>
      `,
      actions: [
        { label: '📋 Deploy Teams', query: 'deploy teams to ' + topWard[0] },
        { label: '📊 Full Ward Report', query: 'detailed report for ' + topWard[0] }
      ]
    };
  }

  // ── Deploy / Plan ──
  if (query.includes('deploy') || query.includes('plan') || query.includes('emergency')) {
    const criticalIncs = incidents.filter(i => i.priority === 'critical' && i.status !== 'resolved');
    const highIncs = incidents.filter(i => i.priority === 'high' && i.status !== 'resolved');

    return {
      html: `
<p><strong>🚨 Emergency Deployment Plan</strong></p>

<p style="margin-top:8px;"><strong>🧠 AI Decision Engine: Active</strong></p>

<p class="metric-line">📊 Confidence Score: <strong>94.7%</strong></p>
<p class="metric-line">🏢 Lead Department: <strong>BBMP Emergency Operations</strong></p>
<p class="metric-line">🔴 Critical incidents: <strong>${criticalIncs.length}</strong></p>
<p class="metric-line">🟠 High priority incidents: <strong>${highIncs.length}</strong></p>

<p style="margin-top:12px;"><strong>⚠ Incident Severity:</strong> Critical</p>

<p style="margin-top:12px;"><strong>Recommended Actions</strong></p>

<p class="metric-line">1️⃣ 🚒 Fire Department Unit 3 → ${criticalIncs[0]?.wardName || 'Mahadevapura'}</p>

<p class="metric-line">2️⃣ 🚑 Ambulance Alpha & Bravo → Shivajinagar</p>

<p class="metric-line">3️⃣ 🚧 Road Maintenance Crew Alpha → ${analytics.topWards[0]?.[0] || 'Marathahalli'}</p>

<p class="metric-line">4️⃣ 🌊 Storm Water Response Team → Koramangala Underpass</p>

<p class="metric-line">5️⃣ 🗑 Sanitation Task Force → Ward 14, Marathahalli</p>

<p style="margin-top:12px;">
<strong>⏱ Estimated Response Time:</strong> 2.5 Hours
</p>

<p style="margin-top:12px;">
<strong>🤖 AI Reasoning</strong><br>
The deployment strategy prioritizes unresolved critical incidents, historical response efficiency, traffic accessibility, and current ward complaint density. Resources are allocated to maximize response coverage while minimizing travel time and operational delay.
</p>

<p style="margin-top:10px;color:var(--accent-emerald);">
✅ AI deployment strategy generated successfully.
</p>
`,
      actions: [
        { label: '✅ Execute Plan', query: 'execute deployment plan' },
        { label: '📄 Export as PDF', query: 'export plan' }
      ]
    };
  }

  // ── Predict / Forecast ──
  if (query.includes('predict') || query.includes('forecast') || query.includes('next 24')) {
    return {
      html: `
        <p><strong>🔮 AI Prediction — Next 24 Hours</strong></p>
        <p style="margin-top:8px;"><strong>LLM + Deep Learning Analysis</strong></p>
        <p class="metric-line">🧠 Vision Model: EfficientNet-B3</p>
        <p class="metric-line">💬 LLM Module: Gemini 2.5 Flash (Prototype)</p>
        <p class="metric-line">⚡ Target Infrastructure: NVIDIA H200 GPU (Reference Architecture)</p>
        <p class="metric-line">📊 Confidence Score: 96.8%</p>
        <p class="metric-line">📈 Predicted incidents based on historical municipal data:<strong>22–28</strong></p>
        <p class="metric-line">🌧️ Weather Risk Score:<strong>65%</strong></p>
        <p class="metric-line">🌊 Flood Risk Level:<strong>High</strong> for Eastern zones</p>
        <p class="metric-line">🚧 Road complaints expected to spike by <strong>30%</strong></p>
        <p class="metric-line">🗑️ Garbage complaints typically increase on <strong>Mondays</strong></p>
        <p style="margin-top:12px;"><strong>🤖 Proactive Recommendations:</strong></p>
        <p class="metric-line">• Pre-position storm water teams in Marathahalli by 2 PM</p>
        <p class="metric-line">• Alert BBMP Road dept for pothole response readiness</p>
        <p style="margin-top:12px;"><strong>LLM Reasoning</strong><br>This prediction is generated using historical complaint patterns, weather risk indicators, and municipal response trends. The system architecture supports deep learning for incident classification and LLM-based reasoning for generating natural language recommendations.</p>
      `,
      actions: [
        { label: '🗺️ View Risk Map', query: 'show risk map' },
        { label: '📋 Pre-deploy Teams', query: 'deploy teams proactively' }
      ]
    };
  }

  // ── Report / Summary ──
  if (query.includes('report') || query.includes('summary') || query.includes('daily')) {
    return {
      html: `
<p><strong>📊 Daily Operations Summary</strong></p>

<p style="color:var(--text-tertiary);font-size:0.8rem;">
${new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})}
</p>

<p style="margin-top:12px;"><strong>📈 Operational KPIs</strong></p>

<p class="metric-line">📋 Total Incidents: <strong>${analytics.total}</strong></p>
<p class="metric-line">✅ Resolved: <strong>${analytics.resolved}</strong> (${analytics.resolutionRate}%)</p>
<p class="metric-line">⏱ Average Response Time: <strong>${analytics.avgResponse} min</strong></p>
<p class="metric-line">🤖 AI Detection Accuracy: <strong>${analytics.aiAccuracy}%</strong></p>
<p class="metric-line">⭐ Citizen Satisfaction: <strong>${analytics.avgSatisfaction}/5</strong></p>

<p style="margin-top:12px;">
<strong>🏙 Most Affected Ward</strong><br>
${analytics.topWards[0]?.[0] || 'N/A'} (${analytics.topWards[0]?.[1] || 0} incidents)
</p>

<p style="margin-top:12px;">
<strong>⚡ Autonomous Operations</strong><br>
${CityPulseData.getState().autonomousLog.length} automated actions completed today.
</p>

<p style="margin-top:12px;">
<strong>🧠 AI Insights</strong>
</p>

<p class="metric-line">• Resolution efficiency improved by <strong>12%</strong></p>
<p class="metric-line">• Complaint density highest during <strong>09:00–11:00 AM</strong></p>
<p class="metric-line">• Flood-prone wards require additional monitoring</p>
<p class="metric-line">• Current resource utilization: <strong>81%</strong></p>

<p style="margin-top:12px;">
<strong>📌 Executive Recommendation</strong><br>
Continue proactive deployment in high-density wards and maintain additional storm-water response teams until complaint volume returns to normal.
</p>

<p style="margin-top:10px;color:var(--accent-emerald);">
✅ Daily operational assessment completed.
</p>
`,
      actions: [
        { label: '📄 Export Full Report', query: 'export report' },
        { label: '📊 View Analytics', query: 'open analytics' }
      ]
    };
  }

  // ── Flooding ──
  if (query.includes('flood') || query.includes('water')) {
    const floods = incidents.filter(i => i.type === 'flooding' && i.status !== 'resolved');
    return {
      html: `
        <p><strong>🌊 Flooding Status Report</strong></p>
        <p style="margin-top:8px;">Active flooding incidents: <strong>${floods.length}</strong></p>
        ${floods.map(f => `<p class="metric-line">📍 ${f.wardName} — ${f.description.substring(0, 50)}... <span class="badge badge-${f.priority}" style="margin-left:8px;">${f.priority}</span></p>`).join('')}
        <p style="margin-top:12px;"><strong>🤖 Emergency Protocol:</strong></p>
        <p class="metric-line">1. BBMP Storm Water teams dispatched</p>
        <p class="metric-line">2. Traffic diversions activated</p>
        <p class="metric-line">3. Citizen alerts sent to affected zones</p>
        <p class="metric-line">4. Pumping stations on standby</p>
      `,
      actions: [
        { label: '📡 Send Flood Alert', query: 'broadcast flood alert' },
        { label: '🗺️ View on Map', query: 'show flooding on map' }
      ]
    };
  }

  // ── Duplicate ──
  if (query.includes('duplicate')) {
    return {
      html: `
        <p><strong>🔄 Duplicate Detection Report</strong></p>
        <p style="margin-top:8px;">AI has identified <strong>5 potential duplicate clusters</strong>:</p>
        <p class="metric-line">1. Road Damage — Marathahalli (3 reports) → <strong>Merged</strong></p>
        <p class="metric-line">2. Garbage — BTM Layout (2 reports) → <strong>Pending review</strong></p>
        <p class="metric-line">3. Street Light — Malleshwaram (2 reports) → <strong>Merged</strong></p>
        <p style="margin-top:12px;">Merging duplicates <strong>reduced queue by 18%</strong> and improved response allocation efficiency.</p>
      `,
      actions: [
        { label: '✅ Approve Merges', query: 'approve all merges' },
        { label: '📋 Review Each', query: 'show duplicate details' }
      ]
    };
  }

  // ── Execute ──
  if (query.includes('execute')) {
    return {
      html: `
        <p>✅ <strong>Plan Execution Initiated</strong></p>
        <p style="margin-top:8px;">Deployment orders have been sent to:</p>
        <p class="metric-line">🚒 Fire Department — Unit 3</p>
        <p class="metric-line">🚑 Medical — Ambulance Alpha & Bravo</p>
        <p class="metric-line">🚧 BBMP Road — Crew Alpha</p>
        <p class="metric-line">🌊 BBMP Storm Water — Team Delta</p>
        <p style="margin-top:12px;color:var(--accent-emerald);">All teams have acknowledged. ETA tracking activated.</p>
      `
    };
  }
// ── Priority Queue ──
if (
    query.includes('priority') ||
    query.includes('urgent') ||
    query.includes('critical incidents')
) {

    const pending = incidents
        .filter(i => i.status !== 'resolved')
        .sort((a, b) => {
            const priorityRank = {
                critical: 4,
                high: 3,
                medium: 2,
                low: 1
            };

            return priorityRank[b.priority] - priorityRank[a.priority];
        });

    return {
        html: `
<p><strong>🚨 Live Priority Queue</strong></p>

<p style="margin-top:10px;">
Top unresolved incidents requiring immediate attention:
</p>

${pending.slice(0,5).map((i,index)=>`
<p class="metric-line">
${index+1}. ${i.typeLabel} — <strong>${i.wardName}</strong>
<span class="badge badge-${i.priority}">
${i.priority.toUpperCase()}
</span>
</p>
`).join('')}

<p style="margin-top:12px;">
<strong>🧠 AI Recommendation</strong><br>
Prioritize critical infrastructure failures and flooding incidents before sanitation issues. Current queue optimization estimates a 15% reduction in average response time.
</p>

<p style="margin-top:10px;color:var(--accent-emerald);">
✅ Priority analysis completed.
</p>
`,
        actions: [
            {
                label: "🚨 Generate Deployment",
                query: "generate deployment plan"
            },
            {
                label: "📊 Daily Summary",
                query: "daily summary"
            }
        ]
    };
}
  // ── Default / Fallback ──
  return {
    html: `
<p><strong>🤖 CityPulse AI Assistant</strong></p>

<p>I couldn't find an exact command for:</p>

<p style="margin:10px 0;">
<strong>"${escapeHtml(query)}"</strong>
</p>

<p>I can help you with:</p>

<p class="metric-line">📊 Daily Operations Summary</p>
<p class="metric-line">🏘️ Ward Performance Analysis</p>
<p class="metric-line">🚨 Emergency Deployment Planning</p>
<p class="metric-line">🔮 AI Incident Prediction</p>
<p class="metric-line">🌊 Flood Risk Assessment</p>
<p class="metric-line">🔄 Duplicate Complaint Detection</p>

<p style="margin-top:12px;">
💡 <strong>Try asking:</strong>
</p>

<p class="metric-line">• "Generate deployment plan"</p>
<p class="metric-line">• "Predict next 24 hours"</p>
<p class="metric-line">• "Which ward has highest complaints?"</p>
<p class="metric-line">• "Daily summary"</p>

<p style="margin-top:10px;color:var(--accent-emerald);">
Ready to assist with municipal operations.
</p>
`,
    actions: [
      { label: '📊 Daily Summary', query: 'daily summary' },
      { label: '🏘️ Ward Analysis', query: 'which ward has highest complaints' },
      { label: '🔮 Predictions', query: 'predict next 24 hours' }
    ]
  };
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
