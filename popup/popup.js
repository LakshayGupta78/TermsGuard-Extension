// TermsGuard Extension - Popup Script
// Uses backend proxy for secure API calls

// ⚠️ IMPORTANT: Set this to your deployed website URL
const API_URL = 'https://terms-guard-website.vercel.app/api/extension-analyze';

// DOM Elements
const initialState = document.getElementById('initial-state');
const loadingState = document.getElementById('loading-state');
const resultsState = document.getElementById('results-state');
const errorState = document.getElementById('error-state');
const resultsContent = document.getElementById('results-content');
const errorMessage = document.getElementById('error-message');

const scanBtn = document.getElementById('scan-btn');
const rescanBtn = document.getElementById('rescan-btn');
const retryBtn = document.getElementById('retry-btn');

// Risk gauge elements
const riskRankSection = document.getElementById('risk-rank-section');
const gaugeFill = document.getElementById('gauge-fill');
const riskScore = document.getElementById('risk-score');
const riskLevel = document.getElementById('risk-level');

// State management
function showState(state) {
  [initialState, loadingState, resultsState, errorState].forEach(s => s.classList.add('hidden'));
  state.classList.remove('hidden');
}

// Get page content from active tab
async function getPageContent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // Get all visible text from the page
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            
            // Skip hidden elements, scripts, styles
            const style = window.getComputedStyle(parent);
            if (style.display === 'none' || style.visibility === 'hidden') {
              return NodeFilter.FILTER_REJECT;
            }
            
            const tagName = parent.tagName.toLowerCase();
            if (['script', 'style', 'noscript', 'iframe'].includes(tagName)) {
              return NodeFilter.FILTER_REJECT;
            }
            
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const textParts = [];
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text.length > 0) {
          textParts.push(text);
        }
      }

      return textParts.join(' ').substring(0, 30000); // Limit text length
    }
  });

  return results[0].result;
}

// Analyze content via backend API
async function analyzeWithBackend(pageContent) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pageContent })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

// Calculate overall risk score based on risks
function calculateRiskScore(risks) {
  if (!risks || risks.length === 0) {
    return { score: 0, level: 'low', label: 'Low Risk' };
  }

  // Weight for each severity level
  const weights = { high: 30, medium: 15, low: 5 };
  let totalScore = 0;

  risks.forEach(risk => {
    const severity = (risk.severity || 'low').toLowerCase();
    totalScore += weights[severity] || 5;
  });

  // Cap at 100
  totalScore = Math.min(totalScore, 100);

  // Determine level
  let level, label;
  if (totalScore >= 60) {
    level = 'high';
    label = 'High Risk';
  } else if (totalScore >= 30) {
    level = 'medium';
    label = 'Medium Risk';
  } else {
    level = 'low';
    label = 'Low Risk';
  }

  return { score: totalScore, level, label };
}

// Update the risk gauge display
function updateRiskGauge(riskData) {
  const { score, level, label } = riskData;
  
  // Update score display
  riskScore.textContent = score;
  riskScore.className = `risk-score ${level}`;
  
  // Update gauge ring (circumference = 2 * π * 16 ≈ 100.53, we use 100 for simplicity)
  const circumference = 100;
  const offset = circumference - (score / 100) * circumference;
  gaugeFill.style.strokeDashoffset = offset;
  gaugeFill.className = `gauge-fill ${level}`;
  
  // Update level badge
  riskLevel.innerHTML = `<span class="risk-level-badge ${level}">${label}</span>`;
}

// Render results
function renderResults(analysis) {
  let html = '';

  // Calculate and display risk score
  const riskData = calculateRiskScore(analysis.risks);
  updateRiskGauge(riskData);

  // Summary
  if (analysis.summary) {
    html += `
      <div class="summary-section">
        <h3>Summary</h3>
        <p>${analysis.summary}</p>
      </div>
    `;
  }

  // Risks - grouped by severity like the website
  if (analysis.risks && analysis.risks.length > 0) {
    // Group risks by severity
    const highRisks = analysis.risks.filter(r => (r.severity || '').toLowerCase() === 'high');
    const mediumRisks = analysis.risks.filter(r => (r.severity || '').toLowerCase() === 'medium');
    const lowRisks = analysis.risks.filter(r => (r.severity || '').toLowerCase() === 'low');

    html += '<div class="risks-container">';

    // High Risk Section
    if (highRisks.length > 0) {
      html += `
        <div class="risk-section high">
          <div class="risk-section-header">
            <span class="risk-section-icon">🔴</span>
            <h3>High Risk</h3>
            <span class="risk-count">${highRisks.length}</span>
          </div>
          <div class="risk-items">
            ${highRisks.map(risk => `
              <div class="risk-item high">
                <p class="risk-text">${risk.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Medium Risk Section
    if (mediumRisks.length > 0) {
      html += `
        <div class="risk-section medium">
          <div class="risk-section-header">
            <span class="risk-section-icon">🟡</span>
            <h3>Medium Risk</h3>
            <span class="risk-count">${mediumRisks.length}</span>
          </div>
          <div class="risk-items">
            ${mediumRisks.map(risk => `
              <div class="risk-item medium">
                <p class="risk-text">${risk.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Low Risk Section
    if (lowRisks.length > 0) {
      html += `
        <div class="risk-section low">
          <div class="risk-section-header">
            <span class="risk-section-icon">🟢</span>
            <h3>Low Risk</h3>
            <span class="risk-count">${lowRisks.length}</span>
          </div>
          <div class="risk-items">
            ${lowRisks.map(risk => `
              <div class="risk-item low">
                <p class="risk-text">${risk.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    html += '</div>';
  } else {
    html += `
      <div class="no-risks">
        <div class="icon">✅</div>
        <p>No significant risks identified</p>
      </div>
    `;
  }

  resultsContent.innerHTML = html;
}

// Main scan function
async function scanPage() {
  showState(loadingState);

  try {
    const pageContent = await getPageContent();
    
    if (!pageContent || pageContent.length < 50) {
      throw new Error('Could not extract enough content from this page');
    }

    const analysis = await analyzeWithBackend(pageContent);
    renderResults(analysis);
    showState(resultsState);
  } catch (error) {
    console.error('Scan error:', error);
    errorMessage.textContent = error.message || 'Failed to analyze page';
    showState(errorState);
  }
}

// Event listeners
scanBtn.addEventListener('click', scanPage);
rescanBtn.addEventListener('click', scanPage);
retryBtn.addEventListener('click', scanPage);
