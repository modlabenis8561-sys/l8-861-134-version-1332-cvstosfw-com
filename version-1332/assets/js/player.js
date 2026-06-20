(function () {
  var video = document.querySelector('[data-player-video]');
  var trigger = document.querySelector('[data-player-trigger]');

  if (!video || !trigger) {
    return;
  }

  var loaded = false;
  var stream = video.getAttribute('data-stream');

  function beginPlayback() {
    if (!stream) {
      return;
    }

    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      loaded = true;
      video.controls = true;
    }

    trigger.classList.add('is-hidden');
    video.play().catch(function () {});
  }

  trigger.addEventListener('click', beginPlayback);
  video.addEventListener('click', function () {
    if (!loaded) {
      beginPlayback();
    }
  });
})();
