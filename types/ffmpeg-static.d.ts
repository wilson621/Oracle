// ffmpeg-static ships no type declarations of its own -- it's a plain CJS
// module whose default export is either the absolute path to a bundled
// ffmpeg binary for the current platform/arch, or null if this platform
// isn't one it bundles a binary for (see local-clip-cutter.ts, which
// handles the null case explicitly rather than assuming this is always a
// string).
declare module "ffmpeg-static" {
  const ffmpegPath: string | null;
  export default ffmpegPath;
}
