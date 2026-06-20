(function () {
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setMobileMenu() {
    const btn = q('[data-menu-btn]');
    const panel = q('[data-menu-panel]');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      const hidden = panel.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(!hidden));
    });
  }

  function initHeroCarousel() {
    const root = q('[data-hero-carousel]');
    if (!root) return;
    const slides = qa('[data-slide]', root);
    const dots = qa('[data-dot]', root);
    const prev = q('[data-prev]', root);
    const next = q('[data-next]', root);
    if (slides.length <= 1) return;
    let index = 0;
    const show = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((el, idx) => {
        el.classList.toggle('hidden', idx !== index);
      });
      dots.forEach((el, idx) => {
        el.classList.toggle('bg-white', idx === index);
        el.classList.toggle('bg-white/40', idx !== index);
      });
    };
    show(0);
    prev && prev.addEventListener('click', () => show(index - 1));
    next && next.addEventListener('click', () => show(index + 1));
    dots.forEach((dot, idx) => dot.addEventListener('click', () => show(idx)));
    setInterval(() => show(index + 1), 6500);
  }

  function textForCard(card) {
    return (card.dataset.filterText || card.textContent || '').toLowerCase();
  }

  function initLocalFilter() {
    qa('[data-filter-input]').forEach((input) => {
      const target = input.getAttribute('data-filter-input');
      const grid = q(target);
      if (!grid) return;
      const cards = qa('[data-filter-card]', grid);
      const counter = input.getAttribute('data-filter-counter') ? q(input.getAttribute('data-filter-counter')) : null;
      input.addEventListener('input', () => {
        const keyword = input.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach((card) => {
          const hit = !keyword || textForCard(card).includes(keyword);
          card.classList.toggle('hidden', !hit);
          if (hit) visible++;
        });
        if (counter) counter.textContent = String(visible);
      });
    });
  }

  function initPlayer() {
    qa('video[data-player]').forEach((video) => {
      const src = video.getAttribute('data-stream') || '';
      const fallback = video.getAttribute('data-fallback') || '';
      const poster = video.getAttribute('data-poster') || '';
      if (poster) video.poster = poster;

      const tryNative = () => {
        if (src) {
          video.src = src;
          const p = video.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      };

      if (window.Hls && window.Hls.isSupported() && src.endsWith('.m3u8')) {
        const hls = new window.Hls({
          maxLiveSyncPlaybackRate: 1.5,
          lowLatencyMode: true,
          backBufferLength: 30
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          const p = video.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl') && src.endsWith('.m3u8')) {
        tryNative();
      } else if (fallback) {
        video.src = fallback;
      } else {
        tryNative();
      }
    });
  }

  function initSearchPage() {
    const form = q('[data-search-form]');
    const input = q('[data-search-input]');
    const results = q('[data-search-results]');
    const counter = q('[data-search-counter]');
    if (!form || !input || !results) return;

    const render = (items) => {
      results.innerHTML = items.map(renderCard).join('');
      if (counter) counter.textContent = String(items.length);
    };

    const search = () => {
      const kw = input.value.trim().toLowerCase();
      const data = window.MOVIE_INDEX || [];
      if (!kw) {
        render(data.slice(0, 60));
        return;
      }
      const items = data.filter((it) => {
        const text = [
          it.title, it.type, it.region, it.genre, it.tags, it.year, it.bucket_name
        ].join(' ').toLowerCase();
        return text.includes(kw);
      }).slice(0, 120);
      render(items);
    };

    const renderCard = (it) => {
      const accentSeed = it.title;
      return `
        <a href="movie-${it.id}.html" class="movie-card block rounded-3xl overflow-hidden fade-in" data-filter-card data-filter-text="${escapeAttr([it.title,it.type,it.year,it.region,it.genre,it.tags].join(' '))}">
          <div class="poster movie-poster p-4" style="${posterStyle(accentSeed)}">
            <div class="poster-body h-full flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="badge">${escapeHtml(it.bucket_name)}</span>
                <span class="badge">#${escapeHtml(it.id)}</span>
              </div>
              <div>
                <h3 class="text-xl font-bold leading-tight mb-2 movie-title">${escapeHtml(it.title)}</h3>
                <p class="text-sm text-white/80 line-clamp-2">${escapeHtml(it.genre || it.type || '')}</p>
              </div>
              <div class="flex flex-wrap gap-2 text-xs text-white/80">
                <span class="badge">${escapeHtml(it.region)}</span>
                <span class="badge">${escapeHtml(it.year)}</span>
              </div>
            </div>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-between text-sm text-slate-500">
              <span>${escapeHtml(it.type)}</span>
              <span>点击查看详情</span>
            </div>
          </div>
        </a>`;
    };

    function escapeHtml(s){
      return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
    function escapeAttr(s){ return escapeHtml(s).replace(/`/g,'&#96;'); }
    function posterStyle(seedText){
      const str = String(seedText || '');
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
      const h1 = h % 360, h2 = (h1 + 42) % 360, h3 = (h1 + 160) % 360;
      return `background: linear-gradient(135deg, hsl(${h1} 85% 55%), hsl(${h2} 80% 42%) 55%, hsl(${h3} 72% 24%));`;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      search();
      const url = new URL(window.location.href);
      if (input.value.trim()) url.searchParams.set('q', input.value.trim());
      else url.searchParams.delete('q');
      history.replaceState({}, '', url);
    });
    input.addEventListener('input', () => {
      window.clearTimeout(window.__searchTimer);
      window.__searchTimer = window.setTimeout(search, 150);
    });

    const params = new URLSearchParams(location.search);
    const qv = params.get('q');
    if (qv) input.value = qv;
    search();
  }

  function initCopyLink() {
    qa('[data-copy-link]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const text = btn.getAttribute('data-copy-link');
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = '已复制';
          setTimeout(() => btn.textContent = '复制链接', 1400);
        } catch (e) {
          btn.textContent = '复制失败';
          setTimeout(() => btn.textContent = '复制链接', 1400);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setMobileMenu();
    initHeroCarousel();
    initLocalFilter();
    initPlayer();
    initSearchPage();
    initCopyLink();
  });
})();
