import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

export function htmlToMarkdown(html: string): string {
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

  return service.turndown(html);
}
