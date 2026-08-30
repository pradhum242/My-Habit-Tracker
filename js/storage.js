// LocalStorage persistence layer. All reads/writes go through here so the
// data shape stays consistent across pages.
window.HabitApp = window.HabitApp || {};
(function (App) {
  'use strict';

  const STORAGE_KEY = 'habitTracker.days.v1';
  const TODO_KEY = 'habitTracker.todos.v1';
  const HABITS_KEY = 'habitTracker.habits.v1';
  const DIARY_KEY = 'habitTracker.diary.v1';

  // ---- Habit day data ----
  // Shape: { "YYYY-MM-DD": { habits: { sleep: true, ... }, notes: "" } }

  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      console.warn('Could not parse stored habit data, starting fresh.', e);
      return {};
    }
  }

  function saveAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getDay(dateKey) {
    const all = loadAll();
    return all[dateKey] || { habits: {}, notes: '' };
  }

  function setHabit(dateKey, habitId, checked) {
    const all = loadAll();
    if (!all[dateKey]) all[dateKey] = { habits: {}, notes: '' };
    all[dateKey].habits[habitId] = checked;
    saveAll(all);
  }

  function setNotes(dateKey, notes) {
    const all = loadAll();
    if (!all[dateKey]) all[dateKey] = { habits: {}, notes: '' };
    all[dateKey].notes = notes;
    saveAll(all);
  }

  // ---- Habit list (defaults + user-added) ----
  // Shape: [ { id, label, icon, color, custom? } ]

  function getHabits() {
    try {
      const stored = JSON.parse(localStorage.getItem(HABITS_KEY));
      if (Array.isArray(stored) && stored.length) return stored;
    } catch (e) { /* fall through to seed defaults */ }
    const defaults = (App.DEFAULT_HABITS || []).map((h) => Object.assign({}, h));
    saveHabits(defaults);
    return defaults;
  }

  function saveHabits(list) {
    localStorage.setItem(HABITS_KEY, JSON.stringify(list));
  }

  function addHabit(habit) {
    const list = getHabits();
    const label = String(habit.label || '').trim().slice(0, 24) || 'Habit';
    const color = /^#[0-9a-fA-F]{6}$/.test(habit.color) ? habit.color : '#10b981';
    const icons = App.ICON_CHOICES || [];
    const icon = icons.indexOf(habit.icon) >= 0 ? habit.icon : (icons[0] || 'star');

    let base = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'habit';
    let id = base;
    const ids = list.map((h) => h.id);
    while (ids.indexOf(id) >= 0) id = base + '-' + Math.random().toString(36).slice(2, 5);

    list.push({ id, label, icon, color, custom: true });
    saveHabits(list);
    return list;
  }

  function removeHabit(id) {
    const list = getHabits().filter((h) => h.id !== id);
    saveHabits(list);
    return list;
  }

  // ---- To-do data ----
  // Shape: [ { id, text, done } ]

  function loadTodos() {
    try {
      return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveTodos(list) {
    localStorage.setItem(TODO_KEY, JSON.stringify(list));
  }

  // ---- Diary / date notes ----
  // Shape: { "YYYY-MM-DD": { title: "", body: "", updated: <ms> } }

  function loadDiary() {
    try {
      return JSON.parse(localStorage.getItem(DIARY_KEY)) || {};
    } catch (e) {
      console.warn('Could not parse stored diary data, starting fresh.', e);
      return {};
    }
  }

  function saveDiary(data) {
    localStorage.setItem(DIARY_KEY, JSON.stringify(data));
  }

  function getDiaryEntry(dateKey) {
    const all = loadDiary();
    return all[dateKey] || { title: '', body: '', updated: 0 };
  }

  // Empty entries are removed so they don't clutter the entries list.
  function setDiaryEntry(dateKey, entry) {
    const all = loadDiary();
    const title = String(entry.title || '');
    const body = String(entry.body || '');
    if (!title.trim() && !body.trim()) {
      delete all[dateKey];
    } else {
      all[dateKey] = { title, body, updated: Date.now() };
    }
    saveDiary(all);
  }

  function removeDiaryEntry(dateKey) {
    const all = loadDiary();
    delete all[dateKey];
    saveDiary(all);
  }

  App.Storage = {
    STORAGE_KEY,
    loadAll,
    saveAll,
    getDay,
    setHabit,
    setNotes,
    getHabits,
    saveHabits,
    addHabit,
    removeHabit,
    loadTodos,
    saveTodos,
    loadDiary,
    saveDiary,
    getDiaryEntry,
    setDiaryEntry,
    removeDiaryEntry,
  };
})(window.HabitApp);
