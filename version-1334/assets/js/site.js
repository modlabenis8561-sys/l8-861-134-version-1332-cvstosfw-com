(function () {
  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-dot]"),
    );
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(
      document.querySelectorAll("[data-filter-scope]"),
    );
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-box]");
      var year = scope.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(
        scope.querySelectorAll("[data-filter-card]"),
      );
      var empty = scope.querySelector("[data-empty-state]");

      if (!cards.length || (!input && !year)) {
        return;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-year") || "",
          ]
            .join(" ")
            .toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedYear = !selectedYear || cardYear === selectedYear;
          var matched = matchedKeyword && matchedYear;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
