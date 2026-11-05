/* ============================================================
   UTS KKI — interaksi
   Tanpa dependensi. Semua progres disimpan di localStorage.
   ============================================================ */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- tema ---------- */
  var KEY_THEME = "kki:theme";

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var btn = $("#theme");
    if (btn) {
      btn.textContent = t === "dark" ? "☀" : "◐";
      btn.setAttribute("aria-label", t === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap");
    }
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(KEY_THEME); } catch (e) {}
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));

    var btn = $("#theme");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(KEY_THEME, next); } catch (e) {}
    });
  }

  /* ---------- navigasi aktif ---------- */
  function initNav() {
    var links = $$("#nav a[href^='#']");
    if (!links.length) return;

    var targets = links.map(function (a) {
      var el = document.querySelector(a.getAttribute("href"));
      return el ? { link: a, el: el } : null;
    }).filter(Boolean);

    if (!("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var match = targets.filter(function (t) { return t.el === entry.target; })[0];
        if (!match) return;
        links.forEach(function (l) { l.classList.remove("on"); });
        match.link.classList.add("on");
      });
    }, { rootMargin: "-72px 0px -70% 0px", threshold: 0 });

    targets.forEach(function (t) { io.observe(t.el); });
  }

  /* ---------- glosarium ---------- */
  function initGlossary() {
    var input = $("#glsearch");
    var list = $("#gl");
    if (!input || !list) return;

    var items = $$(".gl-item", list);
    items.forEach(function (item) {
      item.setAttribute("data-text", item.textContent.toLowerCase());
    });

    var empty = document.createElement("p");
    empty.textContent = "Tidak ada istilah yang cocok.";
    empty.style.color = "var(--muted)";
    empty.style.fontSize = "14px";
    empty.classList.add("hide");
    list.parentNode.appendChild(empty);

    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (item) {
        var hit = !q || item.getAttribute("data-text").indexOf(q) !== -1;
        item.classList.toggle("hide", !hit);
        if (hit) shown++;
      });
      empty.classList.toggle("hide", shown > 0);
    });
  }

  /* ---------- flashcard ---------- */
  function initFlashcards() {
    $$(".fc").forEach(function (card) {
      card.setAttribute("aria-pressed", "false");
      card.addEventListener("click", function () {
        var flipped = card.classList.toggle("flip");
        card.setAttribute("aria-pressed", flipped ? "true" : "false");
      });
      card.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  /* ---------- simulasi ujian ---------- */
  var EXAM_MS = 90 * 60 * 1000;

  function initExam() {
    var root = $("#exam");
    if (!root) return;

    var year = root.getAttribute("data-year") || "x";
    var KEY = "kki:exam:" + year;
    var timerEl = $("#timer");
    var startBtn = $("#start");
    var resetBtn = $("#reset");
    var statusEl = $("#status");
    var totalEl = $("#total");
    var areas = $$("textarea", root);
    var scores = $$("input[data-score]", root);

    var state = { deadline: 0, answers: {}, scores: {} };
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) state = Object.assign(state, JSON.parse(raw));
    } catch (e) {}

    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    }

    function pad(n) { return n < 10 ? "0" + n : "" + n; }

    function paintTimer(msLeft) {
      if (!timerEl) return;
      var total = Math.max(0, Math.floor(msLeft / 1000));
      var m = Math.floor(total / 60);
      var s = total % 60;
      timerEl.textContent = pad(m) + ":" + pad(s);
      timerEl.classList.toggle("low", total <= 300);
    }

    var tickId = null;

    function tick() {
      var left = state.deadline - Date.now();
      if (left <= 0) {
        paintTimer(0);
        if (statusEl) statusEl.textContent = "Waktu habis — berhenti menulis.";
        if (startBtn) { startBtn.disabled = false; startBtn.textContent = "Mulai ulang"; }
        state.deadline = 0;
        save();
        clearInterval(tickId);
        tickId = null;
        areas.forEach(function (a) { a.readOnly = true; });
        return;
      }
      paintTimer(left);
    }

    function start() {
      if (!state.deadline) {
        state.deadline = Date.now() + EXAM_MS;
        save();
      }
      areas.forEach(function (a) { a.readOnly = false; });
      if (startBtn) { startBtn.disabled = true; startBtn.textContent = "Sedang berjalan…"; }
      if (statusEl) statusEl.textContent = "Kerjakan 4 soal, 90 menit. Jawaban tersimpan otomatis.";
      if (tickId) clearInterval(tickId);
      tickId = setInterval(tick, 1000);
      tick();
    }

    function reset() {
      if (!window.confirm("Hapus jawaban, nilai, dan waktu pada simulasi ini?")) return;
      state = { deadline: 0, answers: {}, scores: {} };
      save();
      if (tickId) { clearInterval(tickId); tickId = null; }
      areas.forEach(function (a) { a.value = ""; a.readOnly = false; });
      scores.forEach(function (i) { i.value = ""; });
      paintTimer(EXAM_MS);
      if (startBtn) { startBtn.disabled = false; startBtn.textContent = "Mulai"; }
      if (statusEl) statusEl.textContent = "Belum dimulai.";
      updateTotal();
    }

    function updateTotal() {
      var sum = 0;
      scores.forEach(function (i) {
        var v = parseInt(i.value, 10);
        if (!isNaN(v)) sum += Math.max(0, Math.min(25, v));
      });
      if (totalEl) totalEl.textContent = String(sum);
    }

    areas.forEach(function (a) {
      var q = a.getAttribute("data-q");
      if (state.answers[q]) a.value = state.answers[q];
      a.addEventListener("input", function () {
        state.answers[q] = a.value;
        save();
      });
    });

    scores.forEach(function (i) {
      var q = i.getAttribute("data-score");
      if (state.scores[q]) i.value = state.scores[q];
      i.addEventListener("input", function () {
        var v = parseInt(i.value, 10);
        if (!isNaN(v)) i.value = String(Math.max(0, Math.min(25, v)));
        state.scores[q] = i.value;
        save();
        updateTotal();
      });
    });

    updateTotal();
    paintTimer(state.deadline ? state.deadline - Date.now() : EXAM_MS);

    if (state.deadline && state.deadline > Date.now()) start();
    else if (state.deadline) { paintTimer(0); if (statusEl) statusEl.textContent = "Waktu habis."; }

    if (startBtn) startBtn.addEventListener("click", start);
    if (resetBtn) resetBtn.addEventListener("click", reset);
  }

  /* ---------- boot ---------- */
  function boot() {
    initTheme();
    initNav();
    initGlossary();
    initFlashcards();
    initExam();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
