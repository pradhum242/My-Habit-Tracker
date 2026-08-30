// Celebratory stickers — a themed sticker + confetti burst pops up on the
// Habits Log every time a habit is ticked. Purely visual; nothing is stored.
window.HabitApp = window.HabitApp || {};
(function (App) {
  'use strict';

  // Drop-in for a custom sticker image: set this to an image URL (e.g.
  // 'assets/sticker.png') and every tick shows that image instead of an emoji.
  const STICKER_IMAGE = null;

  // Themed emoji per habit icon (falls back to the habit id, then a cheer).
  const ICON_STICKERS = {
    bed: '😴', moon: '😴', sleep: '😴',
    utensils: '🍎', apple: '🍎', salad: '🥗', food: '🍽️',
    footprints: '🚶', walk: '🚶', bike: '🚴',
    'book-open': '📚', read: '📚', pencil: '✏️', code: '💻',
    dumbbell: '💪', workout: '💪', heart: '❤️',
    droplet: '💧', 'glass-water': '💧', water: '💧',
    brain: '🧠', sun: '☀️', coffee: '☕', music: '🎵',
    leaf: '🌿', sprout: '🌱', smile: '😄', pill: '💊',
    guitar: '🎸', palette: '🎨', star: '⭐',
  };

  const CHEERS = ['🎉', '✨', '⭐', '🔥', '💯', '👏', '🙌', '🌟'];
  const CONFETTI_COLORS = ['#10b981', '#f59e0b', '#60a5fa', '#f87171', '#a78bfa', '#22d3ee', '#fbbf24'];

  function pickSticker(habit) {
    if (habit) {
      if (ICON_STICKERS[habit.icon]) return ICON_STICKERS[habit.icon];
      if (ICON_STICKERS[habit.id]) return ICON_STICKERS[habit.id];
    }
    return CHEERS[Math.floor(Math.random() * CHEERS.length)];
  }

  function ensureLayer() {
    let layer = document.getElementById('sticker-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'sticker-layer';
      document.body.appendChild(layer);
    }
    return layer;
  }

  function spawnConfetti(layer, x, y) {
    const n = 14;
    for (let i = 0; i < n; i++) {
      const bit = document.createElement('span');
      bit.className = 'confetti-bit';
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.6;
      const dist = 45 + Math.random() * 65;
      bit.style.left = x + 'px';
      bit.style.top = y + 'px';
      bit.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      bit.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      bit.style.setProperty('--dy', (Math.sin(angle) * dist - 15) + 'px');
      bit.style.animationDelay = Math.random() * 40 + 'ms';
      layer.appendChild(bit);
      setTimeout(() => bit.remove(), 950);
    }
  }

  // Pop a sticker + confetti centred on viewport coords (x, y).
  function celebrate(x, y, habit) {
    const layer = ensureLayer();

    const sticker = document.createElement('div');
    sticker.className = 'sticker-pop';
    if (STICKER_IMAGE) {
      const img = document.createElement('img');
      img.src = STICKER_IMAGE;
      img.alt = '';
      sticker.appendChild(img);
    } else {
      sticker.textContent = pickSticker(habit);
    }
    sticker.style.left = x + 'px';
    sticker.style.top = y + 'px';
    layer.appendChild(sticker);
    setTimeout(() => sticker.remove(), 1100);

    spawnConfetti(layer, x, y);
  }

  App.Stickers = { celebrate };
})(window.HabitApp);
