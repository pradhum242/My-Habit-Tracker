// Analytics page — per-habit rings, total completion and the daily-progress
// line chart. Everything reacts to the selected time range.
(function (App) {
  'use strict';

  const { Storage, Utils } = App;
  let HABITS = Storage.getHabits();
  let currentRange = 'month'; // 'week' | 'month' | 'full'
  let chart = null;

  const $ = (id) => document.getElementById(id);

  // ---- Date range helpers ----
  function listDates(start, end) {
    const arr = [];
    const d = new Date(start); d.setHours(0, 0, 0, 0);
    const e = new Date(end); e.setHours(0, 0, 0, 0);
    while (d <= e) { arr.push(new Date(d)); d.setDate(d.getDate() + 1); }
    return arr;
  }

  function getRange(kind) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (kind === 'week') {
      const s = new Date(today); s.setDate(today.getDate() - 6);
      return { start: s, end: today };
    }
    if (kind === 'month') {
      return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today };
    }
    // 'full' — earliest recorded day through today (all history).
    const keys = Object.keys(Storage.loadAll()).sort();
    const start = keys.length ? Utils.fromKey(keys[0]) : new Date(today.getFullYear(), today.getMonth(), 1);
    return { start, end: today };
  }

  function rangeLabel() {
    if (currentRange === 'week') return 'Last 7 days';
    if (currentRange === 'month') return 'This month to date';
    return 'All recorded history';
  }

  // ---- Stats ----
  function computeStats(start, end) {
    const dates = listDates(start, end);
    const all = Storage.loadAll();
    const perHabit = {};
    HABITS.forEach((h) => { perHabit[h.id] = 0; });
    let totalChecks = 0;

    const daily = dates.map((d) => {
      const day = all[Utils.toKey(d)] || { habits: {} };
      let done = 0;
      HABITS.forEach((h) => {
        if (day.habits && day.habits[h.id]) { perHabit[h.id]++; done++; totalChecks++; }
      });
      return { date: d, pct: Math.round((done / HABITS.length) * 100) };
    });

    const nDays = dates.length || 1;
    const habitPct = {};
    HABITS.forEach((h) => { habitPct[h.id] = Math.round((perHabit[h.id] / nDays) * 100); });
    const totalPct = Math.round((totalChecks / (nDays * HABITS.length)) * 100);

    return { daily, perHabit, habitPct, totalPct, nDays };
  }

  // ---- SVG ring ----
  function ring(pct, color, r, sw) {
    const size = (r + sw) * 2;
    const c = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(100, pct));
    const off = c * (1 - clamped / 100);
    return `
      <svg viewBox="0 0 ${size} ${size}" class="h-full w-full -rotate-90">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#1e293b" stroke-width="${sw}" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"
                stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"
                style="transition:stroke-dashoffset .6s ease" />
      </svg>`;
  }

  // ---- Rendering ----
  function renderSidebar(stats) {
    $('habit-stats').innerHTML = HABITS.map((h) => {
      const pct = stats.habitPct[h.id] || 0;
      const count = stats.perHabit[h.id] || 0;
      return `
        <div class="flex items-center gap-3 rounded-xl bg-slate-800/40 p-3">
          <div class="relative h-14 w-14 shrink-0">
            ${ring(pct, h.color, 14, 5)}
            <span class="absolute inset-0 grid place-items-center text-xs font-semibold" style="color:${h.color}">${pct}%</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="grid h-6 w-6 place-items-center rounded-md" style="background:${h.color}22;color:${h.color}">
                <i data-lucide="${h.icon}" class="h-3.5 w-3.5"></i>
              </span>
              <p class="truncate font-medium">${Utils.escape(h.label)}</p>
            </div>
            <p class="mt-0.5 text-xs text-slate-400">${count} / ${stats.nDays} days</p>
          </div>
        </div>`;
    }).join('');

    $('total-ring').innerHTML = ring(stats.totalPct, '#10b981', 26, 8);
    $('total-pct').textContent = stats.totalPct + '%';
    $('range-note').textContent = rangeLabel();
  }

  function renderChart(stats) {
    const canvas = $('progressChart');
    const ctx = canvas.getContext('2d');
    const labels = stats.daily.map((d) => Utils.formatShort(d.date));
    const data = stats.daily.map((d) => d.pct);

    const gradient = ctx.createLinearGradient(0, 0, 0, 380);
    gradient.addColorStop(0, 'rgba(16,185,129,0.35)');
    gradient.addColorStop(1, 'rgba(16,185,129,0)');

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Daily completion',
          data,
          borderColor: '#10b981',
          backgroundColor: gradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointRadius: data.length > 40 ? 0 : 3,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#04231f',
          pointHoverRadius: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            borderColor: '#334155',
            borderWidth: 1,
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            padding: 10,
            displayColors: false,
            callbacks: { label: (c) => ` ${c.parsed.y}% complete` },
          },
        },
        scales: {
          x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
          y: { min: 0, max: 100, grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', stepSize: 25, callback: (v) => v + '%' } },
        },
      },
    });
  }

  function render() {
    HABITS = Storage.getHabits();
    const { start, end } = getRange(currentRange);
    const stats = computeStats(start, end);
    renderSidebar(stats);
    renderChart(stats);
    if (window.lucide) window.lucide.createIcons();
  }

  function init() {
    document.querySelectorAll('[data-range]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentRange = btn.dataset.range;
        document.querySelectorAll('[data-range]').forEach((b) => b.classList.remove('tab-active'));
        btn.classList.add('tab-active');
        render();
      });
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})(window.HabitApp);
