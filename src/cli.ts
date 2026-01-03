#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Command } from "commander";

import { convertUrlToMarkdown } from "./lib/convert.js";
import { ensureOutPath } from "./lib/io.js";
import type { WaitEvent } from "./lib/types.js";

const VALID_WAIT_EVENTS: WaitEvent[] = ["load", "domcontentloaded", "networkidle0", "networkidle2"];

const program = new Command();

program
  .name("web2md")
  .description(
    "Render a webpage with a locally installed Chromium-family browser (Puppeteer) and convert the main content to clean Markdown.",
  )
  .argument("<url>", "URL to convert")
  .option("--out <path>", "Output file path or directory")
  .option("--print", "Print markdown to stdout instead of writing a file", false)
  .option("--chrome-path <path>", "Chrome/Chromium executable path (auto-detected if omitted)")
  .option("--headful", "Run with a visible browser window (default: headless)", false)
  .option(
    "--interactive",
    "Show the browser and pause so you can complete human checks/login, then press Enter to continue",
    false,
  )
  .option("--no-sandbox", "Pass --no-sandbox flags to Chrome (sometimes required in CI/containers)")
  .option(
    "--wait-until <event>",
    "Navigation wait condition: load|domcontentloaded|networkidle0|networkidle2",
    "networkidle2",
  )
  .option("--timeout-ms <ms>", "Navigation timeout in ms", "45000")
  .option("--wait-for <css>", "Wait for a CSS selector after navigation")
  .option("--wait-ms <ms>", "Extra wait time after navigation in ms", "0")
  .option("--user-agent <ua>", "Override user agent")
  .option("--user-data-dir <path>", "Chrome user data directory (profile). Prefer a dedicated automation profile.")
  .option("--no-auto-scroll", "Disable the small auto-scroll pass used to trigger lazy-loaded content")
  .option("--frontmatter", "Include YAML frontmatter metadata", true)
  .option("--no-frontmatter", "Do not include YAML frontmatter metadata")
  .option("--title <title>", "Override title used in output filename/frontmatter")
  .showHelpAfterError();

interface CliOptions {
  out?: string;
  print: boolean;
  chromePath?: string;
  headful: boolean;
  interactive: boolean;
  sandbox: boolean;
  waitUntil: string;
  timeoutMs: string;
  waitFor?: string;
  waitMs: string;
  userAgent?: string;
  userDataDir?: string;
  autoScroll: boolean;
  frontmatter: boolean;
  title?: string;
}

function parseOptions(opts: CliOptions) {
  const timeoutMs = Number.parseInt(opts.timeoutMs, 10);
  const waitMs = Number.parseInt(opts.waitMs, 10);
  const noSandbox = opts.sandbox === false;
  const waitUntil = opts.waitUntil as WaitEvent;

  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("--timeout-ms must be a positive integer");
  }
  if (!Number.isFinite(waitMs) || waitMs < 0) {
    throw new Error("--wait-ms must be a non-negative integer");
  }
  if (!VALID_WAIT_EVENTS.includes(waitUntil)) {
    throw new Error(`--wait-until must be one of: ${VALID_WAIT_EVENTS.join(", ")}`);
  }

  return { timeoutMs, waitMs, noSandbox, waitUntil };
}

async function main() {
  program.parse(process.argv);

  const url = program.args[0];
  const opts = program.opts<CliOptions>();
  const { timeoutMs, waitMs, noSandbox, waitUntil } = parseOptions(opts);

  const res = await convertUrlToMarkdown({
    url,
    chromePath: opts.chromePath,
    headless: opts.interactive ? false : !opts.headful,
    noSandbox,
    waitUntil,
    timeoutMs,
    waitForSelector: opts.waitFor,
    waitMs,
    userAgent: opts.userAgent,
    userDataDir: opts.userDataDir,
    autoScroll: opts.autoScroll,
    interactive: opts.interactive,
    includeFrontmatter: opts.frontmatter,
    overrideTitle: opts.title,
  });

  if (opts.print || !opts.out) {
    process.stdout.write(res.markdown);
    if (!res.markdown.endsWith("\n")) {
      process.stdout.write("\n");
    }
    return;
  }

  const outPath = ensureOutPath({
    out: opts.out,
    title: res.title,
  });

  // Ensure parent directory exists
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, res.markdown, "utf8");

  console.error(`Saved: ${path.relative(process.cwd(), outPath)}`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
