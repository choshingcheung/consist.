import { classifyContentWithGemini } from '../utils/gemini.js';

console.log("✅ Consist content script loaded!");

// Store the last checked URL and video ID to prevent duplicate checks
let lastCheckedURL = "";
let lastVideoID = "";

// Initially, blocking is enabled (using chrome storage)
let isBlockingEnabled = true;

// Listen for storage changes to update blocking state
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.blockingEnabled) {
    isBlockingEnabled = changes.blockingEnabled.newValue;
    console.log("🔄 Blocking state changed:", isBlockingEnabled ? "Enabled" : "Disabled");
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
  const overlay = document.createElement('div');
  overlay.id = "consist-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
  overlay.style.color = "#fff";
  overlay.style.zIndex = 99999;
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.fontSize = "1.8rem";
  overlay.innerText = "🔒 This looks distracting. Stay focused!";
  document.body.appendChild(overlay);
}

// Debounce mechanism to limit API calls
let debounceTimer;

async function analyzeAndDecide() {
  const url = window.location.href;

  // Prevent re-checking the same URL and video ID
  const videoID = new URLSearchParams(window.location.search).get('v');
  if (url === lastCheckedURL && videoID === lastVideoID) {
    console.log("✅ Already checked this URL or video:", url);
    return;
  }

  lastCheckedURL = url; // Update the last checked URL
  lastVideoID = videoID; // Update the last video ID

  if (isSafeDomain(url)) {
    console.log("✅ Domain is safe:", url);
    return;
  }

  // Skip homepage and search pages on YouTube
  if (url.includes("youtube.com") && !url.includes("/watch")) {
    console.log("✅ YouTube homepage or search page, skipping check.");
    return;
  }

  const title = getPageTitle();
  if (!title) {
    console.log("⏳ Waiting for page title...");
    return;
  }

  console.log("🧠 Checking title:", title);

  // Only proceed with content classification if blocking is enabled
  if (!isBlockingEnabled) {
    console.log("🔄 Blocking is disabled, skipping classification.");
    return;
  }

  try {
    const result = await classifyContentWithGemini({ url, title });
    console.log("📊 Gemini result:", result);

    if (result === "distracting") {
      console.log("🚫 Gemini marked as distracting.");
      blurPage();
    } else {
      console.log("✅ Gemini says it's fine.");
    }
  } catch (error) {
    console.error("❌ Gemini classification failed:", error);
  }
}

// Initial check (wait for things to load)
setTimeout(analyzeAndDecide, 2000);

// Debounce the function using MutationObserver
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    analyzeAndDecide(); // Call once after the set delay
  }, 2000);
});

observer.observe(document.body, { childList: true, subtree: true });

// Listen for URL changes (popstate and hashchange)
window.addEventListener('popstate', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    analyzeAndDecide(); // Call analyzeAndDecide when URL changes
  }, 2000);
});

window.addEventListener('hashchange', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    analyzeAndDecide(); // Call analyzeAndDecide when hash changes
  }, 2000);
});
