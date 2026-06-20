(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var toggle = $(".menu-toggle");
    var panel = $(".mobile-panel");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = $(".hero");

    if (!hero) {
      return;
    }

    var slides = $all(".hero-slide", hero);
    var dots = $all(".hero-dots button", hero);
    var prev = $(".hero-prev", hero);
    var next = $(".hero-next", hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (!slides.length) {
      return;
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function renderSuggestions(input, box, value) {
    var query = normalize(value);

    if (!query || typeof MOVIE_SEARCH_INDEX === "undefined") {
      box.innerHTML = "";
      box.classList.remove("open");
      return;
    }

    var results = MOVIE_SEARCH_INDEX.filter(function (item) {
      var haystack = normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre
      ].join(" "));
      return haystack.indexOf(query) !== -1;
    }).slice(0, 8);

    if (!results.length) {
      box.innerHTML = "";
      box.classList.remove("open");
      return;
    }

    box.innerHTML = results.map(function (item) {
      return '<a href="' + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml([item.year, item.region, item.type, item.genre].filter(Boolean).join(" · ")) + '</span></a>';
    }).join("");

    box.classList.add("open");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initSearchSuggestions() {
    $all(".site-search-input").forEach(function (input) {
      var form = input.closest("form");
      var box = form ? $(".search-suggestions", form) : null;

      if (!box) {
        return;
      }

      input.addEventListener("input", function () {
        renderSuggestions(input, box, input.value);
      });

      input.addEventListener("focus", function () {
        renderSuggestions(input, box, input.value);
      });

      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          box.classList.remove("open");
        }
      });
    });
  }

  function initGridFilters() {
    var filterAreas = $all("[data-filter-area]");

    filterAreas.forEach(function (area) {
      var cards = $all(".movie-card", area);
      var input = $("[data-filter-keyword]", area);
      var region = $("[data-filter-region]", area);
      var type = $("[data-filter-type]", area);
      var year = $("[data-filter-year]", area);
      var empty = $(".empty-state", area);

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var regionValue = normalize(region ? region.value : "");
        var typeValue = normalize(type ? type.value : "");
        var yearValue = normalize(year ? year.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre
          ].join(" "));
          var ok = true;

          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }

          if (regionValue && normalize(card.dataset.region) !== regionValue) {
            ok = false;
          }

          if (typeValue && normalize(card.dataset.type) !== typeValue) {
            ok = false;
          }

          if (yearValue && normalize(card.dataset.year) !== yearValue) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";

          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && input) {
        input.value = query;
      }

      apply();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initSearchSuggestions();
    initGridFilters();
  });
})();
