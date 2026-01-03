export function normalizeMarkdown(md: string): string {
  let out = md.replace(/\r\n/g, "\n");
  out = out.replace(/[ \t]+\n/g, "\n");
  out = out.replace(/\n{4,}/g, "\n\n\n");
  out = out.replace(/^\n+/, "");
  return out.trimEnd();
}
