(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var stream = player.getAttribute('data-stream');
    var loaded = false;
    var hls;

    function attachStream() {
      if (loaded || !video || !stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      loaded = true;
    }

    function startPlayback() {
      attachStream();
      player.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }
  });
})();
