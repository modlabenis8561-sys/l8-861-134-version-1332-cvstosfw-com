(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function showSlide(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startHero();
      });
    }

    showSlide(0);
    startHero();
  }

  var localSearch = document.querySelector('[data-card-search]');
  if (localSearch) {
    var cards = selectAll('[data-card-list] .movie-card');
    localSearch.addEventListener('input', function () {
      var query = localSearch.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden-card', query && haystack.indexOf(query) === -1);
      });
    });
  }

  var form = document.querySelector('[data-search-form]');
  var results = document.querySelector('[data-search-results]');
  if (form && results && window.MOVIE_INDEX) {
    var input = form.querySelector('[data-search-input]');
    var category = form.querySelector('[data-category-filter]');
    var year = form.querySelector('[data-year-filter]');

    function render(items) {
      if (!items.length) {
        results.innerHTML = '<h2>没有找到匹配影片</h2>';
        return;
      }
      var html = '<h2>搜索结果</h2><div class="movie-grid compact-grid">';
      items.slice(0, 48).forEach(function (movie) {
        html += '<article class="movie-card">';
        html += '<a class="card-cover" href="' + movie.url + '">';
        html += '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">';
        html += '<span class="card-badge">' + escapeHtml(movie.categoryName) + '</span>';
        html += '<span class="card-score">' + movie.score + '</span>';
        html += '</a>';
        html += '<div class="card-body">';
        html += '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>';
        html += '<p>' + escapeHtml(movie.oneLine) + '</p>';
        html += '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>';
        html += '</div></article>';
      });
      html += '</div>';
      results.innerHTML = html;
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = (input.value || '').trim().toLowerCase();
      var cat = category.value;
      var selectedYear = year.value;
      var filtered = window.MOVIE_INDEX.filter(function (movie) {
        var text = [movie.title, movie.oneLine, movie.region, movie.genre, movie.categoryName, movie.year].join(' ').toLowerCase();
        if (query && text.indexOf(query) === -1) {
          return false;
        }
        if (cat && movie.category !== cat) {
          return false;
        }
        if (selectedYear && movie.year !== selectedYear) {
          return false;
        }
        return true;
      });
      render(filtered);
    });
  }
})();
