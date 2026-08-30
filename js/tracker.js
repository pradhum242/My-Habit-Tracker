// Habits Log page — renders the monthly table, handles toggles/notes,
// month navigation and live progress bars.
(function (App) {
  'use strict';

  const { Storage, Utils } = App;
  let HABITS = Storage.getHabits();
  let viewDate = new Date(); // any day within the currently viewed month

  const $ = (id) => document.getElementById(id);

  // ---- Progress helpers ----
  function computeProgress(day) {
    const total = HABITS.length;
    let done = 0;
    HABITS.forEach((h) => { if (day.habits && day.habits[h.id]) done++; });
    return { done, total, pct: Math.round((done / total) * 100) };
  }

  function barColor(pct) {
    if (pct >= 67) return '#10b981'; // emerald
    if (pct >= 34) return '#f59e0b'; // amber
    if (pct > 0)  return '#ef4444'; // red
    return '#334155';               // empty track colour
  }

  // ---- Rendering ----
  function buildHead() {
    $('tracker-head').innerHTML = `
      <tr class="border-b border-slate-800">
        <th class="sticky-col bg-slate-950 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Day</th>
        ${HABITS.map((h) => `
          <th class="px-2 py-3">
            <div class="flex flex-col items-center gap-1">
              <span class="grid h-8 w-8 place-items-center rounded-lg" style="background:${h.color}22;color:${h.color}">
                <i data-lucide="${h.icon}" class="h-4 w-4"></i>
              </span>
              <span class="text-[11px] font-medium text-slate-400">${Utils.escape(h.label)}</span>
            </div>
          </th>`).join('')}
        <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Progress</th>
        <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</th>
      </tr>`;
  }

  function rowHtml(date) {
    const key = Utils.toKey(date);
    const day = Storage.getDay(key);
    const prog = computeProgress(day);
    const future = Utils.isFuture(date);
    const today = Utils.isSameDay(date, new Date());

    const checks = HABITS.map((h) => `
      <td class="px-2 py-2 text-center">
        <input type="checkbox" class="habit-check" data-habit="${h.id}"
               style="--habit-color:${h.color}"
               ${day.habits && day.habits[h.id] ? 'checked' : ''}
               ${future ? 'disabled' : ''}
               aria-label="${Utils.escape(h.label)}">
      </td>`).join('');

    return `
      <tr data-date="${key}" class="border-b border-slate-800/70 ${today ? 'bg-emerald-500/5' : ''} ${future ? 'opacity-40' : ''} hover:bg-slate-900/50">
        <td class="sticky-col ${today ? 'bg-[#0c1a17]' : 'bg-slate-950'} px-4 py-2">
          <div class="flex flex-col">
            <span class="text-sm ${today ? 'font-semibold text-emerald-400' : 'text-slate-200'}">${Utils.formatLong(date)}</span>
            <span class="text-[11px] text-slate-500">${Utils.weekday(date)}${today ? ' · Today' : ''}</span>
          </div>
        </td>
        ${checks}
        <td class="px-3 py-2">
          <div class="flex min-w-[120px] items-center gap-2">
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div class="progress-fill h-full rounded-full" style="width:${prog.pct}%;background-color:${barColor(prog.pct)}"></div>
            </div>
            <span class="progress-label w-9 text-right text-xs font-semibold tabular-nums text-slate-300">${prog.pct}%</span>
          </div>
        </td>
        <td class="px-3 py-2">
          <input type="text" class="notes-input w-full min-w-[160px] rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                 placeholder="Add a note..." ${future ? 'disabled' : ''}>
        </td>
      </tr>`;
  }

  function buildBody() {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const n = Utils.daysInMonth(y, m);
    const rows = [];
    for (let d = 1; d <= n; d++) rows.push(rowHtml(new Date(y, m, d)));
    $('tracker-body').innerHTML = rows.join('');
    // Set note values as properties (not attributes) to avoid HTML injection.
    document.querySelectorAll('#tracker-body tr').forEach((tr) => {
      const inp = tr.querySelector('.notes-input');
      if (inp) inp.value = Storage.getDay(tr.dataset.date).notes || '';
    });
  }

  function updateHeader() {
    $('habit-count').textContent = HABITS.length;
    $('month-label').textContent = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const n = Utils.daysInMonth(y, m);
    let sum = 0, count = 0;
    for (let d = 1; d <= n; d++) {
      const date = new Date(y, m, d);
      if (Utils.isFuture(date)) break;
      sum += computeProgress(Storage.getDay(Utils.toKey(date))).pct;
      count++;
    }
    $('month-avg').textContent = (count ? Math.round(sum / count) : 0) + '%';
  }

  function render() {
    HABITS = Storage.getHabits();
    buildHead();
    buildBody();
    updateHeader();
    if (window.lucide) window.lucide.createIcons();
  }

  function updateRowProgress(tr, key) {
    const prog = computeProgress(Storage.getDay(key));
    const fill = tr.querySelector('.progress-fill');
    const label = tr.querySelector('.progress-label');
    fill.style.width = prog.pct + '%';
    fill.style.backgroundColor = barColor(prog.pct);
    label.textContent = prog.pct + '%';
  }

  // ---- Events ----
  function onChange(e) {
    const el = e.target;
    if (!el.classList.contains('habit-check')) return;
    const tr = el.closest('tr');
    const key = tr.dataset.date;
    Storage.setHabit(key, el.dataset.habit, el.checked);
    updateRowProgress(tr, key);
    updateHeader();
    if (el.checked && App.Stickers) {
      const r = el.getBoundingClientRect();
      const habit = HABITS.find((h) => h.id === el.dataset.habit);
      App.Stickers.celebrate(r.left + r.width / 2, r.top + r.height / 2, habit);
    }
  }

  function onInput(e) {
    const el = e.target;
    if (!el.classList.contains('notes-input')) return;
    Storage.setNotes(el.closest('tr').dataset.date, el.value);
  }

  function clearMonth() {
    if (!confirm('Clear all habit data for ' + $('month-label').textContent + '?')) return;
    const all = Storage.loadAll();
    const prefix = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-`;
    Object.keys(all).forEach((k) => { if (k.startsWith(prefix)) delete all[k]; });
    Storage.saveAll(all);
    render();
  }

  // ---- Manage-habits modal ----
  function renderManageList() {
    $('habit-manage-list').innerHTML = HABITS.map((h) => `
      <div class="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
        <span class="grid h-7 w-7 shrink-0 place-items-center rounded-md" style="background:${h.color}22;color:${h.color}">
          <i data-lucide="${h.icon}" class="h-4 w-4"></i>
        </span>
        <span class="flex-1 truncate text-sm">${Utils.escape(h.label)}</span>
        <button data-remove="${h.id}" aria-label="Remove ${Utils.escape(h.label)}" class="text-slate-500 transition hover:text-red-400">
          <i data-lucide="trash-2" class="h-4 w-4"></i>
        </button>
      </div>`).join('');
  }

  function buildIconGrid() {
    $('icon-grid').innerHTML = App.ICON_CHOICES.map((name, i) => `
      <button type="button" data-icon="${name}" class="icon-pick grid h-8 w-8 place-items-center rounded-md border border-slate-800 text-slate-300 transition hover:bg-slate-800 ${i === 0 ? 'tab-active' : ''}">
        <i data-lucide="${name}" class="h-4 w-4"></i>
      </button>`).join('');
    $('habit-icon').value = App.ICON_CHOICES[0];
  }

  function openModal() {
    renderManageList();
    $('habit-modal').classList.remove('hidden');
    $('habit-modal').classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  }

  function closeModal() {
    $('habit-modal').classList.add('hidden');
    $('habit-modal').classList.remove('flex');
  }

  function onAddHabit(e) {
    e.preventDefault();
    const name = $('habit-name').value.trim();
    if (!name) return;
    Storage.addHabit({ label: name, color: $('habit-color').value, icon: $('habit-icon').value });
    $('habit-name').value = '';
    render();
    renderManageList();
    if (window.lucide) window.lucide.createIcons();
  }

  function onManageClick(e) {
    const btn = e.target.closest('[data-remove]');
    if (!btn) return;
    if (HABITS.length <= 1) { alert('Keep at least one habit.'); return; }
    if (!confirm('Remove this habit? Its check marks will be discarded.')) return;
    Storage.removeHabit(btn.dataset.remove);
    render();
    renderManageList();
    if (window.lucide) window.lucide.createIcons();
  }

  function onIconPick(e) {
    const btn = e.target.closest('[data-icon]');
    if (!btn) return;
    $('icon-grid').querySelectorAll('.icon-pick').forEach((b) => b.classList.remove('tab-active'));
    btn.classList.add('tab-active');
    $('habit-icon').value = btn.dataset.icon;
  }

  function init() {
    const body = $('tracker-body');
    body.addEventListener('change', onChange);
    body.addEventListener('input', onInput);

    $('btn-prev').addEventListener('click', () => { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1); render(); });
    $('btn-next').addEventListener('click', () => { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1); render(); });
    $('btn-today').addEventListener('click', () => { viewDate = new Date(); render(); });
    $('btn-hiii').addEventListener('click', () => { if (App.Bounce) App.Bounce.play('Media.jpg'); });
    $('btn-clear').addEventListener('click', clearMonth);

    // Manage-habits modal
    $('btn-manage').addEventListener('click', openModal);
    $('modal-close').addEventListener('click', closeModal);
    $('habit-modal').addEventListener('click', (e) => { if (e.target.id === 'habit-modal') closeModal(); });
    $('habit-add-form').addEventListener('submit', onAddHabit);
    $('habit-manage-list').addEventListener('click', onManageClick);
    $('icon-grid').addEventListener('click', onIconPick);
    buildIconGrid();

    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})(window.HabitApp);
