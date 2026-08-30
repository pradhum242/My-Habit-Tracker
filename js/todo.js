// To-Do List page — add, complete, filter and clear tasks (persisted locally).
(function (App) {
  'use strict';

  const { Storage } = App;
  let filter = 'all'; // 'all' | 'active' | 'done'

  const $ = (id) => document.getElementById(id);

  // Escape user input before inserting it as HTML (prevents XSS).
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function itemHtml(t) {
    return `
      <li data-id="${t.id}" class="fade-in group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
        <button data-action="toggle" aria-label="Toggle complete"
                class="grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition ${t.done ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-600 text-transparent hover:border-emerald-400'}">
          <i data-lucide="check" class="h-4 w-4"></i>
        </button>
        <span class="flex-1 break-words ${t.done ? 'text-slate-500 line-through' : ''}">${escapeHtml(t.text)}</span>
        <button data-action="delete" aria-label="Delete task"
                class="text-slate-500 opacity-0 transition hover:text-red-400 group-hover:opacity-100">
          <i data-lucide="trash-2" class="h-4 w-4"></i>
        </button>
      </li>`;
  }

  function render() {
    const list = Storage.loadTodos();
    const filtered = list.filter((t) => (filter === 'all' ? true : filter === 'active' ? !t.done : t.done));
    const ul = $('todo-list');

    if (!filtered.length) {
      ul.innerHTML = `<li class="rounded-xl border border-dashed border-slate-800 px-4 py-8 text-center text-sm text-slate-500">Nothing here yet.</li>`;
    } else {
      ul.innerHTML = filtered.map(itemHtml).join('');
    }

    const remaining = list.filter((t) => !t.done).length;
    $('todo-count').textContent = `${remaining} item${remaining !== 1 ? 's' : ''} left`;
    if (window.lucide) window.lucide.createIcons();
  }

  function add(text) {
    const list = Storage.loadTodos();
    list.unshift({ id: Date.now().toString(36), text, done: false });
    Storage.saveTodos(list);
    render();
  }

  function toggle(id) {
    const list = Storage.loadTodos();
    const t = list.find((x) => x.id === id);
    if (t) t.done = !t.done;
    Storage.saveTodos(list);
    render();
  }

  function remove(id) {
    Storage.saveTodos(Storage.loadTodos().filter((x) => x.id !== id));
    render();
  }

  function clearDone() {
    Storage.saveTodos(Storage.loadTodos().filter((x) => !x.done));
    render();
  }

  function init() {
    $('todo-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('todo-input');
      const value = input.value.trim();
      if (value) { add(value); input.value = ''; }
    });

    $('todo-list').addEventListener('click', (e) => {
      const li = e.target.closest('[data-id]');
      if (!li) return;
      if (e.target.closest('[data-action="toggle"]')) toggle(li.dataset.id);
      if (e.target.closest('[data-action="delete"]')) remove(li.dataset.id);
    });

    document.querySelectorAll('[data-filter]').forEach((b) => {
      b.addEventListener('click', () => {
        filter = b.dataset.filter;
        document.querySelectorAll('[data-filter]').forEach((x) => x.classList.remove('tab-active'));
        b.classList.add('tab-active');
        render();
      });
    });

    $('clear-done').addEventListener('click', clearDone);
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})(window.HabitApp);
