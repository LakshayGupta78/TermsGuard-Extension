// TermsGuard Extension - Popup Script
// Uses backend proxy for secure API calls

// ⚠️ IMPORTANT: Set this to your deployed website URL
const API_URL = 'https://your-website-url.vercel.app/api/extension-analyze';

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

// Render results
function renderResults(analysis) {
  let html = '';

  // Summary
  if (analysis.summary) {
    html += `
      <div class="summary-section">
        <h3>Summary</h3>
        <p>${analysis.summary}</p>
      </div>
    `;
  }

  // Risks
  if (analysis.risks && analysis.risks.length > 0) {
    html += '<div class="risks-section"><h3>Identified Risks</h3>';
    
    // Sort by severity
    const severityOrder = { high: 0, medium: 1, low: 2 };
    analysis.risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    
    analysis.risks.forEach(risk => {
      const icon = risk.severity === 'high' ? '🔴' : risk.severity === 'medium' ? '🟡' : '🟢';
      html += `
        <div class="risk-item ${risk.severity}">
          <div class="risk-header">
            <span>${icon}</span>
            <span class="risk-severity">${risk.severity}</span>
          </div>
          <p class="risk-text">${risk.description}</p>
        </div>
      `;
    });
    
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
