(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = parseInt(dot.getAttribute('data-hero-dot'), 10);
        showSlide(next);
        startHero();
      });
    });

    if (slides.length > 1) {
      startHero();
    }
  }

  var filterPanels = document.querySelectorAll('[data-filter-panel]');

  filterPanels.forEach(function (panel) {
    var searchInput = panel.querySelector('[data-filter-search]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var section = panel.closest('section');
    var cards = section ? Array.prototype.slice.call(section.querySelectorAll('[data-card]')) : [];
    var emptyState = section ? section.querySelector('[data-empty-state]') : null;

    function yearMatches(cardYear, selected) {
      if (!selected) {
        return true;
      }
      if (selected.length === 4 && selected.endsWith('0')) {
        var numericYear = parseInt(cardYear, 10);
        var decade = parseInt(selected, 10);
        return numericYear >= decade && numericYear < decade + 10;
      }
      return cardYear.indexOf(selected) !== -1;
    }

    function applyFilters() {
      var query = (searchInput && searchInput.value || '').trim().toLowerCase();
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = yearMatches(card.getAttribute('data-year') || '', year);
        var matchesRegion = !region || (card.getAttribute('data-region') || '').indexOf(region) !== -1;
        var show = matchesQuery && matchesYear && matchesRegion;

        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [searchInput, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });

  var searchResults = document.querySelector('[data-search-results]');

  if (searchResults && window.MovieCatalog) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = (params.get('q') || '').trim();
    var pageInput = document.querySelector('[data-search-page-input]');
    var searchTitle = document.querySelector('[data-search-title]');
    var emptySearch = document.querySelector('[data-search-empty]');

    if (pageInput) {
      pageInput.value = queryValue;
    }

    function makeCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card normal">',
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'image-missing\')">',
        '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>',
        '</a>',
        '<div class="card-content">',
        '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
        '<p>' + escapeHtml(movie.line) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (item) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[item];
      });
    }

    if (queryValue) {
      var normalized = queryValue.toLowerCase();
      var results = window.MovieCatalog.filter(function (movie) {
        var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, (movie.tags || []).join(' '), movie.line].join(' ').toLowerCase();
        return text.indexOf(normalized) !== -1;
      }).slice(0, 96);

      if (searchTitle) {
        searchTitle.textContent = '搜索结果：' + queryValue;
      }

      searchResults.innerHTML = results.map(makeCard).join('');

      if (emptySearch) {
        emptySearch.hidden = results.length !== 0;
      }
    }
  }
})();
