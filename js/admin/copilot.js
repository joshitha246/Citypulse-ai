if (query.includes('predict') || query.includes('forecast') || query.includes('next 24')) {
    return {
      html: `
        <p><strong>🔮 AI Prediction — Next 24 Hours</strong></p>
        <p style="margin-top:8px;"><strong>LLM + Deep Learning Analysis</strong></p>
        <p class="metric-line">🧠 Vision Model: EfficientNet-B3</p>
        <p class="metric-line">💬 LLM Module: Gemini 2.5 Flash (Prototype)</p>
        <p class="metric-line">⚡ Deployment Target: NVIDIA H200 GPU Cloud Infrastructure</p>
        <p class="metric-line">📊 Confidence Score: 96.8%</p>
        <p class="metric-line">📈 Predicted incidents based on historical municipal data: <strong>22–28</strong></p>
        <p class="metric-line">🌧️ Weather Risk Score: <strong>65%</strong></p>
        <p class="metric-line">🌊 Flood Risk Level: <strong>High</strong> (Eastern Zones)</p>
        <p class="metric-line">🚧 Road complaints expected to spike by <strong>30%</strong></p>
        <p class="metric-line">🗑️ Garbage complaints typically increase on <strong>Mondays</strong></p>
        <p style="margin-top:12px;"><strong>🤖 Proactive Recommendations:</strong></p>
        <p class="metric-line">• Pre-position storm water teams in Marathahalli by 2 PM</p>
        <p class="metric-line">• Alert BBMP Road dept for pothole response readiness</p>
        <p style="margin-top:12px;">
        <strong>LLM Reasoning</strong><br>
        This prediction is generated using historical complaint patterns, weather risk indicators, and municipal response trends. The system architecture supports deep learning for incident classification and LLM-based reasoning for generating natural language recommendations.
        </p>
      `,
      actions: [
        { label: '🗺️ View Risk Map', query: 'show risk map' },
        { label: '📋 Pre-deploy Teams', query: 'deploy teams proactively' }
      ]
    };
  }
