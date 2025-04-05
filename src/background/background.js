importScripts('utils/gemini.js');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_DISTRACTION') {
    const { domain, title, meta } = message.payload;

    classifyContent({ domain, title, meta })
      .then(result => {
        sendResponse({ isDistracting: result });
      })
      .catch(error => {
        console.error("❌ Gemini API failed:", error);
        sendResponse({ isDistracting: false });
      });

    return true; // keep the message channel open for async sendResponse
  }
});
