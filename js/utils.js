// Small date helpers shared across pages.
window.HabitApp = window.HabitApp || {};
(function (App) {
  'use strict';

  // Convert a Date to a stable "YYYY-MM-DD" storage key (local time).
  function toKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function fromKey(key) {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function formatLong(date) {
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function formatShort(date) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function weekday(date) {
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function isSameDay(a, b) {
    return toKey(a) === toKey(b);
  }

  function isFuture(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() > today.getTime();
  }

  // Escape a string before inserting it as HTML (prevents XSS from custom labels).
  function escape(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  App.Utils = { toKey, fromKey, formatLong, formatShort, weekday, daysInMonth, isSameDay, isFuture, escape };
})(window.HabitApp);
