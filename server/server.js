const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from project root
app.use(express.static(path.join(__dirname, '..')));

// ── Initial Seed Data Generator ──
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
  { id: 15, name: 'JP Nagar', lat: 12.9063, lng: 77.5857 }
];

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

const incidentTypes = [
  { id: 'fire', label: 'Fire', icon: '🔥', color: '#EF4444', dept: 'fire-dept', priority: 'critical' },
  { id: 'flooding', label: 'Flooding', icon: '🌊', color: '#06B6D4', dept: 'bbmp-storm', priority: 'high' },
  { id: 'road-damage', label: 'Road Damage', icon: '🚧', color: '#F97316', dept: 'bbmp-road', priority: 'medium' },
  { id: 'medical', label: 'Medical Emergency', icon: '🚑', color: '#F43F5E', dept: 'medical', priority: 'critical' },
  { id: 'streetlight', label: 'Street Light Failure', icon: '💡', color: '#F59E0B', dept: 'bescom', priority: 'low' },
  { id: 'garbage', label: 'Garbage Overflow', icon: '🗑️', color: '#10B981', dept: 'bbmp-sanitation', priority: 'medium' },
  { id: 'water-supply', label: 'Water Supply Issue', icon: '💧', color: '#3B82F6', dept: 'bwssb', priority: 'high' },
  { id: 'sewage', label: 'Sewage Overflow', icon: '🚰', color: '#8B5CF6', dept: 'bwssb', priority: 'high' },
  { id: 'traffic', label: 'Traffic Signal Issue', icon: '🚦', color: '#F59E0B', dept: 'traffic-police', priority: 'medium' }
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
    time = new Date(time.getTime() + (Math.floor(Math.random() * 30) + 5) * 60000);
  }
  for (let i = statusIndex + 1; i < statusSteps.length; i++) {
    steps.push({ step: statusSteps[i], time: null, completed: false, active: false });
  }
  return steps;
}

function generateInitialIncidents(count = 25) {
  const sampleDescriptions = [
    'Pothole on main road causing heavy traffic and safety hazard for two-wheelers.',
    'Street light completely non-functional for past 3 days.',
    'Garbage accumulation near community park creating unhygienic conditions.',
    'Water pipe leakage overflowing onto public footpath.',
    'Traffic signal failure at major intersection causing congestion.',
    'Heavy rain waterlogging underpass, vehicles stranded.'
  ];

  const incidents = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const typeObj = incidentTypes[i % incidentTypes.length];
    const wardObj = wards[i % wards.length];
    const deptObj = departments.find(d => d.id === typeObj.dept) || departments[0];

    const statusIndex = Math.floor(Math.random() * 6);
    const statusMap = { 0: 'reported', 1: 'assigned', 2: 'assigned', 3: 'dispatched', 4: 'dispatched', 5: 'resolved' };

    const createdAt = new Date(now - (i * 45 + Math.floor(Math.random() * 30)) * 60000).toISOString();

    incidents.push({
      id: `INC-2026-${(i + 1).toString().padStart(3, '0')}`,
      type: typeObj.id,
      typeLabel: typeObj.label,
      typeIcon: typeObj.icon,
      typeColor: typeObj.color,
      priority: typeObj.priority,
      status: statusMap[statusIndex],
      statusIndex: statusIndex,
      ward: wardObj.id,
      wardName: wardObj.name,
      lat: wardObj.lat + (Math.random() - 0.5) * 0.006,
      lng: wardObj.lng + (Math.random() - 0.5) * 0.006,
      description: sampleDescriptions[i % sampleDescriptions.length],
      citizen: `Citizen User ${i + 1}`,
      citizenPhone: `+91 98765 ${10000 + i}`,
      department: deptObj.id,
      departmentName: deptObj.name,
      createdAt: createdAt,
      updatedAt: createdAt,
      timeline: generateTimeline(createdAt, statusIndex),
      aiConfidence: Math.floor(Math.random() * 10) + 90,
      eta: statusIndex < 5 ? `${Math.floor(Math.random() * 4) + 1} hours` : null,
      feedback: statusIndex === 5 ? Math.floor(Math.random() * 2) + 4 : null,
      citizenSubmitted: i % 3 === 0
    });
  }
  return incidents;
}

