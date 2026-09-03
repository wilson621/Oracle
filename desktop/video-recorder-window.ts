import {
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  protocol,
  type IpcMainEvent,
} from "electron";
import { createWriteStream, mkdirSync, type WriteStream } from "node:fs";
import { dirname, join } from "node:path";
import type { OracleDesktopAttachmentTarget } from "./overlay/attachment-state.js";
import {
  normaliseHandle,
  sourceHandle,
} from "./companion/electron-full-window-capture.js";
import { renderVideoRecorderHarnessHtml } from "./video-recorder-harness.js";
import {
  VIDEO_RECORDER_CHANNELS,
  type VideoRecorderBeginConstraints,
  type VideoRecorderStartedPayload,
} from "./video-recorder-channels.js";

const RECORDER_PRELOAD_FILENAME = "video-recorder-preload.js";

// Serves the hidden recorder harness page (see video-recorder-harness.ts)
// over a privileged custom scheme instead of a data: URL. This has to be
// registered here, at module scope, so it runs during main.ts's own module
// load -- before app 'ready' fires -- which is Electron's hard requirement
// for registerSchemesAsPrivileged. `secure: true` is what actually matters:
// it makes pages loaded from this scheme a secure context, which
// navigator.mediaDevices (and therefore getDisplayMedia) requires and a
// data: URL's opaque origin never satisfies. `standard: true` gives the
// scheme normal scheme://host origin semantics rather than opaque-path
// semantics, which secure-context computation also depends on.
const VIDEO_RECORDER_SCHEME = "oracle-video-recorder";
const VIDEO_RECORDER_HARNESS_URL = `${VIDEO_RECORDER_SCHEME}://harness/`;

