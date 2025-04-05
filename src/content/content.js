// --- content.js ---
console.log("✅ Consist content script loaded!");

// Extracts relevant info to classify the content
function extractPageContext() {
  const domain = window.location.hostname;
  const title = document.title.toLowerCase();

  // Attempt to get meta description
  const meta = document.querySelector("meta[name='description']") ||
               document.querySelector("meta[property='og:description']");
  const description = meta?.content?.toLowerCase() || "";

  return {
    domain,
    title,
    snippet: description
  };
}

// Send to background.js for Gemini evaluation
async function evaluatePage() {
  const context = extractPageContext();
  console.log("🔍 Page context:", context);

  chrome.runtime.sendMessage({
    action: "checkDistraction",
    payload: context
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("❌ Message failed:", chrome.runtime.lastError.message);
      return;
    }

    const { shouldBlock, explanation } = response || {};
    console.log("🧠 Gemini said:", explanation);

    if (shouldBlock) {
      console.log("🚫 Page deemed distracting. Blocking...");
      blockPage();
    } else {
      console.log("✅ Page allowed.");
    }
  });
}

function blockPage() {
  if (!document.getElementById("consist-overlay")) {
    const overlay = document.createElement("div");
    overlay.id = "consist-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0,0,0,0.85)";
    overlay.style.color = "#fff";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.fontSize = "1.8rem";
    overlay.style.zIndex = 99999;
    overlay.innerText = "🔒 This page looks distracting. Stay focused!";
    document.body.appendChild(overlay);
  }
}

// --- Initial Run ---
setTimeout(evaluatePage, 2000);

// --- Detect SPA changes ---
let debounceTimer;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    evaluatePage();
  }, 800);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