// ── Persistence JSON DB Store ──
const dataDir = path.join(__dirname, 'data');
const storePath = path.join(dataDir, 'store.json');

function loadStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(storePath)) {
    const initialData = {
      incidents: generateInitialIncidents(28),
      wards,
      departments,
      incidentTypes,
      broadcasts: [],
      autonomousMode: true
    };
    fs.writeFileSync(storePath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const content = fs.readFileSync(storePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.error('Failed to read store.json, re-initializing...', e);
    const initialData = {
      incidents: generateInitialIncidents(28),
      wards,
      departments,
      incidentTypes,
      broadcasts: [],
      autonomousMode: true
    };
    fs.writeFileSync(storePath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
}

function saveStore(data) {
  try {
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to save store:', e);
  }
}

// ── REST API ROUTES ──

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'CityPulse AI Backend', time: new Date().toISOString() });
});

// Authentication API
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const userRole = role || (email.includes('admin') ? 'admin' : 'citizen');
  res.json({
    success: true,
    token: `token-${Date.now()}`,
    user: {
      email,
      name: email.split('@')[0],
      fullName: userRole === 'admin' ? 'System Administrator' : 'Bangalore Citizen',
      role: userRole,
      avatar: userRole === 'admin' ? '👩‍💼' : '👤'
    }
  });
});

// Get Incidents
app.get('/api/incidents', (req, res) => {
  const store = loadStore();
  let incidents = store.incidents;

  const { ward, type, status, priority, search } = req.query;

  if (ward) incidents = incidents.filter(i => i.ward === parseInt(ward) || i.wardName.toLowerCase() === ward.toLowerCase());
  if (type) incidents = incidents.filter(i => i.type === type);
  if (status) incidents = incidents.filter(i => i.status === status);
  if (priority) incidents = incidents.filter(i => i.priority === priority);
  if (search) {
    const q = search.toLowerCase();
    incidents = incidents.filter(i =>
      i.id.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.wardName.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: incidents.length, incidents });
});

// Get Single Incident
app.get('/api/incidents/:id', (req, res) => {
  const store = loadStore();
  const incident = store.incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
  res.json({ success: true, incident });
});

// Create New Incident (Citizen Complaint)
app.post('/api/incidents', async (req, res) => {
  const store = loadStore();
  const { type, description, wardId, citizenName, citizenPhone, lat, lng } = req.body;

  const typeObj = incidentTypes.find(t => t.id === type) || incidentTypes[0];
  const wardObj = wards.find(w => w.id === parseInt(wardId)) || wards[2];
  const deptObj = departments.find(d => d.id === typeObj.dept) || departments[0];

  let predictedPriority = typeObj.priority;
  let confidence = Math.floor(Math.random() * 10) + 90;

  try {
    const mlResponse = await fetch('http://localhost:5000/predict-priority', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: typeObj.id,
        description: description || '',
        ward: wardObj.name
      })
    });
    const mlData = await mlResponse.json();
    if (mlData && mlData.success) {
      predictedPriority = mlData.priority;
      confidence = Math.round(mlData.confidence);
      console.log(`[ML priority classifier] predicted priority: ${predictedPriority.toUpperCase()} (confidence: ${confidence}%)`);
    }
  } catch (mlErr) {
    console.warn("[ML priority classifier] Service offline. Using default incident type classification:", mlErr.message);
  }

  const newIncident = {
    id: `INC-2026-${(store.incidents.length + 1).toString().padStart(3, '0')}`,
    type: typeObj.id,
    typeLabel: typeObj.label,
    typeIcon: typeObj.icon,
    typeColor: typeObj.color,
    priority: predictedPriority,
    status: 'reported',
    statusIndex: 0,
    ward: wardObj.id,
    wardName: wardObj.name,
    lat: lat || (wardObj.lat + (Math.random() - 0.5) * 0.005),
    lng: lng || (wardObj.lng + (Math.random() - 0.5) * 0.005),
    description: description || 'New citizen reported issue',
    citizen: citizenName || 'Anonymous Citizen',
    citizenPhone: citizenPhone || '+91 98765 00000',
    department: deptObj.id,
    departmentName: deptObj.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: generateTimeline(new Date().toISOString(), 0),
    aiConfidence: confidence,
    eta: `${Math.floor(Math.random() * 3) + 2} hours`,
    feedback: null,
    citizenSubmitted: true
  };

  store.incidents.unshift(newIncident);
  saveStore(store);

  res.status(201).json({ success: true, message: 'Complaint submitted successfully', incident: newIncident });
});

