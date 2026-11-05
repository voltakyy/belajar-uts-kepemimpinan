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

  /* ---------- boot ---------- */
  function boot() {
    initTheme();
    initNav();
    initGlossary();
    initFlashcards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
