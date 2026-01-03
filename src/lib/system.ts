import { constants as fsConstants } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

async function isExecutable(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fsConstants.X_OK);
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function findOnPath(names: string[]): Promise<string | null> {
  const envPath = process.env.PATH || "";
  const parts = envPath.split(path.delimiter).filter(Boolean);
  for (const dir of parts) {
    for (const name of names) {
      const candidate = path.join(dir, name);
      if (await isExecutable(candidate)) return candidate;
    }
  }
  return null;
}

export async function findChromeExecutable(): Promise<string | null> {
  const platform = process.platform;

  if (platform === "darwin") {
    const macPaths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ];
    for (const p of macPaths) {
      if (await isExecutable(p)) return p;
    }
  }

  if (platform === "win32") {
    const prefixes = [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA].filter(
      Boolean,
    ) as string[];
    const suffixes = [
      "Google\\Chrome\\Application\\chrome.exe",
      "Chromium\\Application\\chrome.exe",
      "BraveSoftware\\Brave-Browser\\Application\\brave.exe",
      "Microsoft\\Edge\\Application\\msedge.exe",
    ];
    for (const prefix of prefixes) {
      for (const suffix of suffixes) {
        const candidate = path.join(prefix, suffix);
        if (await isExecutable(candidate)) return candidate;
      }
    }
  }

  // Common Linux names. Users can always pass --chrome-path.
  const fromPath = await findOnPath([
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
    "brave-browser",
    "microsoft-edge",
  ]);
  if (fromPath) return fromPath;

  const commonPaths = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
  ];
  for (const p of commonPaths) {
    if (await isExecutable(p)) return p;
  }

  return null;
}