// Update Incident Status
app.put('/api/incidents/:id', (req, res) => {
  const store = loadStore();
  const idx = store.incidents.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Incident not found' });

  const current = store.incidents[idx];
  const updates = req.body;

  if (updates.statusIndex !== undefined) {
    updates.timeline = generateTimeline(current.createdAt, updates.statusIndex);
  }

  store.incidents[idx] = { ...current, ...updates, updatedAt: new Date().toISOString() };
  saveStore(store);

  res.json({ success: true, incident: store.incidents[idx] });
});

// Get Analytics
app.get('/api/analytics', (req, res) => {
  const store = loadStore();
  const total = store.incidents.length;
  const resolved = store.incidents.filter(i => i.status === 'resolved').length;
  const criticalCount = store.incidents.filter(i => i.priority === 'critical' && i.status !== 'resolved').length;
  const active = total - resolved;
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

  res.json({
    success: true,
    analytics: {
      total,
      active,
      resolved,
      criticalCount,
      resolutionRate,
      avgResolutionTime: 42,
      aiAutomationRate: 94
    }
  });
});

// Metadata endpoints
app.get('/api/wards', (req, res) => res.json({ success: true, wards }));
app.get('/api/departments', (req, res) => res.json({ success: true, departments }));
app.get('/api/incident-types', (req, res) => res.json({ success: true, incidentTypes }));

// Broadcast Alerts
app.post('/api/broadcast', (req, res) => {
  const { type, message, wardsTarget } = req.body;
  const store = loadStore();
  const alert = {
    id: `ALERT-${Date.now()}`,
    type: type || 'info',
    message,
    wardsTarget: wardsTarget || 'all',
    timestamp: new Date().toISOString()
  };
  store.broadcasts.unshift(alert);
  saveStore(store);
  res.json({ success: true, alert });
});

