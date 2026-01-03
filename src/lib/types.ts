export type WaitEvent =
  | "load"
  | "domcontentloaded"
  | "networkidle0"
  | "networkidle2";

export interface BrowserOptions {
  url: string;
  chromePath?: string;
  headless: boolean;
  noSandbox: boolean;
  waitUntil: WaitEvent;
  timeoutMs: number;
  waitForSelector?: string;
  waitMs: number;
  userAgent?: string;
  userDataDir?: string;
  autoScroll: boolean;
  interactive: boolean;
}

export interface ConvertOptions extends BrowserOptions {
  includeFrontmatter: boolean;
  overrideTitle?: string;
}

export interface RenderResult {
  title: string;
  finalUrl: string;
  html: string;
}

export interface ConvertResult {
  title: string;
  url: string;
  markdown: string;
}
