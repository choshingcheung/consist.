let timer = null;
let timeLeft = 25 * 60;
let isRunning = false;
let isFocus = true;

function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    saveState();
    notifyPopup();
  } else {
    isFocus = !isFocus;
    timeLeft = isFocus ? 25 * 60 : 5 * 60;
    chrome.storage.local.set({ blockingEnabled: isFocus });
    saveState();
    notifyPopup();
  }
}

function saveState() {
  chrome.storage.local.set({
    timeLeft,
    isRunning,
    isFocus
  });
}

function notifyPopup() {
  chrome.runtime.sendMessage({
    type: 'TIMER_UPDATE',
    timeLeft,
    isRunning,
    isFocus
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Consist extension installed.");
  saveState();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'START_TIMER') {
    isRunning = true;
    timer = setInterval(tick, 1000);
    saveState();
  }

  if (msg.type === 'STOP_TIMER') {
    isRunning = false;
    clearInterval(timer);
    saveState();
  }

  if (msg.type === 'SWITCH_MODE') {
    isFocus = msg.payload === 'focus';
    timeLeft = isFocus ? 25 * 60 : 5 * 60;
    chrome.storage.local.set({ blockingEnabled: isFocus });
    saveState();
    notifyPopup();
  }

  if (msg.type === 'GET_STATE') {
    sendResponse({
      timeLeft,
      isRunning,
      isFocus
    });
  }
});
