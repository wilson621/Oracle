import { app, BrowserWindow, session } from "electron";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const outputArgument = process.argv.find((argument) =>
  argument.startsWith("--output=")
);
const outputPath = outputArgument
  ? path.resolve(outputArgument.slice("--output=".length))
  : path.join(path.dirname(process.execPath), "gpu-admission.json");

app.on("web-contents-created", (_event, contents) => {
  contents.on("will-navigate", (event) => event.preventDefault());
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
});

app.whenReady().then(run).catch(fail);

async function run() {
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    callback({ cancel: !details.url.startsWith("data:") });
  });

  const window = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  await window.loadURL(
    "data:text/html;charset=utf-8," +
      encodeURIComponent(
        "<!doctype html><html><body><canvas id='gpu'></canvas></body></html>"
      )
  );

  const renderer = await window.webContents.executeJavaScript(`
    (() => {
      const canvas = document.getElementById("gpu");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      if (!gl) return { webglAvailable: false };
      const extension = gl.getExtension("WEBGL_debug_renderer_info");
      return {
        webglAvailable: true,
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        vendor: extension
          ? gl.getParameter(extension.UNMASKED_VENDOR_WEBGL)
          : gl.getParameter(gl.VENDOR),
        renderer: extension
          ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL)
          : gl.getParameter(gl.RENDERER),
      };
    })()
  `);

  await delay(3000);
  const basicGpuInfo = await app.getGPUInfo("basic");
  const featureStatus = app.getGPUFeatureStatus();
  const appMetrics = app.getAppMetrics().map((metric) => ({
    type: metric.type,
    name: metric.name ?? null,
    serviceName: metric.serviceName ?? null,
    cpuPercent: metric.cpu?.percentCPUUsage ?? null,
    workingSetSizeKiB: metric.memory?.workingSetSize ?? null,
    peakWorkingSetSizeKiB: metric.memory?.peakWorkingSetSize ?? null,
  }));
  const gpuDevices = Array.isArray(basicGpuInfo.gpuDevice)
    ? basicGpuInfo.gpuDevice.map((device) => ({
        vendorId: device.vendorId,
        deviceId: device.deviceId,
        active: Boolean(device.active),
        vendorString: device.vendorString ?? null,
        deviceString: device.deviceString ?? null,
        driverVendor: device.driverVendor ?? null,
        driverVersion: device.driverVersion ?? null,
      }))
    : [];
  const softwareDevices = gpuDevices
    .filter((device) => isSoftwareDevice(device.deviceString))
    .map((device) => device.deviceString);
  const fallbackIndicators = findFallbackIndicators(renderer);
  const criticalFeatureFallbacks = ["gpu_compositing", "webgl", "webgl2"]
    .filter((feature) => {
      const status = String(featureStatus[feature] ?? "").toLowerCase();
      return (
        status.includes("software") ||
        status.includes("unavailable") ||
        status.includes("disabled")
      );
    })
    .map((feature) => `${feature}:${featureStatus[feature]}`);
  fallbackIndicators.push(...criticalFeatureFallbacks);
  const gpuProcesses = appMetrics.filter((metric) => metric.type === "GPU");
  const activeGpu =
    gpuDevices.find((device) => device.active) ??
    gpuDevices.find(
      (device) =>
        device.deviceString &&
        String(renderer.renderer ?? "")
          .toLowerCase()
          .includes(device.deviceString.toLowerCase())
    ) ??
    null;
  const evidence = {
    schemaVersion: 1,
    contract: "oracle.sprint-30-5.electron-gpu-admission",
    contractVersion: 1,
    collectedAt: new Date().toISOString(),
    result:
      app.isHardwareAccelerationEnabled() &&
      renderer.webglAvailable === true &&
      gpuProcesses.length > 0 &&
      fallbackIndicators.length === 0
        ? "passed"
        : "failed",
    versions: {
      electron: process.versions.electron,
      chromium: process.versions.chrome,
    },
    hardwareAccelerationEnabled: app.isHardwareAccelerationEnabled(),
    gpuDevices,
    activeGpu,
    detectedSoftwareDevices: softwareDevices,
    featureStatus,
    renderer,
    processes: appMetrics,
    gpuProcessCount: gpuProcesses.length,
    fallbackIndicators,
    limitations: [
      "This minimal probe establishes environment suitability only.",
      "It does not qualify the Oracle MSIX, Companion, long-duration performance, or clean-machine lifecycle.",
    ],
  };

  writeEvidence(evidence);
  window.destroy();
  app.exit(evidence.result === "passed" ? 0 : 1);
}

function findFallbackIndicators(value) {
  const serialized = JSON.stringify(value).toLowerCase();
  const terms = [
    "swiftshader",
    "llvmpipe",
    "software rasterizer",
    "microsoft basic render",
  ];
  return terms.filter((term) => serialized.includes(term));
}

function isSoftwareDevice(value) {
  const normalized = String(value ?? "").toLowerCase();
  return [
    "swiftshader",
    "llvmpipe",
    "software rasterizer",
    "microsoft basic render",
  ].some((term) => normalized.includes(term));
}

function writeEvidence(evidence) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const serialized = `${JSON.stringify(evidence, null, 2)}\n`;
  fs.writeFileSync(outputPath, serialized);
  const sha256 = crypto.createHash("sha256").update(serialized).digest("hex");
  fs.writeFileSync(
    `${outputPath}.sha256.txt`,
    `${sha256}  ${path.basename(outputPath)}\n`
  );
}

function fail(error) {
  writeEvidence({
    schemaVersion: 1,
    contract: "oracle.sprint-30-5.electron-gpu-admission",
    contractVersion: 1,
    collectedAt: new Date().toISOString(),
    result: "failed",
    error: error instanceof Error ? error.message : String(error),
  });
  app.exit(1);
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
