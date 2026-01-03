import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { absolutizeLinks } from "./url.js";

export function htmlToMarkdown(input: { html: string; baseUrl: string }): string {
  const service = new TurndownService({
    codeBlockStyle: "fenced",
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    emDelimiter: "_",
    strongDelimiter: "**",
  });

  service.use(gfm);

  service.addRule("remove-scripts-styles", {
    filter: ["script", "style", "noscript"],
    replacement: () => "",
  });

  const md = service.turndown(input.html);
  return absolutizeLinks(md, input.baseUrl);
}
