/* ============================================
   CityPulse AI — Analytics Panel (Chart.js)
   ============================================ */

let chartInstances = {};

function renderAnalytics() {
  const analytics = CityPulseData.calculateAnalytics(CityPulseData.getIncidents());

  // ── KPI Cards ──
  const kpiRow = document.getElementById('kpi-row');
  kpiRow.innerHTML = `
    <div class="card kpi-card" style="animation:slide-in-up 0.3s ease forwards;">
      <div class="kpi-icon blue">📊</div>
      <div>
        <div class="card-title">Total Incidents</div>
        <div class="card-value">${analytics.total}</div>
        <div class="card-trend up">▲ ${analytics.unresolved} active</div>
      </div>
    </div>
    <div class="card kpi-card" style="animation:slide-in-up 0.3s ease 0.05s forwards; opacity:0;">
      <div class="kpi-icon amber">⏱</div>
      <div>
        <div class="card-title">Avg Response Time</div>
        <div class="card-value">${analytics.avgResponse}<span style="font-size:0.9rem;font-weight:400;"> min</span></div>
        <div class="card-trend ${analytics.avgResponse > 40 ? 'down' : 'up'}">
          ${analytics.avgResponse > 40 ? '▲ 12% slower' : '▼ 8% faster'}
        </div>
      </div>
    </div>
    <div class="card kpi-card" style="animation:slide-in-up 0.3s ease 0.1s forwards; opacity:0;">
      <div class="kpi-icon emerald">✅</div>
      <div>
        <div class="card-title">Resolution Rate</div>
        <div class="card-value">${analytics.resolutionRate}<span style="font-size:0.9rem;font-weight:400;">%</span></div>
        <div class="card-trend up">▲ 5% improvement</div>
      </div>
    </div>
    <div class="card kpi-card" style="animation:slide-in-up 0.3s ease 0.15s forwards; opacity:0;">
      <div class="kpi-icon purple">🤖</div>
      <div>
        <div class="card-title">AI Accuracy</div>
        <div class="card-value">${analytics.aiAccuracy}<span style="font-size:0.9rem;font-weight:400;">%</span></div>
        <div class="card-trend up">▲ 2.1% improved</div>
      </div>
    </div>
    <div class="card kpi-card" style="animation:slide-in-up 0.3s ease 0.2s forwards; opacity:0;">
      <div class="kpi-icon rose">⭐</div>
      <div>
        <div class="card-title">Citizen Satisfaction</div>
        <div class="card-value">${analytics.avgSatisfaction}<span style="font-size:0.9rem;font-weight:400;">/5</span></div>
        <div class="card-trend up">▲ 0.3 increase</div>
      </div>
    </div>
  `;

  // ── Charts ──
  const chartsGrid = document.getElementById('charts-grid');
  chartsGrid.innerHTML = `
    <div class="chart-card">
      <div class="chart-card-header">
        <span class="chart-card-title">📈 Incident Trend (7 Days)</span>
      </div>
      <div class="chart-container"><canvas id="chart-trend"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header">
        <span class="chart-card-title">🏘️ Incidents by Ward (Top 10)</span>
      </div>
      <div class="chart-container"><canvas id="chart-wards"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header">
        <span class="chart-card-title">📋 Incidents by Type</span>
      </div>
      <div class="chart-container"><canvas id="chart-types"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header">
        <span class="chart-card-title">📊 Resolution Status</span>
      </div>
      <div class="chart-container"><canvas id="chart-status"></canvas></div>
    </div>
    <div class="chart-card" style="grid-column: span 2;">
      <div class="chart-card-header">
        <span class="chart-card-title">🏢 Department Workload</span>
      </div>
      <div class="chart-container"><canvas id="chart-depts"></canvas></div>
    </div>
  `;

  // Destroy old chart instances
  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.08)';
  const textColor = isDark ? '#94A3B8' : '#64748B';

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1A1F37' : '#fff',
        titleColor: isDark ? '#F1F5F9' : '#0F172A',
        bodyColor: isDark ? '#94A3B8' : '#475569',
        borderColor: isDark ? 'rgba(148,163,184,0.15)' : '#E2E8F0',
        borderWidth: 1,
        cornerRadius: 10,
        padding: 12,
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'Inter' }
      }
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter', size: 11 } } }
    },
    animation: { duration: 800, easing: 'easeOutQuart' }
  };

  // ── Area Chart: Trend ──
  chartInstances.trend = new Chart(document.getElementById('chart-trend'), {
    type: 'line',
    data: {
      labels: analytics.trendData.map(d => d.label),
      datasets: [{
        data: analytics.trendData.map(d => d.count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: isDark ? '#111827' : '#fff',
        pointBorderWidth: 2
      }]
    },
    options: baseOptions
  });

  // ── Bar Chart: Wards ──
  chartInstances.wards = new Chart(document.getElementById('chart-wards'), {
    type: 'bar',
    data: {
      labels: analytics.topWards.map(w => w[0]),
      datasets: [{
        data: analytics.topWards.map(w => w[1]),
        backgroundColor: analytics.topWards.map((_, i) => {
          const colors = ['#3B82F6', '#60A5FA', '#8B5CF6', '#A78BFA', '#06B6D4', '#22D3EE', '#10B981', '#F59E0B', '#F97316', '#EF4444'];
          return colors[i % colors.length] + '80';
        }),
        borderColor: analytics.topWards.map((_, i) => {
          const colors = ['#3B82F6', '#60A5FA', '#8B5CF6', '#A78BFA', '#06B6D4', '#22D3EE', '#10B981', '#F59E0B', '#F97316', '#EF4444'];
          return colors[i % colors.length];
        }),
        borderWidth: 1.5,
        borderRadius: 6
      }]
    },
    options: baseOptions
  });

  // ── Pie Chart: Types ──
  const typeData = Object.values(analytics.byType).filter(t => t.count > 0);
  chartInstances.types = new Chart(document.getElementById('chart-types'), {
    type: 'pie',
    data: {
      labels: typeData.map(t => t.icon + ' ' + t.label),
      datasets: [{
        data: typeData.map(t => t.count),
        backgroundColor: typeData.map(t => t.color + '90'),
        borderColor: typeData.map(t => t.color),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: textColor, font: { family: 'Inter', size: 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 10 }
        },
        tooltip: baseOptions.plugins.tooltip
      },
      animation: { duration: 800, easing: 'easeOutQuart' }
    }
  });

  // ── Doughnut: Status ──
  const statusLabels = ['Reported', 'Assigned', 'Dispatched', 'Resolved'];
  const statusColors = ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981'];
  chartInstances.status = new Chart(document.getElementById('chart-status'), {
    type: 'doughnut',
    data: {
      labels: statusLabels,
      datasets: [{
        data: [analytics.byStatus.reported, analytics.byStatus.assigned, analytics.byStatus.dispatched, analytics.byStatus.resolved],
        backgroundColor: statusColors.map(c => c + '80'),
        borderColor: statusColors,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: { color: textColor, font: { family: 'Inter', size: 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 10 }
        },
        tooltip: baseOptions.plugins.tooltip
      },
      animation: { duration: 800, easing: 'easeOutQuart' }
    }
  });

  // ── Horizontal Bar: Departments ──
  const deptData = Object.values(analytics.byDept).filter(d => d.count > 0);
  chartInstances.depts = new Chart(document.getElementById('chart-depts'), {
    type: 'bar',
    data: {
      labels: deptData.map(d => d.icon + ' ' + d.name),
      datasets: [{
        data: deptData.map(d => d.count),
        backgroundColor: ['#3B82F680', '#10B98180', '#EF444480', '#06B6D480', '#F59E0B80', '#8B5CF680', '#F43F5E80', '#06B6D480'],
        borderColor: ['#3B82F6', '#10B981', '#EF4444', '#06B6D4', '#F59E0B', '#8B5CF6', '#F43F5E', '#06B6D4'],
        borderWidth: 1.5,
        borderRadius: 6
      }]
    },
    options: {
      ...baseOptions,
      indexAxis: 'y'
    }
  });

  // ── Ward Heatmap ──
  renderHeatmap(analytics);
}

function renderHeatmap(analytics) {
  const container = document.getElementById('ward-heatmap');
  const incidents = CityPulseData.getIncidents();

  const wardCounts = {};
  CityPulseData.wards.forEach(w => { wardCounts[w.name] = 0; });
  incidents.forEach(i => { if (wardCounts[i.wardName] !== undefined) wardCounts[i.wardName]++; });

  const maxCount = Math.max(...Object.values(wardCounts), 1);

  container.innerHTML = CityPulseData.wards.map(w => {
    const count = wardCounts[w.name] || 0;
    const intensity = Math.min(Math.floor((count / maxCount) * 5), 4);
    return `
      <div class="heat-cell heat-${intensity}" title="${w.name}: ${count} incidents">
        <div class="cell-name">${w.name}</div>
        <div class="cell-count">${count}</div>
      </div>
    `;
  }).join('');
}
