(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-mobile-menu-button]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length > 1) {
            var activeIndex = 0;
            var showSlide = function (index) {
                activeIndex = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === activeIndex);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === activeIndex);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                });
            });
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
            showSlide(0);
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        searchInputs.forEach(function (input) {
            var zone = input.closest("[data-filter-zone]") || document;
            var cards = Array.prototype.slice.call(zone.querySelectorAll("[data-search-text]"));
            var applyFilter = function () {
                var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search-text") || "").toLowerCase();
                    var matched = words.every(function (word) {
                        return text.indexOf(word) !== -1;
                    });
                    card.classList.toggle("hidden-by-filter", !matched);
                });
            };
            input.addEventListener("input", applyFilter);
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && !input.value) {
                input.value = query;
                applyFilter();
            }
        });

        var globalSearchForms = Array.prototype.slice.call(document.querySelectorAll("[data-global-search-form]"));
        globalSearchForms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var field = form.querySelector("input");
                if (!field) {
                    return;
                }
                event.preventDefault();
                var value = field.value.trim();
                var href = "search.html";
                if (form.getAttribute("data-level") === "sub") {
                    href = "../search.html";
                }
                if (value) {
                    href += "?q=" + encodeURIComponent(value);
                }
                window.location.href = href;
            });
        });
    });
})();
