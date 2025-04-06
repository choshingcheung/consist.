import { classifyContentWithGemini } from '../utils/gemini.js';

console.log("✅ Consist content script loaded!");

let lastCheckedURL = "";
let lastVideoID = "";
let isBlockingEnabled = true;
let currentMode = "focus";
let whitelist = [];

chrome.storage.local.get(['blockingEnabled', 'currentMode', 'whitelist'], (res) => {
  isBlockingEnabled = res.blockingEnabled ?? true;
  currentMode = res.currentMode ?? 'focus';
  whitelist = res.whitelist ?? [];
  console.log("🧠 Current state:", { isBlockingEnabled, currentMode, whitelist });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    if (changes.blockingEnabled) isBlockingEnabled = changes.blockingEnabled.newValue;
    if (changes.currentMode) currentMode = changes.currentMode.newValue;
    if (changes.whitelist) whitelist = changes.whitelist.newValue;
  }
});

function isSafeDomain(url) {
  return whitelist.some(domain => url.includes(domain));
}

function getPageTitle() {
  const h1 = document.querySelector('h1');
  if (h1?.textContent.trim()) return h1.textContent.toLowerCase();
  const ogTitle = document.querySelector('meta[property="og:title"]');
  return ogTitle?.content.toLowerCase() || document.title?.toLowerCase() || '';
}

function blurPage() {
  if (document.getElementById("consist-overlay")) return;
  const overlay = document.createElement('div');
  overlay.id = "consist-overlay";
  overlay.style = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background-color: rgba(0, 0, 0, 0.85); color: white; z-index: 99999;
    display: flex; justify-content: center; align-items: center; font-size: 1.8rem;
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

  console.log("🧪 Checking content block:");
  console.log("🔗 URL:", url);
  console.log("📺 Video ID:", videoID);
  console.log("🧾 Mode:", currentMode);
  console.log("🔒 Blocking Enabled:", isBlockingEnabled);
  console.log("📝 Whitelist (length):", whitelist.length);
  console.log("📝 Whitelist (entries):", JSON.stringify(whitelist));


  if (isSafeDomain(url)) {
    console.log("✅ Whitelisted domain, skip blocking.");
    return;
  }

  if (url.includes("youtube.com") && !url.includes("/watch")) {
    console.log("⏩ Not a YouTube video page.");
    return;
  }

  if (currentMode === "break") {
    console.log("⏱️ Break mode, skipping blocking.");
    return;
  }

  if (!isBlockingEnabled) {
    console.log("🔕 Blocking disabled.");
    return;
  }

  const title = getPageTitle();
  if (!title) {
    console.log("❓ No title found, cannot classify.");
    return;
  }

  console.log("🔍 Analyzing title:", title);

  try {
    const result = await classifyContentWithGemini({ url, title });
    console.log("📊 Gemini result:", result);

    if (result === "distracting") {
      blurPage();
    } else {
      console.log("👌 Not distracting.");
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
