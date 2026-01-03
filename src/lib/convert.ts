import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { buildFrontmatter } from "./frontmatter.js";
import { htmlToMarkdown } from "./markdown.js";
import { normalizeMarkdown } from "./normalize.js";
import { renderPageHtml } from "./render.js";
import type { ConvertOptions, ConvertResult } from "./types.js";

export type { ConvertOptions, ConvertResult };

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "igshid",
  "mc_cid",
  "mc_eid",
];

function cleanUrl(url: string): string {
  try {
    const parsed = new URL(url);
    for (const param of TRACKING_PARAMS) {
      parsed.searchParams.delete(param);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function unwrapHeadingLinks(doc: Document): void {
  // Remove <a> wrappers around headings (common in docs for anchor links)
  // <a href="#foo"><h2>Title</h2></a> → <h2>Title</h2>
  for (const a of doc.querySelectorAll("a")) {
    const child = a.firstElementChild;
    if (child && /^H[1-6]$/.test(child.nodeName) && a.childElementCount === 1) {
      a.replaceWith(child);
    }
  }
}

function absolutizeLinksInDom(doc: Document): void {
  // Absolutize and clean <a> links
  for (const a of doc.querySelectorAll("a[href]")) {
    const href = (a as HTMLAnchorElement).href; // JSDOM resolves to absolute
    if (href) {
      a.setAttribute("href", cleanUrl(href));
    }
  }

  // Absolutize <img> sources
  for (const img of doc.querySelectorAll("img[src]")) {
    const src = (img as HTMLImageElement).src;
    if (src) {
      img.setAttribute("src", src);
    }
  }
}

export async function convertUrlToMarkdown(opts: ConvertOptions): Promise<ConvertResult> {
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
  const doc = dom.window.document;

  // Clean up DOM before Readability extracts content
  unwrapHeadingLinks(doc);
  absolutizeLinksInDom(doc);

  const reader = new Readability(doc, { keepClasses: false });
  const article = reader.parse();

  const title = opts.overrideTitle?.trim() || article?.title?.trim() || rendered.title.trim() || "untitled";

  const mainHtml = article?.content?.trim() || dom.window.document.body?.innerHTML?.trim() || "";

  if (!mainHtml) {
    throw new Error(
      "Empty HTML content after rendering/extraction. Try changing --wait-until or adding --wait-for/--wait-ms.",
    );
  }

  let md = htmlToMarkdown(mainHtml);

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
    md = `${`${fm}\n\n${md}`.trimEnd()}\n`;
  } else {
    md = `${md.trimEnd()}\n`;
  }

  return {
    title,
    url: rendered.finalUrl,
    markdown: md,
  };
}
