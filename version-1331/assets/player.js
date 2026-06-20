(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindPlayer(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".video-overlay");
    var button = shell.querySelector(".player-button");

    if (!video) {
      return;
    }

    var streamUrl = video.getAttribute("data-stream");
    var attached = false;

    function attachStream() {
      if (attached || !streamUrl) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function playVideo() {
      attachStream();
      shell.classList.add("is-playing");
      video.controls = true;
      var action = video.play();

      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(bindPlayer);
  });
})();
