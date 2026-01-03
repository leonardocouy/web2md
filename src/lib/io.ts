import path from "node:path";
import { statSync } from "node:fs";

function slugify(input: string): string {
  const ascii = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
  const cleaned = ascii
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return cleaned || "page";
}

export function ensureOutPath(input: { out: string; title: string }): string {
  const out = input.out;
  const looksLikeDir = out.endsWith("/") || out.endsWith(path.sep);
  if (looksLikeDir) {
    return path.join(out, `${slugify(input.title)}.md`);
  }

  try {
    const stat = statSync(out);
    if (stat.isDirectory()) {
      return path.join(out, `${slugify(input.title)}.md`);
    }
  } catch {
    // ignore
  }

  return out;
}
