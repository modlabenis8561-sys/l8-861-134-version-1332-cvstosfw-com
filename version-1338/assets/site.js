(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function filterCards(value) {
    var query = normalize(value);
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta') + ' ' + card.textContent);
      card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
    });
  }

  function setupSearch() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    filterInputs.forEach(function (input) {
      if (query && !input.value) {
        input.value = query;
      }
      input.addEventListener('input', function () {
        filterCards(input.value);
      });
    });
    if (query) {
      filterCards(query);
    }
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"], input[type="search"]');
        if (!input) {
          return;
        }
        if (form.hasAttribute('data-local-search')) {
          event.preventDefault();
          filterCards(input.value);
          return;
        }
        event.preventDefault();
        var value = input.value.trim();
        window.location.href = './search.html' + (value ? '?q=' + encodeURIComponent(value) : '');
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell[data-video]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var source = player.getAttribute('data-video');
      var started = false;
      if (!video || !source) {
        return;
      }
      function start() {
        if (!started) {
          started = true;
          if (cover) {
            cover.classList.add('is-hidden');
          }
          video.setAttribute('controls', 'controls');
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else {
            video.src = source;
          }
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener('click', start);
      }
      var buttons = Array.prototype.slice.call(player.querySelectorAll('[data-play-button]'));
      buttons.forEach(function (button) {
        button.addEventListener('click', start);
      });
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
