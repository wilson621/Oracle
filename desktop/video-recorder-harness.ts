/**
 * Renders the page loaded into the hidden recorder BrowserWindow, served
 * over the privileged oracle-video-recorder:// scheme (see
 * video-recorder-window.ts) rather than as a data: URL. A data: URL gets an
 * opaque origin, which Chromium never treats as a secure context, and
 * navigator.mediaDevices (getDisplayMedia included) is only exposed in a
 * secure context at all -- attempting the data: URL approach first is what
 * produced "This Electron build has no getDisplayMedia support" even
 * though the build genuinely supports it. The privileged scheme is
 * registered with `secure: true`, so pages loaded from it get a real
 * secure-context origin while still never touching disk (no file on disk,
 * same as the data: URL approach it replaces).
 *
 * The page's inline <script> does the real work: it calls
 * navigator.mediaDevices.getDisplayMedia() (auto-granted with no picker
 * dialog, because OracleVideoRecorderWindowController installs a
 * setDisplayMediaRequestHandler on this window's session that hands back
 * the exact attached-game source), feeds the resulting stream into a
 * MediaRecorder, and streams each chunk back to main over the
 * VIDEO_RECORDER_CHANNELS bridge exposed by video-recorder-preload.ts.
 *
 * The window's preload still runs against this scheme (Electron applies a
 * BrowserWindow's webPreferences.preload regardless of what the window
 * navigates to), so this page gets contextBridge access despite
 * contextIsolation + sandbox staying on -- nodeIntegration never turns on.
 */
export function renderVideoRecorderHarnessHtml(): string {
  return `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>Oracle video recorder (hidden)</title></head>
<body>
<script>
${harnessScript()}
</script>
</body>
</html>`;
}

// A plain string rather than a bundled .ts module: this executes inside the
// sandboxed hidden renderer via a data: URL, not through the desktop tsc/
// esbuild pipeline, so it is deliberately kept small, dependency-free, and
// defensively written (every failure path reports back to main rather than
// throwing silently in a window nothing ever looks at).
function harnessScript(): string {
  return `
(function () {
  "use strict";
  var host = window.oracleVideoRecorderHost;
  if (!host) {
    return;
  }

  var recorder = null;
  var stream = null;

  function stopTracks() {
    if (!stream) return;
    var tracks = stream.getTracks();
    for (var i = 0; i < tracks.length; i++) {
      try { tracks[i].stop(); } catch (e) { /* already stopped */ }
    }
  }

  function pickMimeType() {
    var candidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9",
      "video/webm"
    ];
    for (var i = 0; i < candidates.length; i++) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(candidates[i])) {
        return candidates[i];
      }
    }
    return "video/webm";
  }

  host.onBegin(function (constraints) {
    (async function () {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          host.reportStartFailed("This Electron build has no getDisplayMedia support.");
          return;
        }

        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: constraints.targetFrameRate, max: constraints.targetFrameRate + 2 }
          },
          audio: true
        });

        // Best-effort: some capture sources ignore the frameRate hint above
        // and hand back their native rate, so ask again explicitly. Never
        // fatal -- a higher captured framerate still works fine end to end,
        // it just makes for a slightly larger file than necessary.
        var videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && videoTrack.applyConstraints) {
          try {
            await videoTrack.applyConstraints({
              frameRate: { ideal: constraints.targetFrameRate, max: constraints.targetFrameRate + 2 }
            });
          } catch (e) { /* keep native rate */ }
        }

        var mimeType = pickMimeType();
        var hasAudio = stream.getAudioTracks().length > 0;

        recorder = new MediaRecorder(stream, {
          mimeType: mimeType,
          videoBitsPerSecond: constraints.videoBitsPerSecond
        });

        recorder.ondataavailable = function (event) {
          if (event.data && event.data.size > 0) {
            event.data.arrayBuffer().then(function (buffer) {
              host.sendChunk(buffer);
            }).catch(function () { /* dropped chunk is not fatal */ });
          }
        };

        recorder.onerror = function (event) {
          var message = (event && event.error && event.error.message)
            ? event.error.message
            : "MediaRecorder error";
          host.reportError(message);
        };

        recorder.onstop = function () {
          stopTracks();
          host.reportStopped(mimeType, hasAudio);
        };

        // 1s timeslice: chunks stream to disk incrementally instead of
        // buffering the whole match in the renderer's memory.
        recorder.start(1000);
        host.reportStarted(mimeType, hasAudio);
      } catch (error) {
        var message = error && error.message ? error.message : String(error);
        host.reportStartFailed(message);
      }
    })();
  });

  host.onEnd(function () {
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      stopTracks();
      host.reportStopped(null, false);
    }
  });
})();
`;
}
