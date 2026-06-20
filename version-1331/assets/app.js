(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");

    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        document.body.classList.toggle("menu-open", open);
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function startHero() {
      if (timer || slides.length < 2) {
        return;
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function restartHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startHero();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        restartHero();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restartHero();
      });
    }

    showSlide(0);
    startHero();

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".no-results");

    function getQuery() {
      var params = new URLSearchParams(window.location.search);
      return (params.get("q") || "").trim();
    }

    function applyFilter(value) {
      var query = (value || "").trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = [card.getAttribute("data-title"), card.getAttribute("data-keywords"), card.textContent].join(" ").toLowerCase();
        var match = !query || text.indexOf(query) !== -1;
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    searchInputs.forEach(function (input) {
      var initial = getQuery();
      if (initial && !input.value) {
        input.value = initial;
      }
      input.addEventListener("input", function () {
        applyFilter(input.value);
      });
    });

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter-value") || "";
        filterButtons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        searchInputs.forEach(function (input) {
          input.value = value;
        });
        applyFilter(value);
      });
    });

    if (searchInputs.length || getQuery()) {
      applyFilter(searchInputs[0] ? searchInputs[0].value : getQuery());
    }

    var backTop = document.querySelector(".back-top");

    if (backTop) {
      window.addEventListener("scroll", function () {
        backTop.classList.toggle("show", window.scrollY > 640);
      });
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  });
})();
