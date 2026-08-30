# 🥷 Pradhum's Habot Flow

A clean, fast, **offline-first habit tracker** built with plain HTML, CSS, and JavaScript — no build step, no framework, no backend. Track daily habits, journal your days, manage to‑dos, and watch your progress come alive with charts. All your data stays on your own computer.

> *"Never Giving Up thats My Nindo My Ninja Way!!"*

---

## ✨ Features

### ✅ Habits Log
- Monthly grid to tick off your daily habits.
- Per‑day **progress bars** with colour‑coded completion.
- Add a quick **note** to any day.
- **Manage habits** — add your own with a custom label, colour, and icon, or remove ones you don't need.
- Month‑to‑month navigation and a running monthly average.
- 🎉 A themed **celebration sticker + confetti** pops up every time you tick a habit (💧 Water, 💪 Workout, 📚 Read, 😴 Sleep, and more).

### 📊 Analytics
- Per‑habit completion **rings**.
- Overall completion **ring** for the selected range.
- Daily‑progress **line chart** (powered by Chart.js).
- Switch ranges: **Last 7 days**, **This month**, or **All history**.

### 📝 Notes & Diary
- A date‑based journal — write what you learned, what to focus on, reminders, or anything about your day.
- **Auto‑saves** as you type, with a live word count.
- Browse and **search** all past entries; jump to any date or delete entries.

### 🗒️ To‑Do
- Add, complete, and delete tasks.
- Filter by **All / Active / Done** and clear completed in one click.

### 🎈 Just for fun
- The **Hiii!!** button launches a bouncing‑ball screensaver using your own image (`Media.jpg`) with true elastic wall collisions.
- **Click the ball** to open it full‑size with a ninja caption.

---

## 🧱 Tech stack

- **HTML5 + vanilla JavaScript** (modular, no framework)
- **Tailwind CSS** (via CDN) + a small custom stylesheet
- **Chart.js** for analytics charts
- **Lucide** icons
- **localStorage** for persistence
- **Google Fonts** (Inter)

---

## 📁 Project structure

```
habit tracker/
├── index.html            # Habits Log (home)
├── analytics.html        # Analytics dashboard
├── todo.html             # To-Do list
├── notes.html            # Notes & Diary
├── Media.jpg             # Image used by the bouncing-ball easter egg
├── Open Habit Tracker.bat# One-click launcher (Windows)
├── css/
│   └── styles.css        # Custom styles + animations
└── js/
    ├── config.js         # Default habits + icon choices
    ├── utils.js          # Shared date/formatting helpers
    ├── storage.js        # localStorage persistence layer
    ├── tracker.js        # Habits Log logic
    ├── analytics.js      # Analytics + charts
    ├── todo.js           # To-Do logic
    ├── notes.js          # Notes & Diary logic
    ├── stickers.js       # Celebration stickers on tick
    └── bounce.js         # "Hiii!!" bouncing ball + lightbox
```

---

## 🚀 Getting started

No installation or build required.

### Option 1 — Open directly
Just double‑click **`index.html`** (or `Open Habit Tracker.bat` on Windows) and it opens in your default browser.

### Option 2 — Run a local server
Some browsers are stricter about local files. To serve it locally:

```bash
# Python 3
python -m http.server 8000
```

Then visit **http://localhost:8000/index.html**.

> **Tip:** Pick one method and stick with it. Because data is stored per‑origin, notes saved via `file://` and via `http://localhost:8000` live in separate buckets.

---

## 💾 Data & privacy

Everything is stored **locally in your browser** using `localStorage` — nothing is ever uploaded.

| Key | What it stores |
| --- | --- |
| `habitTracker.days.v1` | Daily habit ticks and notes |
| `habitTracker.habits.v1` | Your habit list |
| `habitTracker.todos.v1` | To‑do items |
| `habitTracker.diary.v1` | Notes & Diary entries |

**Good to know:**
- Data is tied to the **browser** and the **URL/origin** you use.
- Clearing your browser's site data will erase your habits — avoid "Clear cookies/site data" for this page.
- It stays on one device (not synced to the cloud).

---

## 🎨 Customization

- **Habits:** use the **Add habit** button on the Habits Log to create your own with a custom name, colour, and icon.
- **Bounce image:** replace `Media.jpg` in the project root with any image (`.png`, `.jpg`, `.jpeg`, `.webp`, or `.gif` all work).
- **Default habits & icons:** edit [`js/config.js`](js/config.js).
- **Theme & animations:** tweak [`css/styles.css`](css/styles.css).

---

## 🗺️ Ideas for later

- Export / import data as JSON for backup and moving between devices.
- Habit streaks and reminders.
- Optional cloud sync.

---

## 📜 License

Released under the **MIT License** — feel free to use, modify, and share. Add a `LICENSE` file if you plan to publish.

---

## 👤 Author

**Pradhum** — *Habot Flow*

Made with 💚 and a bit of ninja spirit.
