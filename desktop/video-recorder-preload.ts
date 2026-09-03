import { contextBridge, ipcRenderer } from "electron";
import {
  VIDEO_RECORDER_CHANNELS,
  type VideoRecorderBeginConstraints,
} from "./video-recorder-channels.js";

/**
 * A second, dedicated preload -- separate from desktop/preload.ts -- loaded
 * only into OracleVideoRecorderWindowController's hidden window. It exposes
 * nothing the visible Companion window's bridge does; it exists purely so
 * the sandboxed, contextIsolated recorder page can drive getDisplayMedia()/
 * MediaRecorder and hand results back to main without nodeIntegration.
 */
contextBridge.exposeInMainWorld("oracleVideoRecorderHost", {
  onBegin: (
    listener: (constraints: VideoRecorderBeginConstraints) => void
  ) => {
    ipcRenderer.on(VIDEO_RECORDER_CHANNELS.begin, (_event, constraints) => {
      listener(constraints as VideoRecorderBeginConstraints);
    });
  },

  onEnd: (listener: () => void) => {
    ipcRenderer.on(VIDEO_RECORDER_CHANNELS.end, () => listener());
  },

  sendChunk: (buffer: ArrayBuffer) => {
    ipcRenderer.send(VIDEO_RECORDER_CHANNELS.chunk, buffer);
  },

  reportStarted: (mimeType: string, hasAudio: boolean) => {
    ipcRenderer.send(VIDEO_RECORDER_CHANNELS.started, {
      mimeType,
      hasAudio,
    });
  },

  reportStartFailed: (message: string) => {
    ipcRenderer.send(VIDEO_RECORDER_CHANNELS.startFailed, message);
  },

  reportStopped: (mimeType: string | null, hasAudio: boolean) => {
    ipcRenderer.send(VIDEO_RECORDER_CHANNELS.stopped, {
      mimeType,
      hasAudio,
    });
  },

  reportError: (message: string) => {
    ipcRenderer.send(VIDEO_RECORDER_CHANNELS.error, message);
  },
});
