(function () {
  function createMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var source = options.source;
    var ready = false;
    var hlsInstance = null;

    if (!video || !overlay || !source) {
      return;
    }

    function attachSource() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function begin(event) {
      if (event) {
        event.preventDefault();
      }

      attachSource();
      overlay.classList.add("hidden");
      video.controls = true;

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    overlay.addEventListener("click", begin);

    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  window.createMoviePlayer = createMoviePlayer;
})();
