import { classifyContentWithGemini } from '../utils/gemini.js';

console.log("✅ Consist content script loaded!");

let lastCheckedURL = "";
let lastVideoID = "";
let isBlockingEnabled = true;
let currentMode = "focus";

// Load initial state
chrome.storage.local.get(["blockingEnabled", "currentMode"], (result) => {
  if (typeof result.blockingEnabled !== "undefined") {
    isBlockingEnabled = result.blockingEnabled;
  }
  if (typeof result.currentMode === "string") {
    currentMode = result.currentMode;
    console.log("🌗 Initial mode:", currentMode);
  }
});

// React to changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    if (changes.blockingEnabled) {
      isBlockingEnabled = changes.blockingEnabled.newValue;
      console.log("🔄 Blocking state changed:", isBlockingEnabled);
    }
    if (changes.currentMode) {
      currentMode = changes.currentMode.newValue;
      console.log("🌗 Mode updated:", currentMode);
    }
  }
});

const SAFE_DOMAINS = [
  "notion.so", "canvas", "edpuzzle", "khanacademy.org",
  "quizlet", "wikipedia", "wolframalpha", "desmos",
  "github.com", "replit.com", "openai.com"
];

function isSafeDomain(url) {
  return SAFE_DOMAINS.some(domain => url.includes(domain));
}

function getPageTitle() {
  const h1 = document.querySelector('h1');
  if (h1 && h1.textContent.trim()) return h1.textContent.toLowerCase();

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && ogTitle.content) return ogTitle.content.toLowerCase();

  return document.title?.toLowerCase() || '';
}

function blurPage() {
  if (document.getElementById("consist-overlay")) return;
  const overlay = document.createElement('div');
  overlay.id = "consist-overlay";
  overlay.style = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background-color: rgba(0, 0, 0, 0.85);
    color: white;
    z-index: 99999;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.8rem;
  `;
  overlay.innerText = "🔒 This looks distracting. Stay focused!";
  document.body.appendChild(overlay);
}

let debounceTimer;

async function analyzeAndDecide() {
  const url = window.location.href;
  const videoID = new URLSearchParams(window.location.search).get('v');

  if (url === lastCheckedURL && videoID === lastVideoID) return;
  lastCheckedURL = url;
  lastVideoID = videoID;

  if (isSafeDomain(url)) return;
  if (url.includes("youtube.com") && !url.includes("/watch")) return;

  const title = getPageTitle();
  if (!title) return;

  if (currentMode === "break") {
    console.log("🛑 Break mode active, skipping analysis.");
    return;
  }

  if (!isBlockingEnabled) {
    console.log("🔕 Blocking is disabled.");
    return;
  }

  console.log("🔍 Analyzing title:", title);

  try {
    const result = await classifyContentWithGemini({ url, title });
    console.log("📊 Gemini result:", result);

    if (result === "distracting") {
      blurPage();
    }
  } catch (err) {
    console.error("❌ Classification failed:", err);
  }
}

setTimeout(analyzeAndDecide, 2000);

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(analyzeAndDecide, 2000);
});
observer.observe(document.body, { childList: true, subtree: true });

window.addEventListener('popstate', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(analyzeAndDecide, 2000);
});

window.addEventListener('hashchange', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(analyzeAndDecide, 2000);
});
