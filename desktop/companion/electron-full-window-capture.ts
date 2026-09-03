import {
  desktopCapturer,
} from "electron";
import type {
  OracleDesktopAttachmentTarget,
} from "../overlay/attachment-state.js";

export type OracleMatchFrame = {
  capturedAt: string;
  jpegBase64: string;
  width: number;
  height: number;
  diffScore: number;
};

const CAPTURE_WIDTH = 1280;
const CAPTURE_HEIGHT = 720;
const JPEG_QUALITY = 70;

/**
 * Captures the full attached game window locally as a single JPEG still.
 *
 * Unlike OracleElectronLocalWindowCapture (a single 65%x50% crop that
 * expires after two seconds, built for the Minecraft "is a frame visible"
 * check), this captures the whole window every time it is called and keeps
 * a lightweight difference score against the previous call -- a cheap
 * signal for "something changed a lot on screen just now" (a death or
 * killcam transition, most obviously), computed locally and never itself
 * uploaded anywhere.
 */
export class OracleElectronFullWindowCapture {
  private previousPixels: Buffer | null = null;

  async captureFrame(
    target: OracleDesktopAttachmentTarget
  ): Promise<OracleMatchFrame | null> {
    if (!target.visible || target.minimized) {
      return null;
    }

    const sources = await desktopCapturer.getSources({
      types: ["window"],
      thumbnailSize: {
        width: CAPTURE_WIDTH,
        height: CAPTURE_HEIGHT,
      },
      fetchWindowIcons: false,
    });

    const matching = sources.filter(
      (source) =>
        sourceHandle(source.id) === normaliseHandle(target.handle)
    );
    if (matching.length !== 1) {
      return null;
    }

    const image = matching[0].thumbnail;
    const size = image.getSize();
    if (size.width < 1 || size.height < 1) {
      return null;
    }

    const pixels = image.toBitmap();
    const diffScore = this.scoreDifference(pixels);
    this.previousPixels = pixels;

    const jpeg = image.toJPEG(JPEG_QUALITY);
    return {
      capturedAt: new Date().toISOString(),
      jpegBase64: jpeg.toString("base64"),
      width: size.width,
      height: size.height,
      diffScore,
    };
  }

  reset(): void {
    this.previousPixels = null;
  }

  private scoreDifference(pixels: Buffer): number {
    if (
      !this.previousPixels ||
      this.previousPixels.length !== pixels.length
    ) {
      return 1;
    }
    const stride = Math.max(1, Math.floor(pixels.length / 2_000));
    let differences = 0;
    let samples = 0;
    for (let index = 0; index < pixels.length; index += stride) {
      samples += 1;
      if (Math.abs(pixels[index] - this.previousPixels[index]) > 24) {
        differences += 1;
      }
    }
    return samples === 0 ? 0 : differences / samples;
  }
}

function sourceHandle(sourceId: string): string | null {
  const match = /^window:([^:]+):/u.exec(sourceId);
  return match ? normaliseHandle(match[1]) : null;
}

function normaliseHandle(value: string): string | null {
  try {
    return BigInt(value).toString(10);
  } catch {
    return null;
  }
}
