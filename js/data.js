/* ============================================
   CityPulse AI — Data Engine
   Simulated incident data for Bangalore (BBMP)
   ============================================ */

const CityPulseData = (() => {
  // ── Ward Data ──
  const wards = [
    { id: 1, name: 'Mahadevapura', lat: 12.9956, lng: 77.6970 },
    { id: 2, name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
    { id: 3, name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
    { id: 4, name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
    { id: 5, name: 'Jayanagar', lat: 12.9308, lng: 77.5838 },
    { id: 6, name: 'Rajajinagar', lat: 12.9883, lng: 77.5563 },
    { id: 7, name: 'Malleshwaram', lat: 12.9965, lng: 77.5713 },
    { id: 8, name: 'Basavanagudi', lat: 12.9422, lng: 77.5737 },
    { id: 9, name: 'Yelahanka', lat: 13.1007, lng: 77.5963 },
    { id: 10, name: 'Hebbal', lat: 13.0358, lng: 77.5970 },
    { id: 11, name: 'BTM Layout', lat: 12.9166, lng: 77.6101 },
    { id: 12, name: 'HSR Layout', lat: 12.9116, lng: 77.6474 },
    { id: 13, name: 'Electronic City', lat: 12.8399, lng: 77.6770 },
    { id: 14, name: 'Marathahalli', lat: 12.9591, lng: 77.7018 },
    { id: 15, name: 'JP Nagar', lat: 12.9063, lng: 77.5857 },
    { id: 16, name: 'Banashankari', lat: 12.9255, lng: 77.5468 },
    { id: 17, name: 'KR Puram', lat: 13.0098, lng: 77.6969 },
    { id: 18, name: 'Peenya', lat: 13.0285, lng: 77.5180 },
    { id: 19, name: 'Bommanahalli', lat: 12.9015, lng: 77.6186 },
    { id: 20, name: 'RR Nagar', lat: 12.9587, lng: 77.5149 },
    { id: 21, name: 'Shivajinagar', lat: 12.9857, lng: 77.6057 },
    { id: 22, name: 'Chamrajpet', lat: 12.9630, lng: 77.5720 },
    { id: 23, name: 'Dasarahalli', lat: 13.0451, lng: 77.5130 },
    { id: 24, name: 'Majestic', lat: 12.9767, lng: 77.5713 },
    { id: 25, name: 'Sarjapur Road', lat: 12.9100, lng: 77.6850 }
  ];

  // ── Department Data ──
  const departments = [
    { id: 'bbmp-road', name: 'BBMP Road Maintenance', icon: '🚧', color: '#F97316' },
    { id: 'bbmp-sanitation', name: 'BBMP Sanitation', icon: '🗑️', color: '#10B981' },
    { id: 'fire-dept', name: 'Fire Department', icon: '🚒', color: '#EF4444' },
    { id: 'bwssb', name: 'BWSSB (Water Supply)', icon: '💧', color: '#3B82F6' },
    { id: 'bescom', name: 'BESCOM (Electricity)', icon: '⚡', color: '#F59E0B' },
    { id: 'traffic-police', name: 'Traffic Police', icon: '🚔', color: '#8B5CF6' },
    { id: 'medical', name: 'Medical Emergency', icon: '🚑', color: '#F43F5E' },
    { id: 'bbmp-storm', name: 'BBMP Storm Water', icon: '🌊', color: '#06B6D4' }
  ];

  // ── Incident Types ──
  const incidentTypes = [
    { id: 'fire', label: 'Fire', icon: '🔥', color: '#EF4444', dept: 'fire-dept', priority: 'critical' },
    { id: 'flooding', label: 'Flooding', icon: '🌊', color: '#06B6D4', dept: 'bbmp-storm', priority: 'high' },
    { id: 'road-damage', label: 'Road Damage', icon: '🚧', color: '#F97316', dept: 'bbmp-road', priority: 'medium' },
    { id: 'medical', label: 'Medical Emergency', icon: '🚑', color: '#F43F5E', dept: 'medical', priority: 'critical' },
    { id: 'streetlight', label: 'Street Light Failure', icon: '💡', color: '#F59E0B', dept: 'bescom', priority: 'low' },
    { id: 'garbage', label: 'Garbage Overflow', icon: '🗑️', color: '#10B981', dept: 'bbmp-sanitation', priority: 'medium' },
    { id: 'water-supply', label: 'Water Supply Issue', icon: '💧', color: '#3B82F6', dept: 'bwssb', priority: 'high' },
    { id: 'sewage', label: 'Sewage Overflow', icon: '🚰', color: '#8B5CF6', dept: 'bwssb', priority: 'high' },
    { id: 'traffic', label: 'Traffic Signal Issue', icon: '🚦', color: '#F59E0B', dept: 'traffic-police', priority: 'medium' },
    { id: 'noise', label: 'Noise Complaint', icon: '📢', color: '#94A3B8', dept: 'traffic-police', priority: 'low' }
  ];

  const statusSteps = [
    'Citizen Reported',
    'AI Classified',
    'Department Assigned',
    'Team Dispatched',
    'Work Started',
    'Resolved',
    'Citizen Feedback'
  ];

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  // ── Helper Functions ──
  function generateId() {
    return 'INC-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
  }

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getTimeAgo(minutes) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - minutes);
    return d.toISOString();
  }

  function formatTime(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatRelative(isoStr) {
    const diff = (Date.now() - new Date(isoStr).getTime()) / 60000;
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  }

  // ── Generate Timeline Steps for an Incident ──
  function generateTimeline(createdAt, statusIndex) {
    const steps = [];
    let time = new Date(createdAt);
    for (let i = 0; i <= Math.min(statusIndex, statusSteps.length - 1); i++) {
      steps.push({
        step: statusSteps[i],
        time: time.toISOString(),
        completed: i < statusIndex,
        active: i === statusIndex
      });
      time = new Date(time.getTime() + randomBetween(3, 45) * 60000);
    }
    // Add pending future steps
    for (let i = statusIndex + 1; i < statusSteps.length; i++) {
      steps.push({
        step: statusSteps[i],
        time: null,
        completed: false,
        active: false
      });
    }
    return steps;
  }

  // ── Citizen Complaint Descriptions ──
  const complaintDescriptions = {
    'fire': [
      'Electrical fire in apartment complex, smoke visible from 3rd floor',
      'Small bush fire near empty plot, spreading towards houses',
      'Fire reported at commercial building, fire alarms activated',
      'Kitchen fire at restaurant, staff evacuated safely'
    ],
    'flooding': [
      'Severe waterlogging on main road after heavy rainfall, vehicles stranded',
      'Basement flooding in residential apartment, water level rising',
      'Storm drain blocked, water flooding into shops on ground floor',
      'Underpass completely flooded, traffic diverted'
    ],
    'road-damage': [
      'Large pothole on main road causing accidents, multiple vehicles damaged',
      'Road surface completely broken after recent rains, dangerous for two-wheelers',
      'Cave-in near construction site, road barricaded by locals',
      'Manhole cover missing on busy intersection'
    ],
    'medical': [
      'Person collapsed near bus stop, possibly cardiac arrest, need ambulance',
      'Road accident with injuries, two-wheeler collision with auto',
      'Elderly person found unconscious in park, bystanders providing first aid',
      'Chemical exposure at factory, workers feeling dizzy'
    ],
    'streetlight': [
      'Entire street dark for 3 days, multiple lights not working',
      'Flickering street light near school, dangerous for pedestrians at night',
      'New LED lights installed but not functioning, wiring issue suspected',
      'Street light pole tilting dangerously after storm'
    ],
    'garbage': [
      'Garbage not collected for 5 days, pile-up near residential area',
      'Overflowing bins at market area, stray dogs creating nuisance',
      'Construction debris dumped on sidewalk, blocking pedestrian path',
      'Dead animal on road not cleared, strong odor spreading'
    ],
    'water-supply': [
      'No water supply for 2 days in entire layout, tanker service needed',
      'Contaminated water from Cauvery supply, brown color and bad smell',
      'Water pipeline burst, water wasting on road for 6 hours',
      'Low water pressure in upper floors, unable to fill tanks'
    ],
    'sewage': [
      'Sewage overflowing on main road, health hazard for residents',
      'Drain blockage causing sewage backup into homes',
      'Manhole overflowing near school, children at health risk',
      'Open drain not covered, child fell in yesterday'
    ],
    'traffic': [
      'Traffic signal not working at major junction, causing jams during peak hours',
      'Signal timing incorrect, green phase too short for main road',
      'New signal needed at accident-prone intersection',
      'Pedestrian crossing signal broken for a week'
    ],
    'noise': [
      'Construction noise after 10 PM violating noise regulations',
      'Loudspeaker being used beyond permitted hours',
      'Factory noise disturbing residential area throughout the day',
      'Late night partying in commercial area, disturbing sleep'
    ]
  };

  const citizenNames = [
    'Ramesh Kumar', 'Priya Sharma', 'Suresh Gowda', 'Lakshmi Devi',
    'Mohammed Ismail', 'Ananya Rao', 'Karthik Shetty', 'Meena Kumari',
    'Rajesh Naidu', 'Deepa Murthy', 'Arjun Reddy', 'Kavitha Patil',
    'Naveen Singh', 'Sunita Bhat', 'Venkatesh Iyer', 'Pooja Nair',
    'Akash Jain', 'Divya Hegde', 'Ganesh Acharya', 'Reshma Begum'
  ];

  // ── Generate Seed Incidents ──
  function generateSeedIncidents() {
    const incidents = [];
    const now = Date.now();

    const seeds = [
      { type: 'flooding', ward: 14, minsAgo: 12, status: 1, priority: 'critical' },
      { type: 'flooding', ward: 3, minsAgo: 25, status: 2, priority: 'high' },
      { type: 'fire', ward: 1, minsAgo: 8, status: 3, priority: 'critical' },
      { type: 'road-damage', ward: 11, minsAgo: 45, status: 4, priority: 'high' },
      { type: 'road-damage', ward: 4, minsAgo: 120, status: 5, priority: 'medium' },
      { type: 'medical', ward: 21, minsAgo: 5, status: 1, priority: 'critical' },
      { type: 'medical', ward: 10, minsAgo: 35, status: 4, priority: 'critical' },
      { type: 'streetlight', ward: 7, minsAgo: 300, status: 3, priority: 'low' },
      { type: 'streetlight', ward: 16, minsAgo: 420, status: 2, priority: 'low' },
      { type: 'garbage', ward: 14, minsAgo: 180, status: 3, priority: 'medium' },
      { type: 'garbage', ward: 5, minsAgo: 90, status: 2, priority: 'medium' },
      { type: 'garbage', ward: 19, minsAgo: 60, status: 1, priority: 'medium' },
      { type: 'water-supply', ward: 2, minsAgo: 150, status: 4, priority: 'high' },
      { type: 'water-supply', ward: 9, minsAgo: 40, status: 2, priority: 'high' },
      { type: 'sewage', ward: 12, minsAgo: 200, status: 5, priority: 'high' },
      { type: 'sewage', ward: 13, minsAgo: 55, status: 2, priority: 'high' },
      { type: 'traffic', ward: 24, minsAgo: 15, status: 1, priority: 'medium' },
      { type: 'road-damage', ward: 14, minsAgo: 100, status: 3, priority: 'high' },
      { type: 'fire', ward: 18, minsAgo: 480, status: 6, priority: 'critical' },
      { type: 'flooding', ward: 17, minsAgo: 30, status: 2, priority: 'high' },
      { type: 'noise', ward: 4, minsAgo: 240, status: 3, priority: 'low' },
      { type: 'road-damage', ward: 6, minsAgo: 360, status: 5, priority: 'medium' },
      { type: 'garbage', ward: 8, minsAgo: 500, status: 6, priority: 'low' },
      { type: 'water-supply', ward: 15, minsAgo: 70, status: 3, priority: 'high' },
      { type: 'streetlight', ward: 20, minsAgo: 600, status: 6, priority: 'low' },
      { type: 'medical', ward: 22, minsAgo: 700, status: 6, priority: 'critical' },
      { type: 'flooding', ward: 25, minsAgo: 18, status: 1, priority: 'high' },
      { type: 'road-damage', ward: 23, minsAgo: 140, status: 4, priority: 'medium' }
    ];

    seeds.forEach((seed, i) => {
      const typeData = incidentTypes.find(t => t.id === seed.type);
      const ward = wards.find(w => w.id === seed.ward);
      const createdAt = new Date(now - seed.minsAgo * 60000).toISOString();
      const descriptions = complaintDescriptions[seed.type];

      const statusVal = seed.status >= 6 ? 'resolved' :
                        seed.status >= 4 ? 'dispatched' :
                        seed.status >= 2 ? 'assigned' : 'reported';

      incidents.push({
        id: 'INC-' + String(1000 + i).substring(1) + String.fromCharCode(65 + i % 26) + randomBetween(10, 99),
        type: seed.type,
        typeLabel: typeData.label,
        typeIcon: typeData.icon,
        typeColor: typeData.color,
        priority: seed.priority,
        status: statusVal,
        statusIndex: seed.status,
        ward: ward.id,
        wardName: ward.name,
        lat: ward.lat + (Math.random() - 0.5) * 0.01,
        lng: ward.lng + (Math.random() - 0.5) * 0.01,
        description: randomFrom(descriptions),
        citizen: randomFrom(citizenNames),
        citizenPhone: '+91 ' + randomBetween(70000, 99999) + ' ' + randomBetween(10000, 99999),
        department: typeData.dept,
        departmentName: departments.find(d => d.id === typeData.dept).name,
        createdAt: createdAt,
        updatedAt: new Date(now - randomBetween(0, seed.minsAgo) * 60000).toISOString(),
        timeline: generateTimeline(createdAt, seed.status),
        aiConfidence: randomBetween(82, 99),
        eta: seed.status < 5 ? randomBetween(1, 6) + ' hours' : null,
        feedback: seed.status >= 6 ? randomBetween(3, 5) : null,
        duplicate: false,
        merged: false
      });
    });

    return incidents;
  }

  // ── Generate New Random Incident ──
  function generateNewIncident() {
    const type = randomFrom(incidentTypes);
    const ward = randomFrom(wards);
    const now = new Date().toISOString();
    const descriptions = complaintDescriptions[type.id];

    return {
      id: generateId(),
      type: type.id,
      typeLabel: type.label,
      typeIcon: type.icon,
      typeColor: type.color,
      priority: type.priority,
      status: 'reported',
      statusIndex: 0,
      ward: ward.id,
      wardName: ward.name,
      lat: ward.lat + (Math.random() - 0.5) * 0.01,
      lng: ward.lng + (Math.random() - 0.5) * 0.01,
      description: randomFrom(descriptions),
      citizen: randomFrom(citizenNames),
      citizenPhone: '+91 ' + randomBetween(70000, 99999) + ' ' + randomBetween(10000, 99999),
      department: type.dept,
      departmentName: departments.find(d => d.id === type.dept).name,
      createdAt: now,
      updatedAt: now,
      timeline: generateTimeline(now, 0),
      aiConfidence: randomBetween(82, 99),
      eta: randomBetween(2, 8) + ' hours',
      feedback: null,
      duplicate: false,
      merged: false,
      isNew: true
    };
  }

  // ── Notifications Data ──
  function generateNotifications(incidents) {
    const notifications = [];
    const recent = incidents.filter(i => {
      const diff = (Date.now() - new Date(i.createdAt).getTime()) / 60000;
      return diff < 120;
    });

    recent.slice(0, 8).forEach(inc => {
      notifications.push({
        id: 'notif-' + Math.random().toString(36).substring(2, 8),
        type: inc.priority === 'critical' ? 'critical' : 'info',
        title: inc.priority === 'critical' ? '🚨 Critical: ' + inc.typeLabel : '🆕 New: ' + inc.typeLabel,
        message: inc.wardName + ' — ' + inc.description.substring(0, 60) + '...',
        time: inc.createdAt,
        read: Math.random() > 0.6,
        incidentId: inc.id
      });
    });

    // Add system notifications
    notifications.unshift({
      id: 'notif-sys-1',
      type: 'warning',
      title: '⚠️ Flood Alert',
      message: 'Heavy rainfall expected in Marathahalli and Whitefield zones',
      time: getTimeAgo(5),
      read: false
    });

    notifications.unshift({
      id: 'notif-sys-2',
      type: 'info',
      title: '🤖 AI Autonomous Action',
      message: '5 duplicate complaints merged — Ward 14 Road Damage',
      time: getTimeAgo(15),
      read: false
    });

    return notifications;
  }

  // ── Analytics Calculations ──
  function calculateAnalytics(incidents) {
    const total = incidents.length;
    const resolved = incidents.filter(i => i.status === 'resolved').length;
    const unresolved = total - resolved;
    const critical = incidents.filter(i => i.priority === 'critical' && i.status !== 'resolved').length;

    // Average response time (simulated)
    const avgResponse = randomBetween(28, 52);

    // Resolution rate
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // AI accuracy
    const aiAccuracy = 94.7;

    // Satisfaction
    const feedbacks = incidents.filter(i => i.feedback !== null);
    const avgSatisfaction = feedbacks.length > 0
      ? (feedbacks.reduce((sum, i) => sum + i.feedback, 0) / feedbacks.length).toFixed(1)
      : 4.2;

    // By type
    const byType = {};
    incidentTypes.forEach(t => {
      byType[t.id] = { label: t.label, icon: t.icon, color: t.color, count: 0 };
    });
    incidents.forEach(i => {
      if (byType[i.type]) byType[i.type].count++;
    });

    // By ward (top 10)
    const byWard = {};
    incidents.forEach(i => {
      if (!byWard[i.wardName]) byWard[i.wardName] = 0;
      byWard[i.wardName]++;
    });
    const topWards = Object.entries(byWard)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // By department
    const byDept = {};
    departments.forEach(d => {
      byDept[d.id] = { name: d.name, icon: d.icon, count: 0 };
    });
    incidents.forEach(i => {
      if (byDept[i.department]) byDept[i.department].count++;
    });

    // By status
    const byStatus = { reported: 0, assigned: 0, dispatched: 0, resolved: 0 };
    incidents.forEach(i => { byStatus[i.status]++; });

    // Trend data (last 7 days simulated)
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendData.push({
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        count: randomBetween(8, 28)
      });
    }
    trendData[trendData.length - 1].count = total;

    return {
      total, resolved, unresolved, critical,
      avgResponse, resolutionRate, aiAccuracy, avgSatisfaction,
      byType, topWards, byDept, byStatus, trendData
    };
  }

  // ── State Management & Backend Sync ──
  const BACKEND_URL = window.location.origin.includes('3000') 
    ? window.location.origin 
    : 'http://localhost:3000';

  let state = {
    incidents: [],
    notifications: [],
    autonomousMode: true,
    autonomousLog: [],
    division: 'Bangalore Urban',
    theme: 'dark',
    connectedToBackend: false
  };

  // Load from Backend API or fall back to localStorage
  function init() {
    const saved = localStorage.getItem('citypulse_data');
    if (saved) {
      try {
        state = JSON.parse(saved);
      } catch (e) {
        resetData();
      }
    } else {
      resetData();
    }

    // Try background sync with Node.js backend server
    syncWithBackend();

    return state;
  }

  async function syncWithBackend() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/incidents`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.incidents)) {
          state.incidents = data.incidents;
          state.connectedToBackend = true;
          save();
          // Dispatch custom event for UI updates
          window.dispatchEvent(new CustomEvent('citypulse_backend_synced'));
        }
      }
    } catch (e) {
      state.connectedToBackend = false;
    }
  }

  function save() {
    localStorage.setItem('citypulse_data', JSON.stringify(state));
  }

  function resetData() {
    state.incidents = generateSeedIncidents();
    state.notifications = generateNotifications(state.incidents);
    state.autonomousLog = [
      { time: getTimeAgo(15), action: 'Detected 5 duplicate road damage complaints in Ward 14', result: 'Merged into ticket INC-017A42' },
      { time: getTimeAgo(30), action: 'Auto-classified flooding report from Sarjapur Road', result: 'Assigned to BBMP Storm Water Drain dept' },
      { time: getTimeAgo(45), action: 'Predicted high complaint volume for Marathahalli zone', result: 'Pre-positioned 2 response teams' },
      { time: getTimeAgo(60), action: 'Identified medical emergency pattern in Shivajinagar', result: 'Escalated priority to Critical' },
      { time: getTimeAgo(90), action: 'Auto-resolved 3 street light complaints (BESCOM confirmed repair)', result: 'Updated status & notified citizens' }
    ];
    save();

    // Trigger backend reset if connected
    fetch(`${BACKEND_URL}/api/reset`, { method: 'POST' }).catch(() => {});
  }

  function getState() { return state; }
  function getIncidents() { return state.incidents; }
  function getNotifications() { return state.notifications; }

  function addIncident(incident) {
    state.incidents.unshift(incident);
    state.notifications.unshift({
      id: 'notif-' + Math.random().toString(36).substring(2, 8),
      type: incident.priority === 'critical' ? 'critical' : 'info',
      title: (incident.priority === 'critical' ? '🚨 Critical: ' : '🆕 New: ') + incident.typeLabel,
      message: incident.wardName + ' — ' + incident.description.substring(0, 60),
      time: incident.createdAt,
      read: false,
      incidentId: incident.id
    });
    save();

    // Post to backend API
    fetch(`${BACKEND_URL}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: incident.type,
        description: incident.description,
        wardId: incident.ward,
        citizenName: incident.citizen,
        citizenPhone: incident.citizenPhone,
        lat: incident.lat,
        lng: incident.lng
      })
    }).catch(() => {});

    return incident;
  }

  function updateIncident(id, updates) {
    const idx = state.incidents.findIndex(i => i.id === id);
    if (idx !== -1) {
      Object.assign(state.incidents[idx], updates, { updatedAt: new Date().toISOString() });
      save();

      // Put to backend API
      fetch(`${BACKEND_URL}/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).catch(() => {});

      return state.incidents[idx];
    }
    return null;
  }

  function markNotificationRead(id) {
    const n = state.notifications.find(n => n.id === id);
    if (n) { n.read = true; save(); }
  }

  function markAllNotificationsRead() {
    state.notifications.forEach(n => n.read = true);
    save();
  }

  function getUnreadCount() {
    return state.notifications.filter(n => !n.read).length;
  }

  function addAutonomousLog(action, result) {
    state.autonomousLog.unshift({ time: new Date().toISOString(), action, result });
    if (state.autonomousLog.length > 50) state.autonomousLog = state.autonomousLog.slice(0, 50);
    save();
  }

  function setAutonomousMode(on) {
    state.autonomousMode = on;
    save();
  }

  function setTheme(theme) {
    state.theme = theme;
    save();
    document.documentElement.setAttribute('data-theme', theme);
  }

  // ── Simulation Timer ──
  let simInterval = null;

  function startSimulation(onNewIncident) {
    if (simInterval) clearInterval(simInterval);
    simInterval = setInterval(() => {
      const newInc = generateNewIncident();
      addIncident(newInc);

      // If autonomous mode, auto-classify after short delay
      if (state.autonomousMode) {
        setTimeout(() => {
          const typeData = incidentTypes.find(t => t.id === newInc.type);
          updateIncident(newInc.id, {
            status: 'assigned',
            statusIndex: 2,
            timeline: generateTimeline(newInc.createdAt, 2)
          });
          addAutonomousLog(
            `Auto-classified ${newInc.typeLabel} in ${newInc.wardName}`,
            `Assigned to ${newInc.departmentName}, ETA: ${newInc.eta}`
          );
        }, 3000);
      }

      if (onNewIncident) onNewIncident(newInc);
    }, randomBetween(30000, 60000));
  }

  function stopSimulation() {
    if (simInterval) { clearInterval(simInterval); simInterval = null; }
  }

  return {
    wards, departments, incidentTypes, statusSteps, priorityOrder,
    init, save, resetData, getState, getIncidents, getNotifications,
    addIncident, updateIncident, generateNewIncident,
    markNotificationRead, markAllNotificationsRead, getUnreadCount,
    addAutonomousLog, setAutonomousMode, setTheme,
    calculateAnalytics, generateTimeline,
    startSimulation, stopSimulation,
    formatTime, formatDate, formatRelative, generateId
  };
})();

/* Shared Link & Download Utilities */
const CityPulseUtils = {
  copyToClipboard(text, message = 'Link copied to clipboard! 📋') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        CityPulseUtils.showToast(message);
      }).catch(() => {
        CityPulseUtils.fallbackCopy(text, message);
      });
    } else {
      CityPulseUtils.fallbackCopy(text, message);
    }
  },

  fallbackCopy(text, message) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      CityPulseUtils.showToast(message);
    } catch (e) {
      alert('Link: ' + text);
    }
    document.body.removeChild(textarea);
  },

  showToast(message, type = 'success') {
    let toast = document.getElementById('citypulse-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'citypulse-toast';
      toast.className = 'citypulse-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  },

  downloadFile(filename, textContent, mimeType = 'text/plain') {
    const blob = new Blob([textContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    CityPulseUtils.showToast(`Downloaded ${filename} 📥`);
  },

  getURLParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(param)) return urlParams.get(param);

    // Also check hash #INC-xxx or #track-INC-xxx
    const hash = window.location.hash.substring(1);
    if (hash) {
      if (hash.startsWith(param + '=')) {
        return hash.split('=')[1];
      }
      if (param === 'incident' && hash.startsWith('INC-')) {
        return hash;
      }
      if (param === 'track' && (hash.startsWith('INC-') || hash.startsWith('track-'))) {
        return hash.replace('track-', '');
      }
    }
    return null;
  }
};

