(function () {
  "use strict";

  var LANG_KEY = "heni-lang";
  var html = document.documentElement;

  function applyLang(lang) {
    html.classList.remove("lang-en", "lang-fr");
    html.classList.add("lang-" + lang);
    html.setAttribute("lang", lang);

    var toggle = document.getElementById("lang-toggle");
    if (toggle) {
      toggle.textContent = lang === "fr" ? "EN" : "FR";
      toggle.setAttribute("aria-label", lang === "fr" ? "Switch to English" : "Passer au français");
    }

    var titleKey = lang === "fr" ? "titleFr" : "titleEn";
    if (document.body.dataset[titleKey]) {
      document.title = document.body.dataset[titleKey];
    }

    document.querySelectorAll("img[data-alt-fr]").forEach(function (img) {
      var alt = lang === "fr" ? img.dataset.altFr : img.dataset.altEn;
      if (alt) img.setAttribute("alt", alt);
    });
  }

  function initLang() {
    var stored = null;
    try {
      stored = localStorage.getItem(LANG_KEY);
    } catch (e) {}

    var lang = stored || "fr";
    applyLang(lang);

    var toggle = document.getElementById("lang-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = html.classList.contains("lang-fr") ? "en" : "fr";
        applyLang(next);
        try {
          localStorage.setItem(LANG_KEY, next);
        } catch (e) {}
      });
    }
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    var navToggle = document.getElementById("nav-toggle");
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 24) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (navToggle) {
      navToggle.addEventListener("click", function () {
        header.classList.toggle("is-open");
        var expanded = header.classList.contains("is-open");
        navToggle.setAttribute("aria-expanded", String(expanded));
      });

      header.querySelectorAll(".main-nav a").forEach(function (link) {
        link.addEventListener("click", function () {
          header.classList.remove("is-open");
        });
      });
    }
  }

  function initPhotos() {
    document.querySelectorAll(".ph img, .hero-media img").forEach(function (img) {
      function onLoad() {
        img.classList.add("is-loaded");
        var frame = img.closest(".ph");
        if (frame) frame.classList.add("has-photo");
      }

      function onError() {
        // File not in assets/img/ yet — remove the <img> so the gradient
        // block underneath shows through instead of a broken-image icon.
        img.remove();
      }

      if (img.complete) {
        if (img.naturalWidth > 0) onLoad();
        else onError();
        return;
      }

      img.addEventListener("load", onLoad);
      img.addEventListener("error", onError);
    });
  }

  function initFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    initHeader();
    initPhotos();
    initFooterYear();
  });
})();
