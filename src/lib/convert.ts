import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

import { renderPageHtml } from "./render.js";
import { htmlToMarkdown } from "./markdown.js";
import { buildFrontmatter } from "./frontmatter.js";
import { normalizeMarkdown } from "./normalize.js";

export type ConvertOptions = {
  url: string;
  chromePath?: string;
  headless: boolean;
  noSandbox: boolean;
  waitUntil: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  timeoutMs: number;
  waitForSelector?: string;
  waitMs: number;
  userAgent?: string;
  userDataDir?: string;
  autoScroll: boolean;
  interactive: boolean;
  includeFrontmatter: boolean;
  overrideTitle?: string;
};

export type ConvertResult = {
  title: string;
  url: string;
  markdown: string;
};

export async function convertUrlToMarkdown(
  opts: ConvertOptions
): Promise<ConvertResult> {
  const rendered = await renderPageHtml({
    url: opts.url,
    chromePath: opts.chromePath,
    headless: opts.headless,
    noSandbox: opts.noSandbox,
    waitUntil: opts.waitUntil,
    timeoutMs: opts.timeoutMs,
    waitForSelector: opts.waitForSelector,
    waitMs: opts.waitMs,
    userAgent: opts.userAgent,
    userDataDir: opts.userDataDir,
    autoScroll: opts.autoScroll,
    interactive: opts.interactive,
  });

  const dom = new JSDOM(rendered.html, { url: rendered.finalUrl });
  const reader = new Readability(dom.window.document, {
    keepClasses: false,
  });
  const article = reader.parse();

  const title =
    opts.overrideTitle?.trim() ||
    article?.title?.trim() ||
    rendered.title.trim() ||
    "untitled";

  const mainHtml =
    article?.content?.trim() ||
    dom.window.document.body?.innerHTML?.trim() ||
    "";

  if (!mainHtml) {
    throw new Error(
      "Empty HTML content after rendering/extraction. Try changing --wait-until or adding --wait-for/--wait-ms."
    );
  }

  let md = htmlToMarkdown({
    html: mainHtml,
    baseUrl: rendered.finalUrl,
  });

  md = normalizeMarkdown(md);

  if (opts.includeFrontmatter) {
    const fm = buildFrontmatter({
      title,
      url: rendered.finalUrl,
      byline: article?.byline,
      siteName: article?.siteName,
      excerpt: article?.excerpt,
      lang: dom.window.document.documentElement?.lang,
      fetchedAt: new Date().toISOString(),
    });
    md = `${fm}\n\n${md}`.trimEnd() + "\n";
  } else {
    md = md.trimEnd() + "\n";
  }

  return {
    title,
    url: rendered.finalUrl,
    markdown: md,
  };
}
