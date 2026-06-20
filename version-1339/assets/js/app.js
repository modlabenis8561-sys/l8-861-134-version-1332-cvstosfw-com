document.addEventListener('DOMContentLoaded', function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        startTimer();
    }

    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    scopes.forEach(function (scope) {
        var searchInput = scope.querySelector('[data-card-search]');
        var typeFilter = scope.querySelector('[data-type-filter]');
        var yearFilter = scope.querySelector('[data-year-filter]');
        var regionFilter = scope.querySelector('[data-region-filter]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

        if (searchInput && searchInput.hasAttribute('data-search-main') && query) {
            searchInput.value = query;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function filterCards() {
            var keyword = normalize(searchInput ? searchInput.value : '');
            var type = normalize(typeFilter ? typeFilter.value : '');
            var year = normalize(yearFilter ? yearFilter.value : '');
            var region = normalize(regionFilter ? regionFilter.value : '');

            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.textContent
                ].join(' '));
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesType = !type || normalize(card.dataset.type) === type;
                var matchesYear = !year || normalize(card.dataset.year) === year;
                var matchesRegion = !region || normalize(card.dataset.region) === region;
                card.style.display = matchesKeyword && matchesType && matchesYear && matchesRegion ? '' : 'none';
            });
        }

        [searchInput, typeFilter, yearFilter, regionFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });

        filterCards();
    });
});
