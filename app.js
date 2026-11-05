/* ============================================================
   UTS KKI — Logika Interaktif Bersama
   Glosarium, Flashcard, Navigasi, & Tombol Cepat
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Glosarium Search ---------- */
  function initGlossary() {
    const input = $("#glsearch");
    const list = $("#gl");
    if (!input || !list) return;

    const items = $$(".gl-item", list);
    items.forEach(item => {
      item.setAttribute("data-text", item.textContent.toLowerCase());
    });

    let emptyMsg = $("#glEmpty");
    if (!emptyMsg) {
      emptyMsg = document.createElement("p");
      emptyMsg.id = "glEmpty";
      emptyMsg.textContent = "Tidak ada istilah yang cocok dengan pencarian.";
      emptyMsg.style.cssText = "color:var(--tomato); font-family:var(--mono); font-size:13.5px; margin-top:14px; display:none; grid-column: 1 / -1;";
      list.appendChild(emptyMsg);
    }

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      let matches = 0;
      items.forEach(item => {
        const text = item.getAttribute("data-text");
        const hit = !q || text.includes(q);
        item.classList.toggle("hide", !hit);
        if (hit) matches++;
      });
      emptyMsg.style.display = matches === 0 ? "block" : "none";
    });
  }

  /* ---------- Flashcards 3D Flip ---------- */
  function initFlashcards() {
    $$(".fc").forEach(card => {
      card.setAttribute("aria-pressed", "false");
      card.addEventListener("click", () => {
        const flipped = card.classList.toggle("flip");
        card.setAttribute("aria-pressed", flipped ? "true" : "false");
      });
      card.addEventListener("keydown", e => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  /* ---------- Floating Back to Top Button ---------- */
  function initBackToTop() {
    const btn = $("#btnBackToTop");
    if (!btn) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 350) {
        btn.style.display = "flex";
      } else {
        btn.style.display = "none";
      }
    });

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Inisialisasi Saat Dokumen Dimuat ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initGlossary();
    initFlashcards();
    initBackToTop();
  });
})();
