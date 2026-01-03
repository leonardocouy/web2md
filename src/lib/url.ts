export function absolutizeLinks(md: string, baseUrl: string): string {
  let base: URL;
  try {
    base = new URL(baseUrl);
  } catch {
    return md;
  }

  // Absolutize markdown links: [text](href)
  return md.replace(/\]\(([^)\s]+)\)/g, (full, hrefRaw: string) => {
    const href = hrefRaw.trim();
    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("data:") ||
      href.startsWith("http://") ||
      href.startsWith("https://")
    ) {
      return full;
    }
    try {
      const absUrl = new URL(href, base);
      for (const key of [...absUrl.searchParams.keys()]) {
        if (
          key.startsWith("utm_") ||
          key === "fbclid" ||
          key === "gclid" ||
          key === "igshid" ||
          key === "mc_cid" ||
          key === "mc_eid"
        ) {
          absUrl.searchParams.delete(key);
        }
      }
      const abs = absUrl.toString();
      return `](${abs})`;
    } catch {
      return full;
    }
  });
}