protocol.registerSchemesAsPrivileged([
  {
    scheme: VIDEO_RECORDER_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

// protocol.handle() can only be called once the app is ready, but
// beginCapture() (the only caller) is itself only ever reachable after
// app.whenReady() has resolved (it requires an attached Companion window),
// so a lazy, idempotent registration on first use is sufficient -- no need
// to thread this through main.ts's own ready handler.
let harnessProtocolRegistered = false;
function ensureHarnessProtocolRegistered(): void {
  if (harnessProtocolRegistered) return;
  harnessProtocolRegistered = true;
  protocol.handle(VIDEO_RECORDER_SCHEME, () => {
    return new Response(renderVideoRecorderHarnessHtml(), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  });
}

// The hidden window captures a *different* window (the attached game) via
// desktopCapturer/getDisplayMedia -- its own size never appears anywhere,
// so it's kept as small as Electron allows rather than sized for anything.
const HIDDEN_WINDOW_SIZE = 2;

// How long to wait for the renderer to confirm getDisplayMedia()/
// MediaRecorder actually started (or failed) before giving up -- covers a
// genuinely hung capture instead of leaving a caller waiting forever.
const BEGIN_TIMEOUT_MS = 15_000;

// How long to wait for a final flushed chunk + stopped acknowledgement
// after asking the renderer to stop, before finalising the file with
// whatever was written so far -- protects against losing an entire
// recording if the renderer never acks (e.g. the game window closed
// mid-match, tearing down the capture source underneath it).
const END_TIMEOUT_MS = 10_000;

export type VideoRecorderBeginResult = Readonly<{
  mimeType: string;
  hasAudio: boolean;
}>;

export type VideoRecorderEndResult = Readonly<{
  sizeBytes: number;
}>;

/**
 * Owns a hidden Electron BrowserWindow whose only job is to run
 * getDisplayMedia()/MediaRecorder against the attached Call of Duty window
 * and stream the resulting WebM chunks back to disk here in the main
 * process -- see video-recorder-harness.ts for what actually runs inside
 * it (served over the privileged oracle-video-recorder:// scheme
 * registered above, not a data: URL -- see that scheme registration for
 * why), and video-recorder-preload.ts for the bridge it talks over.
 *
 * One controller instance is reused across recordings; each beginCapture()
 * tears down and recreates the hidden window fresh, which is also what
 * guarantees the previous MediaRecorder/stream/session handler are fully
 * released rather than accumulating across a long play session.
 */
export class OracleVideoRecorderWindowController {
  private window: BrowserWindow | null = null;
  private writeStream: WriteStream | null = null;
  private currentTarget: OracleDesktopAttachmentTarget | null = null;
  private chunkListenerWebContentsId: number | null = null;
  private readonly onChunk = (
    _event: IpcMainEvent,
    data: unknown
  ): void => {
    this.writeStream?.write(toBuffer(data));
  };

  async beginCapture(
    target: OracleDesktopAttachmentTarget,
    outputPath: string,
    constraints: VideoRecorderBeginConstraints
  ): Promise<VideoRecorderBeginResult> {
    this.destroyWindow();
    this.currentTarget = target;
    ensureHarnessProtocolRegistered();

    mkdirSync(dirname(outputPath), { recursive: true });
    this.writeStream = createWriteStream(outputPath);

    const window = new BrowserWindow({
      width: HIDDEN_WINDOW_SIZE,
      height: HIDDEN_WINDOW_SIZE,
      show: false,
      skipTaskbar: true,
      frame: false,
      webPreferences: {
        // __dirname here is dist-electron/desktop -- the same directory
        // build-desktop-preload.mjs bundles video-recorder-preload.js into
        // (mirroring how overlay-window.ts locates its own preload.js),
        // so this resolves correctly no matter which module instantiates
        // this controller.
        preload: join(__dirname, RECORDER_PRELOAD_FILENAME),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
      },
    });
    this.window = window;

    window.on("closed", () => {
      if (this.window === window) {
        this.window = null;
      }
    });

    window.webContents.session.setDisplayMediaRequestHandler(
      (_request, callback) => {
        void this.resolveSource().then((source) => {
          if (!source) {
            // No matching source: hand back nothing so getDisplayMedia()
            // rejects in the renderer, which reports it through the
            // ordinary start-failed path instead of hanging.
            callback({});
            return;
          }
          callback({ video: source, audio: "loopback" });
        });
      },
      { useSystemPicker: false }
    );

    const webContentsId = window.webContents.id;
    this.registerChunkListener(webContentsId);

    const started = this.waitForStart(webContentsId);

    try {
      await window.loadURL(VIDEO_RECORDER_HARNESS_URL);
    } catch (error) {
      this.teardownAfterFailure(webContentsId);
      throw error;
    }

    window.webContents.send(VIDEO_RECORDER_CHANNELS.begin, constraints);

    try {
      return await started;
    } catch (error) {
      this.teardownAfterFailure(webContentsId);
      throw error;
    }
  }

  /**
   * Asks the renderer to stop, waits for its final acknowledgement (with a
   * bounded timeout), closes the output file, and tears down the hidden
   * window. Returns null if nothing was capturing.
   */
  async endCapture(): Promise<VideoRecorderEndResult | null> {
    const window = this.window;
    const writeStream = this.writeStream;
    if (!window || window.isDestroyed() || !writeStream) {
      this.destroyWindow();
      return null;
    }

    const webContentsId = window.webContents.id;
    await this.waitForStop(webContentsId, window);

    const path = writeStream.path as string;
    await closeWriteStream(writeStream);

    this.destroyWindow();

    const sizeBytes = await statSize(path);
    return { sizeBytes };
  }

  /** Hard teardown -- used for app quit or an aborted recording. */
  destroy(): void {
    this.destroyWindow();
    if (this.writeStream) {
      const stream = this.writeStream;
      this.writeStream = null;
      stream.destroy();
    }
  }

  private async resolveSource(): Promise<
    { id: string; name: string } | null
  > {
    const target = this.currentTarget;
    if (!target) return null;

    const sources = await desktopCapturer.getSources({
      types: ["window"],
      thumbnailSize: { width: 0, height: 0 },
      fetchWindowIcons: false,
    });

    const wantedHandle = normaliseHandle(target.handle);
    const matching = sources.find(
      (source) => sourceHandle(source.id) === wantedHandle
    );
    return matching ? { id: matching.id, name: matching.name } : null;
  }

  private registerChunkListener(webContentsId: number): void {
    this.unregisterChunkListener();
    this.chunkListenerWebContentsId = webContentsId;
    ipcMain.on(VIDEO_RECORDER_CHANNELS.chunk, this.onChunk);
  }

  private unregisterChunkListener(): void {
    if (this.chunkListenerWebContentsId !== null) {
      ipcMain.removeListener(VIDEO_RECORDER_CHANNELS.chunk, this.onChunk);
      this.chunkListenerWebContentsId = null;
    }
  }

  private waitForStart(
    webContentsId: number
  ): Promise<VideoRecorderBeginResult> {
    return new Promise((resolve, reject) => {
      let settled = false;

      const onStarted = (
        event: IpcMainEvent,
        payload: VideoRecorderStartedPayload
      ) => {
        if (event.sender.id !== webContentsId || settled) return;
        settled = true;
        cleanup();
        resolve({ mimeType: payload.mimeType, hasAudio: payload.hasAudio });
      };

      const onStartFailed = (event: IpcMainEvent, message: unknown) => {
        if (event.sender.id !== webContentsId || settled) return;
        settled = true;
        cleanup();
        reject(
          new Error(
            typeof message === "string"
              ? message
              : "Video capture failed to start."
          )
        );
      };

      const onError = (event: IpcMainEvent, message: unknown) => {
        if (event.sender.id !== webContentsId || settled) return;
        settled = true;
        cleanup();
        reject(
          new Error(
            typeof message === "string" ? message : "Video capture error."
          )
        );
      };

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("Timed out waiting for video capture to start."));
      }, BEGIN_TIMEOUT_MS);

      function cleanup() {
        clearTimeout(timeout);
        ipcMain.removeListener(VIDEO_RECORDER_CHANNELS.started, onStarted);
        ipcMain.removeListener(
          VIDEO_RECORDER_CHANNELS.startFailed,
          onStartFailed
        );
        ipcMain.removeListener(VIDEO_RECORDER_CHANNELS.error, onError);
      }

      ipcMain.on(VIDEO_RECORDER_CHANNELS.started, onStarted);
      ipcMain.on(VIDEO_RECORDER_CHANNELS.startFailed, onStartFailed);
      ipcMain.on(VIDEO_RECORDER_CHANNELS.error, onError);
    });
  }

  private waitForStop(
    webContentsId: number,
    window: BrowserWindow
  ): Promise<void> {
    return new Promise((resolve) => {
      let settled = false;

      const onStopped = (event: IpcMainEvent) => {
        if (event.sender.id !== webContentsId || settled) return;
        settled = true;
        cleanup();
        resolve();
      };

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      }, END_TIMEOUT_MS);

      function cleanup() {
        clearTimeout(timeout);
        ipcMain.removeListener(VIDEO_RECORDER_CHANNELS.stopped, onStopped);
      }

      ipcMain.on(VIDEO_RECORDER_CHANNELS.stopped, onStopped);

      if (!window.isDestroyed()) {
        window.webContents.send(VIDEO_RECORDER_CHANNELS.end);
      } else {
        settled = true;
        cleanup();
        resolve();
      }
    });
  }

  private teardownAfterFailure(webContentsId: number): void {
    if (this.chunkListenerWebContentsId === webContentsId) {
      this.unregisterChunkListener();
    }
    this.destroyWindow();
    if (this.writeStream) {
      const stream = this.writeStream;
      this.writeStream = null;
      stream.destroy();
    }
  }

  private destroyWindow(): void {
    this.unregisterChunkListener();
    const window = this.window;
    this.window = null;
    this.currentTarget = null;
    if (window && !window.isDestroyed()) {
      window.destroy();
    }
  }
}

function toBuffer(data: unknown): Buffer {
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  }
  return Buffer.from([]);
}

function closeWriteStream(stream: WriteStream): Promise<void> {
  return new Promise((resolve, reject) => {
    stream.end((error?: Error | null) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function statSize(path: string): Promise<number> {
  const { stat } = await import("node:fs/promises");
  try {
    const info = await stat(path);
    return info.size;
  } catch {
    return 0;
  }
}
