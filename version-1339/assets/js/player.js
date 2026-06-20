document.addEventListener('DOMContentLoaded', function () {
    var video = document.querySelector('[data-player]');
    var mask = document.querySelector('.player-mask');

    if (!video) {
        return;
    }

    var source = video.getAttribute('src');
    var hls = null;

    function prepare() {
        if (!source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.getAttribute('src') !== source) {
                video.setAttribute('src', source);
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!hls) {
                video.removeAttribute('src');
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            }
        }
    }

    function startPlayback() {
        prepare();

        if (mask) {
            mask.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    if (mask) {
        mask.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        if (mask) {
            mask.classList.add('is-hidden');
        }
    });
});
