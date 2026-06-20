(function () {
  function setupPlayer(player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var streamUrl = video ? video.getAttribute("data-stream-url") : "";
    var hls = null;
    var ready = false;

    if (!video || !streamUrl) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (globalThis.Hls && globalThis.Hls.isSupported()) {
        hls = new globalThis.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function begin() {
      prepare();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", function (event) {
        event.preventDefault();
        begin();
      });
    }

    player.addEventListener("click", function (event) {
      if (event.target === player) {
        begin();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice
      .call(document.querySelectorAll("[data-player]"))
      .forEach(setupPlayer);
  });
})();
