// "Hiii!!" screensaver — bounces copies of an image around the screen for a
// few seconds. Balls bounce off the walls and collide with each other using
// equal-mass perfectly-elastic collisions. Purely visual.
window.HabitApp = window.HabitApp || {};
(function (App) {
  'use strict';

  const DURATION = 5000; // ms on screen
  const COUNT = 1;       // how many bouncing images
  const SIZE = 96;       // diameter in px
  const R = SIZE / 2;

  let running = false;
  let currentLayer = null;
  let rafId = 0;

  const rand = (min, max) => min + Math.random() * (max - min);

  const CAPTION = 'Never Giving Up thats My Nindo My Ninja Way!!';

  // Stop the current bounce run and remove its layer.
  function stopBounce() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    if (currentLayer) { currentLayer.remove(); currentLayer = null; }
    running = false;
  }

  // Full-image lightbox with the ninja caption, opened by clicking the ball.
  function openLightbox(imageUrl) {
    const overlay = document.createElement('div');
    overlay.className = 'ball-modal';

    const card = document.createElement('div');
    card.className = 'ball-modal-card';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ball-modal-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';
    card.appendChild(closeBtn);

    if (imageUrl) {
      const img = document.createElement('img');
      img.className = 'ball-modal-img';
      img.src = imageUrl;
      img.alt = '';
      card.appendChild(img);
    }

    const cap = document.createElement('p');
    cap.className = 'ball-modal-caption';
    cap.textContent = CAPTION;
    card.appendChild(cap);

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target === closeBtn) close();
    });
    document.addEventListener('keydown', onKey);
  }

  // Accept a bare path ('assets/hiii') and try common image extensions so the
  // user can save the file as png/jpg/jpeg/webp/gif and it still works.
  function candidatesFor(src) {
    if (!src) return [];
    if (/\.(png|jpe?g|webp|gif|svg)$/i.test(src)) return [src];
    return ['.png', '.jpg', '.jpeg', '.webp', '.gif'].map((ext) => src + ext);
  }

  // Resolve the first candidate URL that actually loads; null if none exist.
  function resolveImage(candidates, cb) {
    let i = 0;
    (function tryNext() {
      if (i >= candidates.length) { cb(null); return; }
      const url = candidates[i++];
      const test = new Image();
      test.onload = () => cb(url);
      test.onerror = tryNext;
      test.src = url;
    })();
  }

  function makeBall(layer, imageUrl, W, H) {
    const el = document.createElement('div');
    el.className = 'bounce-ball';
    el.style.width = el.style.height = SIZE + 'px';

    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = '';
      // If the image isn't there yet, fall back to a funny "Hiii!!" ball.
      img.onerror = () => { el.classList.add('bounce-fallback'); el.textContent = 'Hiii!!'; };
      el.appendChild(img);
    } else {
      el.classList.add('bounce-fallback');
      el.textContent = 'Hiii!!';
    }
    layer.appendChild(el);
    el.addEventListener('click', () => { stopBounce(); openLightbox(imageUrl); });

    return {
      el,
      x: rand(R, W - R),
      y: rand(R, H - R),
      vx: rand(110, 230) * (Math.random() < 0.5 ? -1 : 1),
      vy: rand(110, 230) * (Math.random() < 0.5 ? -1 : 1),
      spin: rand(-220, 220),
      rot: 0,
    };
  }

  function launch(imageUrl) {
    const layer = document.createElement('div');
    layer.className = 'bounce-layer';
    document.body.appendChild(layer);
    currentLayer = layer;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const balls = Array.from({ length: COUNT }, () => makeBall(layer, imageUrl, W, H));

    const start = performance.now();
    let last = start;

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.032); // clamp to avoid tunnelling
      last = now;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Move + bounce off the walls (elastic: flip the velocity component).
      for (const b of balls) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rot += b.spin * dt;
        if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx); }
        else if (b.x > w - R) { b.x = w - R; b.vx = -Math.abs(b.vx); }
        if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy); }
        else if (b.y > h - R) { b.y = h - R; b.vy = -Math.abs(b.vy); }
      }

      // Ball-to-ball collisions (equal mass → swap the normal components).
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i];
          const c = balls[j];
          const dx = c.x - a.x;
          const dy = c.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          if (dist < SIZE) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (SIZE - dist) / 2;
            a.x -= nx * overlap; a.y -= ny * overlap;
            c.x += nx * overlap; c.y += ny * overlap;

            const an = a.vx * nx + a.vy * ny;
            const cn = c.vx * nx + c.vy * ny;
            const diff = an - cn;
            if (diff > 0) { // only if approaching
              a.vx -= diff * nx; a.vy -= diff * ny;
              c.vx += diff * nx; c.vy += diff * ny;
            }
          }
        }
      }

      for (const b of balls) {
        b.el.style.transform = `translate(${b.x - R}px, ${b.y - R}px) rotate(${b.rot}deg)`;
      }

      if (now - start < DURATION) {
        rafId = requestAnimationFrame(frame);
      } else {
        rafId = 0;
        layer.classList.add('bounce-out');
        setTimeout(() => { layer.remove(); if (currentLayer === layer) currentLayer = null; running = false; }, 400);
      }
    }

    rafId = requestAnimationFrame(frame);
  }

  function play(src) {
    if (running) return;
    running = true;
    resolveImage(candidatesFor(src), launch);
  }

  App.Bounce = { play };
})(window.HabitApp);
