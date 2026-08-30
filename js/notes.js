// Notes & Diary page — write a free-form entry per date (persisted locally).
(function (App) {
  'use strict';

  const { Storage, Utils } = App;
  const $ = (id) => document.getElementById(id);

  let current = startOfDay(new Date());
  let searchTerm = '';
  let saveTimer = null;

  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function dateKey() {
    return Utils.toKey(current);
  }

  function relativeLabel(date) {
    const diff = Math.round((startOfDay(date) - startOfDay(new Date())) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === -1) return 'Yesterday';
    if (diff === 1) return 'Tomorrow';
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }

  function firstLine(text) {
    const line = String(text || '').split('\n').find((l) => l.trim());
    return line ? line.trim() : '';
  }

  function countWords(text) {
    const t = String(text || '').trim();
    return t ? t.split(/\s+/).length : 0;
  }

  function showSaved(show) {
    const el = $('save-status');
    el.classList.toggle('text-emerald-400/0', !show);
    el.classList.toggle('text-emerald-400', show);
  }

  // ---- Rendering ----

  function updateHeader() {
    $('date-label').textContent = relativeLabel(current);
    $('date-sub').textContent = Utils.formatLong(current);
    $('date-input').value = dateKey();
  }

  function loadEntryIntoEditor() {
    const entry = Storage.getDiaryEntry(dateKey());
    $('note-title').value = entry.title || '';
    $('note-body').value = entry.body || '';
    $('word-count').textContent = `${countWords(entry.body)} words`;
    showSaved(false);
  }

  function entryItemHtml(e) {
    const d = Utils.fromKey(e.key);
    const active = e.key === dateKey();
    const preview = (e.title && e.title.trim()) ? e.title : firstLine(e.body);
    const dateStr = `${Utils.formatShort(d)}, ${d.getFullYear()}`;
    return `
      <li data-key="${e.key}" class="fade-in cursor-pointer rounded-xl border px-3 py-2.5 transition ${active
        ? 'border-emerald-500/60 bg-emerald-500/5'
        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/40'}">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-semibold ${active ? 'text-emerald-400' : 'text-slate-300'}">${dateStr}</span>
          <span class="text-[10px] uppercase tracking-wide text-slate-600">${Utils.weekday(d)}</span>
        </div>
        <p class="mt-0.5 truncate text-xs text-slate-500">${Utils.escape(preview) || 'No text'}</p>
      </li>`;
  }

  function renderList() {
    const all = Storage.loadDiary();
    let items = Object.keys(all).map((key) => ({ key, ...all[key] }));
    items.sort((a, b) => (a.key < b.key ? 1 : -1)); // newest date first

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter((e) =>
        (e.title || '').toLowerCase().includes(q) || (e.body || '').toLowerCase().includes(q));
    }

    const ul = $('entry-list');
    $('entry-count').textContent = String(items.length);

    if (!items.length) {
      ul.innerHTML = `<li class="rounded-xl border border-dashed border-slate-800 px-3 py-6 text-center text-xs text-slate-500">${
        searchTerm ? 'No matching entries.' : 'No entries yet. Start writing!'
      }</li>`;
    } else {
      ul.innerHTML = items.map(entryItemHtml).join('');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  // ---- Saving ----

  function save() {
    Storage.setDiaryEntry(dateKey(), {
      title: $('note-title').value,
      body: $('note-body').value,
    });
    showSaved(true);
    renderList();
  }

  function flushSave() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    save();
  }

  function scheduleSave() {
    showSaved(false);
    $('word-count').textContent = `${countWords($('note-body').value)} words`;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { saveTimer = null; save(); }, 500);
  }

  // ---- Navigation ----

  function goTo(date) {
    flushSave();            // persist the entry we're leaving
    current = startOfDay(date);
    updateHeader();
    loadEntryIntoEditor();
    renderList();
  }

  function shiftDay(delta) {
    const d = new Date(current);
    d.setDate(d.getDate() + delta);
    goTo(d);
  }

  // ---- Init ----

  function init() {
    updateHeader();
    loadEntryIntoEditor();
    renderList();

    $('note-title').addEventListener('input', scheduleSave);
    $('note-body').addEventListener('input', scheduleSave);
    $('note-title').addEventListener('blur', flushSave);
    $('note-body').addEventListener('blur', flushSave);

    $('prev-day').addEventListener('click', () => shiftDay(-1));
    $('next-day').addEventListener('click', () => shiftDay(1));
    $('today-btn').addEventListener('click', () => goTo(new Date()));
    $('date-input').addEventListener('change', (e) => {
      if (e.target.value) goTo(Utils.fromKey(e.target.value));
    });

    $('entry-search').addEventListener('input', (e) => {
      searchTerm = e.target.value.trim();
      renderList();
    });

    $('entry-list').addEventListener('click', (e) => {
      const li = e.target.closest('[data-key]');
      if (li) goTo(Utils.fromKey(li.dataset.key));
    });

    $('delete-entry').addEventListener('click', () => {
      const hasText = $('note-title').value.trim() || $('note-body').value.trim();
      if (hasText && !confirm('Delete this entry? This cannot be undone.')) return;
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
      Storage.removeDiaryEntry(dateKey());
      $('note-title').value = '';
      $('note-body').value = '';
      $('word-count').textContent = '0 words';
      showSaved(false);
      renderList();
    });

    // Don't lose the last keystrokes when leaving/hiding the page.
    window.addEventListener('beforeunload', flushSave);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushSave();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})(window.HabitApp);
