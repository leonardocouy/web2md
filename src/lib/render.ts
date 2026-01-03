import fs from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import puppeteer from "puppeteer-core";
import { findChromeExecutable } from "./system.js";
import type { BrowserOptions, RenderResult } from "./types.js";

export type { RenderResult };

export async function renderPageHtml(opts: BrowserOptions): Promise<RenderResult> {
  const executablePath = opts.chromePath || (await findChromeExecutable());
  if (!executablePath) {
    throw new Error("Could not find Chrome/Chromium. Provide --chrome-path (e.g. /usr/bin/google-chrome).");
  }

  const args: string[] = ["--disable-dev-shm-usage"];
  if (opts.noSandbox) {
    args.push("--no-sandbox", "--disable-setuid-sandbox");
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: opts.headless,
    args,
    userDataDir: opts.userDataDir,
  });

  try {
    const page = await browser.newPage();
    if (opts.userAgent) await page.setUserAgent(opts.userAgent);

    await page.goto(opts.url, {
      waitUntil: opts.waitUntil,
      timeout: opts.timeoutMs,
    });

    if (opts.interactive) {
      if (opts.headless) {
        throw new Error("--interactive requires a visible browser (headful).");
      }

      await page.bringToFront().catch(() => {});

      const rl = createInterface({
        input: process.stdin,
        output: process.stderr,
      });
      try {
        await rl.question(
          "Interactive mode: complete any checks/login in the Chrome window, then press Enter here to continue...",
        );
      } finally {
        rl.close();
      }
    }

    if (opts.waitForSelector) {
      await page.waitForSelector(opts.waitForSelector, {
        timeout: Math.min(opts.timeoutMs, 30_000),
      });
    }

    if (opts.waitMs > 0) {
      await new Promise((r) => setTimeout(r, opts.waitMs));
    }

    if (opts.autoScroll) {
      // Some sites lazy-load content on scroll.
      await page.evaluate(async () => {
        const distance = 600;
        const delay = 50;
        for (let i = 0; i < 6; i++) {
          window.scrollBy(0, distance);
          await new Promise((r) => setTimeout(r, delay));
        }
        window.scrollTo(0, 0);
      });
    }

    const finalUrl = page.url();
    const title = (await page.title()) || "";
    const html = await page.content();

    // Optional debug dump if env var set.
    const dumpPath = process.env.WEB2MD_DUMP_HTML;
    if (dumpPath) {
      await fs.writeFile(dumpPath, html, "utf8");
    }

    return { title, finalUrl, html };
  } finally {
    await browser.close();
  }
}
