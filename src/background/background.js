let timer = null;
let timeLeft = 25 * 60;
let isRunning = false;
let isFocus = true;
let focusDuration = 25 * 60;
let breakDuration = 5 * 60;

function saveState() {
  chrome.storage.local.set({ timeLeft, isRunning, isFocus });
}

function notifyPopup() {
  chrome.runtime.sendMessage({
    type: 'TIMER_UPDATE',
    timeLeft,
    isRunning,
    isFocus
  });
}

function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    saveState();
    notifyPopup();
  } else {
    isFocus = !isFocus;
    timeLeft = isFocus ? focusDuration : breakDuration;
    chrome.storage.local.set({
      blockingEnabled: isFocus,
      currentMode: isFocus ? "focus" : "break"
    });
    saveState();
    notifyPopup();
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['focusDuration', 'breakDuration'], (res) => {
    focusDuration = res.focusDuration || 25 * 60;
    breakDuration = res.breakDuration || 5 * 60;
    timeLeft = focusDuration;
    saveState();
  });
});

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === 'START_TIMER') {
    isRunning = true;
    if (!timer) timer = setInterval(tick, 1000);
    saveState();
  }

  if (msg.type === 'STOP_TIMER') {
    isRunning = false;
    clearInterval(timer);
    timer = null;
    saveState();
  }

  if (msg.type === 'SWITCH_MODE') {
    chrome.storage.local.get(['focusDuration', 'breakDuration'], (res) => {
      focusDuration = res.focusDuration || 25 * 60;
      breakDuration = res.breakDuration || 5 * 60;
      isFocus = msg.payload === 'focus';
      timeLeft = isFocus ? focusDuration : breakDuration;
      chrome.storage.local.set({
        blockingEnabled: isFocus,
        currentMode: isFocus ? "focus" : "break"
      });
      saveState();
      notifyPopup();
    });
  }

  if (msg.type === 'GET_STATE') {
    sendResponse({ timeLeft, isRunning, isFocus });
  }
});
