import {
  desktopCapturer,
  type NativeImage,
} from "electron";
import type {
  OracleDesktopAttachmentTarget,
} from "../overlay/attachment-state.js";
import type {
  OracleCompanionLocalWindowCapture,
  OracleCompanionRawFrame,
} from "./companion-screen-observation-coordinator.js";

/**
 * Captures only the upper-left bounded region of the already attached native
 * window. Matching is by native handle, never by title alone.
 */
export class OracleElectronLocalWindowCapture
  implements OracleCompanionLocalWindowCapture {
  async captureAllowlistedRegion(
    target: OracleDesktopAttachmentTarget
  ): Promise<OracleCompanionRawFrame> {
    if (
      !target.visible ||
      target.minimized ||
      target.bounds.width < 1280 ||
      target.bounds.height < 720
    ) {
      throw new Error(
        "The attached window is not visible within the certified capture bounds."
      );
    }
    const sources = await desktopCapturer.getSources({
      types: ["window"],
      thumbnailSize: { width: 640, height: 360 },
      fetchWindowIcons: false,
    });
    const matching = sources.filter(
      (source) => sourceHandle(source.id) === normaliseHandle(target.handle)
    );
    if (matching.length !== 1) {
      throw new Error("The attached native window could not be uniquely captured.");
    }
    const region = cropAllowlistedRegion(matching[0].thumbnail);
    const pixels = region.toBitmap();
    if (pixels.length === 0) {
      throw new Error("The attached window returned an empty local frame.");
    }
    return {
      pixels,
      width: region.getSize().width,
      height: region.getSize().height,
    };
  }
}

function cropAllowlistedRegion(image: NativeImage): NativeImage {
  const size = image.getSize();
  if (size.width < 1 || size.height < 1) {
    throw new Error("The captured window thumbnail is empty.");
  }
  return image.crop({
    x: 0,
    y: 0,
    width: Math.max(1, Math.floor(size.width * 0.65)),
    height: Math.max(1, Math.floor(size.height * 0.5)),
  });
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