// Reset Data API
app.post('/api/reset', (req, res) => {
  const store = {
    incidents: generateInitialIncidents(28),
    wards,
    departments,
    incidentTypes,
    broadcasts: [],
    autonomousMode: true
  };
  saveStore(store);
  res.json({ success: true, message: 'Backend database reset to default seed data' });
});
function generateOfflineFallbackResponse(message, incidents) {
  const query = message.toLowerCase();
  
  // 1. Identify ward filter
  const wards = [
    'mahadevapura', 'whitefield', 'koramangala', 'indiranagar', 'jayanagar', 
    'rajajinagar', 'malleshwaram', 'basavanagudi', 'yelahanka', 'hebbal', 
    'btm layout', 'hsr layout', 'electronic city', 'marathahalli', 'jp nagar'
  ];
  let matchedWard = null;
  for (const w of wards) {
    if (query.includes(w)) {
      matchedWard = w;
      break;
    }
  }

  // 2. Identify type/keyword filters
  const categoryKeywords = {
    fire: ['fire', 'smoke', 'burn', 'blaze'],
    flooding: ['flood', 'waterlogging', 'rain', 'water log', 'underpass'],
    'road-damage': ['pothole', 'road damage', 'road', 'crater', 'footpath'],
    medical: ['medical', 'ambulance', 'accident', 'injury', 'hospital'],
    streetlight: ['streetlight', 'street light', 'bulb', 'darkness'],
    garbage: ['garbage', 'waste', 'trash', 'debris', 'dump'],
    'water-supply': ['water supply', 'leakage', 'no water', 'pipe leak'],
    sewage: ['sewage', 'drain', 'gutter', 'overflow'],
    traffic: ['traffic', 'congestion', 'signal', 'jam']
  };
  
  let matchedTypes = [];
  for (const [type, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => query.includes(kw))) {
      matchedTypes.push(type);
    }
  }

  // 3. Identify status filters
  const statuses = ['reported', 'assigned', 'dispatched', 'resolved'];
  let matchedStatus = null;
  for (const s of statuses) {
    if (query.includes(s)) {
      matchedStatus = s;
      break;
    }
  }

  // 4. Identify priority filters
  const priorities = ['critical', 'high', 'medium', 'low'];
  let matchedPriority = null;
  for (const p of priorities) {
    if (query.includes(p)) {
      matchedPriority = p;
      break;
    }
  }

  // Filter incidents
  let filtered = incidents;
  if (matchedWard) {
    filtered = filtered.filter(i => i.wardName.toLowerCase() === matchedWard);
  }
  if (matchedTypes.length > 0) {
    filtered = filtered.filter(i => matchedTypes.includes(i.type));
  }
  if (matchedStatus) {
    filtered = filtered.filter(i => i.status === matchedStatus);
  }
  if (matchedPriority) {
    filtered = filtered.filter(i => i.priority === matchedPriority);
  }

  // If no filters matched or no incidents found after filtering, fallback to standard keyword matching on descriptions
  if (filtered.length === incidents.length && query.length > 3) {
    const searchTerms = query.split(/\s+/).filter(t => t.length > 3);
    if (searchTerms.length > 0) {
      filtered = incidents.filter(i => 
        searchTerms.some(term => 
          i.description.toLowerCase().includes(term) ||
          i.id.toLowerCase().includes(term) ||
          i.wardName.toLowerCase().includes(term) ||
          i.typeLabel.toLowerCase().includes(term)
        )
      );
    }
  }

  const totalMatches = filtered.length;
  const displayIncidents = filtered.slice(0, 5);

  // Section 1: Situation Summary
  let situationSummary = "";
  if (matchedWard) {
    const wardCapitalized = matchedWard.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    situationSummary = `Analysis of municipal issues in **${wardCapitalized}** ward. We identified **${totalMatches}** matching incident(s) currently registered in the database.`;
  } else {
    situationSummary = `Overview of city-wide operations. Found **${totalMatches}** matching incident(s) matching your request.`;
  }
  
  if (matchedTypes.length > 0) {
    situationSummary += ` Filtering applied for categories: ${matchedTypes.map(t => t.toUpperCase()).join(', ')}.`;
  }
  if (matchedStatus) {
    situationSummary += ` Status restricted to: **${matchedStatus}**.`;
  }

  // Section 2: Important Findings
  let importantFindings = "";
  if (totalMatches === 0) {
    importantFindings = "* No active incidents matching your description/filters were found in the database.\n* System operations are running normally for the selected criteria.";
  } else {
    importantFindings = displayIncidents.map(i => {
      const statusIcon = i.status === 'resolved' ? '✅' : '⏳';
      return `* **[${i.id}]** ${i.typeIcon} ${i.typeLabel} in *${i.wardName}* - Priority: **${i.priority.toUpperCase()}** | Status: ${statusIcon} **${i.status.toUpperCase()}**\n  *Description: "${i.description}"*`;
    }).join('\n');
    if (totalMatches > 5) {
      importantFindings += `\n* *Note: Showing first 5 of ${totalMatches} total matching incidents. Please use specific filters to narrow down.*`;
    }
  }

  // Section 3: Recommended Actions
  let recommendedActions = "";
  if (totalMatches === 0) {
    recommendedActions = "* Continue routine patrol and monitoring of the selected areas.\n* Re-check citizen reports if new complaints arise.";
  } else {
    const activeCritical = displayIncidents.filter(i => i.priority === 'critical' && i.status !== 'resolved');
    const activeHigh = displayIncidents.filter(i => i.priority === 'high' && i.status !== 'resolved');
    
    if (activeCritical.length > 0) {
      recommendedActions += `* **CRITICAL EMERGENCY DISPATCH:** Immediately deploy supervisors and field units to resolve active critical issue(s): ${activeCritical.map(i => i.id).join(', ')}.\n`;
    }
    if (activeHigh.length > 0) {
      recommendedActions += `* **High Priority Resolution:** Expedite work orders for high-priority incident(s): ${activeHigh.map(i => i.id).join(', ')}.\n`;
    }
    recommendedActions += `* **Department Coordination:** Coordinate with assigned departments (${Array.from(new Set(displayIncidents.map(i => i.departmentName))).join(', ')}) to verify updates.\n`;
    recommendedActions += `* **Citizen Feedback Loop:** Keep citizens informed of ETAs via SMS alerts once dispatch status changes.`;
  }

  // Section 4: Priority Level
  let overallPriority = "LOW";
  const hasCritical = displayIncidents.some(i => i.priority === 'critical' && i.status !== 'resolved');
  const hasHigh = displayIncidents.some(i => i.priority === 'high' && i.status !== 'resolved');
  const hasMedium = displayIncidents.some(i => i.priority === 'medium' && i.status !== 'resolved');
  if (hasCritical) overallPriority = "CRITICAL";
  else if (hasHigh) overallPriority = "HIGH";
  else if (hasMedium) overallPriority = "MEDIUM";

  // Section 5: Confidence Score
  const confidenceScore = totalMatches > 0 ? "95% (Direct database matching)" : "90% (Database query check)";

  const responseText = `### 1. Situation Summary
${situationSummary}

### 2. Important Findings
${importantFindings}

### 3. Recommended Actions
${recommendedActions}

### 4. Priority Level
**${overallPriority}**

### 5. Confidence Score
**${confidenceScore}**

*Note: This response was generated by CityPulse Local Copilot (Offline Fallback Engine).*`;

  return responseText;
}

