# Consist. ⏱🚫

**Consist** is a modern, minimalist Chrome Extension that helps you stay focused by blocking distracting content and guiding your workflow with a smart Pomodoro timer.

---

## 💡 Features

- 🎯 **Smart Blocking**: Uses Gemini API to dynamically classify YouTube pages as “distracting” or not (e.g., blocks gaming, allows lofi/study).
- ⏱ **Pomodoro Timer**: Integrated timer that auto-enables blocking during focus sessions and disables it during breaks.
- 🔐 **Auth0 Authentication**: Secure login system before accessing any core page.
- ⚙️ **Configurable Settings**: Set your focus and break durations, custom whitelists, and toggle dark mode.
- 📈 **Performance Dashboard**: Visual charts, goal tracking, and streak monitoring.
- 🌗 **Dark/Light Mode**: Available across all pages.
- 🔄 **YouTube-Aware**: Works with dynamic content navigation.

---

## 🛠 Tech Stack

- ⚛️ React (UI framework)
- ⚡ Vite (bundler)
- 📦 Chrome Extension (Manifest V3)
- 🤖 Gemini API (Google AI content classification)
- 🔐 Auth0 (authentication)
- 📊 Recharts (visual analytics)

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/choshingcheung/consist..git
cd consist.
```

### 2. Install dependencies

```bash
npm install
```

Required dependencies:

- `react`, `react-dom`
- `vite`, `@vitejs/plugin-react`
- `@auth0/auth0-react`
- `recharts`

If needed:

```bash
npm install @auth0/auth0-react recharts
```

### 3. Build the extension

```bash
npm run build
```

---

## 🧪 Running Locally (For Development)

1. Go to `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load Unpacked** and choose the `dist/` folder

---

## 🔐 Auth0 Setup

In your `.env`:

```env
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_API_KEY=your-gemini-api-key
```

In Auth0's dashboard, make sure the **callback URL** is included, e.g.:

```
http://localhost:5173/login.html
chrome-extension://[your-extension-id]/login.html
```

---

## 📄 Page-by-Page Overview

### 🔘 **Landing Page** (`landing.html`)
- Central Pomodoro timer with circular focus/break toggle.
- Auth0-protected entry point.
- Dark mode toggle.
- Links to **Settings** and **Performance**.

### 🧩 **Popup Page** (`popup.html`)
- Mini version of the landing timer.
- Persisted timer and blocking toggle.
- Light/Dark toggle, quick home button.

### ⚙️ **Settings Page** (`settings.html`)
- Customize Pomodoro durations (focus/break).
- Input focus whitelisted domains.
- Toggle global dark mode.
- Save settings to `chrome.storage.local`.

### 📈 **Performance Page** (`performance.html`)
- Weekly summary via bar and pie charts.
- Track your daily focus minutes.
- See current streak, daily goal completion.
- Supports light/dark theming.

### 🔐 **Login Page** (`login.html`)
- Redirects to Auth0 login if user isn’t authenticated.
- Post-login, stores `isLoggedIn` flag.

### 👁 **Content Script** (`content.js`)
- Monitors page URL/title.
- Sends classification request to Gemini.
- Applies blur overlay if content is “distracting” during focus.

### 🎛 **Background Script** (`background.js`)
- Maintains timer loop in the background.
- Sends state updates to popup/landing pages.

### 🤖 **Gemini API Utils** (`utils/gemini.js`)
- Sends `title + URL` to Gemini model.
- Returns classification result to content script.

---

## 📁 Project Structure

```
├── public/ (html templates)
├── src/
│   ├── landing/
│   ├── popup/
│   ├── settings/
│   ├── login/
│   ├── performance/
│   ├── background/
│   ├── content/
│   └── utils/
└── vite.config.js
```

---

## 📜 License

MIT License © 2025