(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5600);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var currentFilter = 'all';

    function cardMatches(card, query) {
        var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type')
        ].join(' ').toLowerCase();
        var type = (card.getAttribute('data-type') || '').toLowerCase();
        var filterOk = currentFilter === 'all' || type.indexOf(currentFilter.toLowerCase()) !== -1;
        var queryOk = !query || text.indexOf(query) !== -1;
        return filterOk && queryOk;
    }

    function applySearch() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
            card.classList.toggle('is-hidden', !cardMatches(card, query));
        });
    }

    if (searchInput && cards.length) {
        searchInput.addEventListener('input', applySearch);
    }

    filters.forEach(function (button) {
        button.addEventListener('click', function () {
            currentFilter = button.getAttribute('data-filter') || 'all';
            filters.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applySearch();
        });
    });
})();

function initMoviePlayer(sourceUrl) {
    var video = document.getElementById('movie-player');
    var button = document.querySelector('[data-play-button]');
    var attached = false;

    if (!video || !sourceUrl) {
        return;
    }

    function attachStream() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = sourceUrl;
    }

    function startPlayback() {
        attachStream();

        if (button) {
            button.classList.add('is-hidden');
        }

        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });
}
