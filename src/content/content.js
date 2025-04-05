console.log("✅ Consist content script loaded!");

// --- Keywords ---
const DISTRACTING_KEYWORDS = [
  "minecraft", "fortnite", "roblox", "gaming", "apex",
  "valorant", "csgo", "league of legends", "let's play",
  "reaction", "celebrity", "drama", "shorts"
];

const ALLOWED_KEYWORDS = [
  "study", "lofi", "music", "productivity", "focus", "pomodoro",
  "math", "science", "history", "school", "college"
];

function getVideoTitle() {
    // Option 1: h1 element
    const h1 = document.querySelector('h1.title, h1');
    if (h1 && h1.textContent.trim().length > 0) {
      return h1.textContent.toLowerCase();
    }
  
    // Option 2: Open Graph metadata
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.content) {
      return ogTitle.content.toLowerCase();
    }
  
    // Option 3: document.title (fallback)
    if (document.title) {
      return document.title.toLowerCase();
    }
  
    return '';
  }  

function isDistracting(title) {
  return DISTRACTING_KEYWORDS.some(keyword => title.includes(keyword)) &&
         !ALLOWED_KEYWORDS.some(keyword => title.includes(keyword));
}

function blockVideo() {
  const video = document.querySelector('video');
  if (video) {
    video.pause();
    video.style.filter = 'blur(10px)';
  }

  if (!document.getElementById('consist-overlay')) {
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
    overlay.innerText = "🔒 This video looks distracting.\nStay focused!";
    document.body.appendChild(overlay);
  }
}

function checkAndBlock() {
    const interval = setInterval(() => {
      const title = getVideoTitle();
  
      if (title && title.trim().length > 0) {
        console.log("📺 Video title detected:", title);
  
        if (isDistracting(title)) {
          console.log("🚫 Distracting video detected. Blocking...");
          blockVideo();
        } else {
          console.log("✅ Video allowed.");
        }
  
        clearInterval(interval);
      } else {
        console.log("⏳ Waiting for title to load...");
      }
    }, 1000);
}
  
  
  

// --- Initial run ---
setTimeout(checkAndBlock, 2000);

// --- MutationObserver for SPA navigation ---
let debounceTimer;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    checkAndBlock();
  }, 800);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
