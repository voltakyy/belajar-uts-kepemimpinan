/* ============================================================
   Auto-scroll materi kuliah (ala pembaca komik)
   Kecepatan 0,5x–4x, halus di HP, jeda otomatis saat digeser.

   Pasang di halaman mana pun:
     <link rel="stylesheet" href="autoscroll.css">
     <script src="autoscroll.js" defer></script>
   ============================================================ */
(function () {
  "use strict";

  const body = document.body;
  if (!body || document.getElementById("autoscrollDock")) return;
  body.classList.add("has-autoscroll");

  const STORE_KEY = "kki_autoscroll_speed_v1";
  const MIN_SPEED = 0.5;
  const MAX_SPEED = 4;
  const STEP = 0.25;
  const RAMP_MS = 420;
  const BASE_MOBILE_PX = 44;
  const BASE_DESKTOP_PX = 58;
  const SAMPLE_FRAMES = 15;
  const MIN_SCROLLABLE = 140;

  const docEl = document.documentElement;
  const scroller = document.scrollingElement || docEl;

  const dock = document.createElement("div");
  dock.className = "autoscroll-dock";
  dock.id = "autoscrollDock";
  dock.setAttribute("role", "group");
  dock.setAttribute("aria-label", "Kontrol auto-scroll");
  dock.innerHTML =
    '<button class="as-play" type="button" id="asPlay" aria-pressed="false" ' +
    'aria-label="Mulai auto-scroll" title="Mulai / jeda auto-scroll">' +
    '<span class="as-ico as-ico-play" aria-hidden="true">' +
    '<svg viewBox="0 0 24 24"><path d="M7.5 4.8a1 1 0 0 1 1.52-.85l11 7.2a1 1 0 0 1 0 1.7l-11 7.2A1 1 0 0 1 7.5 19.2z"/></svg>' +
    "</span>" +
    '<span class="as-ico as-ico-pause" aria-hidden="true">' +
    '<svg viewBox="0 0 24 24"><path d="M6.5 4h4v16h-4zM13.5 4h4v16h-4z"/></svg>' +
    "</span>" +
    "</button>" +
    '<div class="as-body">' +
    '<div class="as-top">' +
    '<span class="as-title">Auto-scroll</span>' +
    '<span class="as-speed" id="asSpeed">1×</span>' +
    "</div>" +
    '<input class="as-range" id="asRange" type="range" min="0.5" max="4" step="0.25" value="1" ' +
    'aria-label="Kecepatan auto-scroll, 0,5 sampai 4 kali">' +
    "</div>" +
    '<div class="as-progress" aria-hidden="true"><i id="asFill"></i></div>';
  body.appendChild(dock);

  const playBtn = dock.querySelector("#asPlay");
  const range = dock.querySelector("#asRange");
  const speedOut = dock.querySelector("#asSpeed");
  const fill = dock.querySelector("#asFill");

  let speed = 1;
  let playing = false;
  let raf = 0;
  let lastTs = 0;
  let startTs = 0;
  let frames = 0;
  let pos = 0;
  let maxY = 1;
  let basePx = BASE_DESKTOP_PX;
  let savedBehavior = null;
  let lastPct = -1;
  let saveTimer = 0;
  let scrollRaf = 0;

  function clampSpeed(v) {
    if (!isFinite(v)) v = 1;
    return Math.min(MAX_SPEED, Math.max(MIN_SPEED, Math.round(v / STEP) * STEP));
  }

  function speedLabel(v) {
    return String(Math.round(v * 100) / 100).replace(".", ",") + "×";
  }

  function loadSpeed() {
    let v = 1;
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw !== null) v = parseFloat(raw);
    } catch (e) { /* storage diblokir */ }
    return clampSpeed(v);
  }

  function saveSpeed(v) {
    try {
      localStorage.setItem(STORE_KEY, String(v));
    } catch (e) { /* abaikan */ }
  }

  function setSpeed(v, persist) {
    speed = clampSpeed(v);
    if (range.value !== String(speed)) range.value = String(speed);
    speedOut.textContent = speedLabel(speed);
    range.setAttribute("aria-valuetext", speedLabel(speed));
    range.style.setProperty(
      "--fill",
      ((speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)) * 100 + "%"
    );
    if (persist) saveSpeed(speed);
  }

  function refreshMax() {
    maxY = Math.max(1, scroller.scrollHeight - window.innerHeight);
  }

  function syncDock() {
    refreshMax();
    const enough = maxY >= MIN_SCROLLABLE;
    dock.style.display = enough ? "" : "none";
    if (!enough && playing) setPlaying(false);
  }

  function paintProgress(pct) {
    pct = Math.max(0, Math.min(100, pct));
    pct = Math.round(pct * 10) / 10;
    if (pct === lastPct) return;
    lastPct = pct;
    fill.style.width = pct + "%";
  }

  function progressNow() {
    return (window.scrollY / maxY) * 100;
  }

  function begin() {
    refreshMax();

    if (savedBehavior === null) {
      savedBehavior = docEl.style.scrollBehavior;
      docEl.style.scrollBehavior = "auto";
    }

    if (window.scrollY >= maxY - 2) {
      window.scrollTo(0, 0);
    }

    pos = window.scrollY;
    basePx = window.matchMedia("(max-width: 640px)").matches
      ? BASE_MOBILE_PX
      : BASE_DESKTOP_PX;
    lastTs = 0;
    startTs = 0;
    frames = 0;
    lastPct = -1;

    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function endLoop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    if (savedBehavior !== null) {
      docEl.style.scrollBehavior = savedBehavior;
      savedBehavior = null;
    }
    refreshMax();
    paintProgress(progressNow());
  }

  function setPlaying(on) {
    if (on === playing) return;
    playing = on;
    dock.classList.toggle("is-playing", on);
    playBtn.setAttribute("aria-pressed", on ? "true" : "false");
    playBtn.setAttribute("aria-label", on ? "Jeda auto-scroll" : "Mulai auto-scroll");
    if (on) begin();
    else endLoop();
  }

  function tick(ts) {
    raf = 0;
    if (!playing) return;

    if (!lastTs) {
      lastTs = ts;
      startTs = ts;
    }

    let dt = (ts - lastTs) / 1000;
    lastTs = ts;
    if (dt < 0) dt = 0;
    if (dt > 0.1) dt = 0.1;

    const t = Math.min(1, (ts - startTs) / RAMP_MS);
    const ease = t * t * (3 - 2 * t);
    pos += basePx * speed * ease * dt;

    frames++;
    if (frames % SAMPLE_FRAMES === 0) {
      refreshMax();
      const actual = window.scrollY;
      if (Math.abs(actual - pos) > 4) pos = actual;
      if (actual >= maxY - 2) {
        setPlaying(false);
        return;
      }
    }

    if (pos > maxY) pos = maxY;
    window.scrollTo(0, pos);
    paintProgress((pos / maxY) * 100);
    raf = requestAnimationFrame(tick);
  }

  function insideDock(target) {
    return target instanceof Element && !!target.closest("#autoscrollDock");
  }

  document.addEventListener("wheel", function (e) {
    if (playing && !insideDock(e.target)) setPlaying(false);
  }, { passive: true });

  document.addEventListener("touchmove", function (e) {
    if (playing && !insideDock(e.target)) setPlaying(false);
  }, { passive: true });

  document.addEventListener("pointerdown", function (e) {
    if (!playing) return;
    if (e.target instanceof Element && e.target.closest("a[href*='#']")) {
      setPlaying(false);
    }
  }, { passive: true });

  document.addEventListener("keydown", function (e) {
    if (!playing) return;
    const target = e.target;
    if (
      target instanceof Element &&
      target.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']")
    ) return;
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].indexOf(e.key) !== -1) {
      setPlaying(false);
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && playing) setPlaying(false);
  });

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(function () {
      syncDock();
      if (!playing) paintProgress(progressNow());
    });
    ro.observe(body);
  }

  window.addEventListener("resize", function () {
    syncDock();
    if (!playing) paintProgress(progressNow());
  }, { passive: true });

  window.addEventListener("scroll", function () {
    if (playing || scrollRaf) return;
    scrollRaf = requestAnimationFrame(function () {
      scrollRaf = 0;
      paintProgress(progressNow());
    });
  }, { passive: true });

  playBtn.addEventListener("click", function () {
    setPlaying(!playing);
  });

  range.addEventListener("input", function () {
    setSpeed(parseFloat(range.value), false);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveSpeed(speed);
    }, 150);
  });

  range.addEventListener("change", function () {
    clearTimeout(saveTimer);
    saveSpeed(speed);
  });

  setSpeed(loadSpeed(), false);
  syncDock();
  paintProgress(progressNow());
})();
