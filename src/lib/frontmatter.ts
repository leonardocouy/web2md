function yamlEscape(value: string): string {
  const needsQuotes = /[:\n\r\t"']/u.test(value) || value.trim() !== value;
  if (!needsQuotes) return value;
  return JSON.stringify(value);
}

export function buildFrontmatter(input: {
  title: string;
  url: string;
  fetchedAt: string;
  byline?: string | null;
  siteName?: string | null;
  excerpt?: string | null;
  lang?: string | null;
}): string {
  const lines: string[] = ["---"];
  lines.push(`title: ${yamlEscape(input.title)}`);
  lines.push(`url: ${yamlEscape(input.url)}`);
  lines.push(`fetched_at: ${yamlEscape(input.fetchedAt)}`);

  if (input.siteName) lines.push(`site_name: ${yamlEscape(input.siteName)}`);
  if (input.byline) lines.push(`byline: ${yamlEscape(input.byline)}`);
  if (input.lang) lines.push(`lang: ${yamlEscape(input.lang)}`);
  if (input.excerpt) lines.push(`excerpt: ${yamlEscape(input.excerpt)}`);

  lines.push("---");
  return lines.join("\n");
}