app.post("/api/copilot", async (req, res) => {
    try {
        const { message } = req.body;
        console.log("User Message:", message);
        const store = loadStore();

        const prompt = `
You are CityPulse AI.
You are an intelligent municipal operations assistant.

Current incidents:
${JSON.stringify(store.incidents, null, 2)}

The user asked:
"${message}"

Answer professionally.
Always include:
1. Situation Summary
2. Important Findings
3. Recommended Actions
4. Priority Level
5. Confidence Score

Use markdown bullet points where appropriate.
`;

        // List of models to try in priority order
        const MODELS_TO_TRY = [
            "gemini-3.6-flash",
            "gemini-3.5-flash-lite",
            "gemini-flash-latest",
            "gemini-3.1-flash-lite"
        ];

        let result = null;
        let lastError = null;

        for (const modelName of MODELS_TO_TRY) {
            console.log(`Calling Gemini (model: ${modelName})...`);
            try {
                result = await ai.models.generateContent({
                    model: modelName,
                    contents: prompt
                });
                console.log(`Gemini response successful using model: ${modelName}`);
                break;
            } catch (err) {
                console.warn(`Model ${modelName} failed: ${err.message}`);
                lastError = err;
            }
        }

        if (result && result.text) {
            res.json({
                success: true,
                answer: result.text
            });
        } else {
            console.warn("All Gemini models failed. Activating local intelligent fallback copilot...");
            const fallbackAnswer = generateOfflineFallbackResponse(message, store.incidents);
            res.json({
                success: true,
                answer: fallbackAnswer
            });
        }

    } catch (err) {
        console.error("General copilot handler error:", err);
        // Guarantee success for the frontend even under catastrophic failures
        try {
            const store = loadStore();
            const fallbackAnswer = generateOfflineFallbackResponse(req.body.message || "", store.incidents);
            res.json({
                success: true,
                answer: fallbackAnswer
            });
        } catch (innerErr) {
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    }
});
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🏛️ CityPulse AI Backend Server running on port ${PORT}`);
  console.log(`👉 API Health: http://localhost:${PORT}/api/health`);
  console.log(`👉 Web Portal: http://localhost:${PORT}/index.html`);
  console.log(`===================================================`);
});
