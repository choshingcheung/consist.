import { classifyContentWithGemini } from '../utils/gemini.js';

console.log("✅ Consist content script loaded!");

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

async function analyzeAndDecide() {
  const url = window.location.href;
  if (isSafeDomain(url)) {
    console.log("✅ Domain is safe:", url);
    return;
  }

  const title = getPageTitle();
  if (!title) {
    console.log("⏳ Waiting for page title...");
    return;
  }

  console.log("🧠 Checking title:", title);

  try {
    const result = await classifyContentWithGemini({ url, title }); // 👈 this was missing!
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

// Observe SPA navigation
let debounceTimer;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    analyzeAndDecide();
  }, 1000);
});

observer.observe(document.body, { childList: true, subtree: true });