# CLAUDE.md

This file provides guidance for Claude Code when working with this repository.

## Project Overview

A CLI tool that renders web pages using a locally installed Chromium-family browser (via `puppeteer-core`) and converts the main content to clean Markdown using Readability + Turndown.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Run CLI with tsx (development)
npm run build        # Build distributable CLI to dist/
npm run typecheck    # Type check with TypeScript
```

## Usage Examples

```bash
# Basic: convert URL and print to stdout
npm run dev -- https://example.com --print

# Save to specific file
npm run dev -- https://example.com/article --out ./article.md

# Save to directory (auto-filename from title)
npm run dev -- https://example.com/article --out ./out/

# JS-heavy pages: wait for content
npm run dev -- https://example.com/app --wait-until domcontentloaded --wait-ms 2000

# Interactive mode for login/captcha pages
npm run dev -- https://example.com --interactive --user-data-dir ./tmp/chrome-profile

# Custom Chrome path
npm run dev -- https://example.com --chrome-path /usr/bin/google-chrome
```

## Architecture

```
src/
├── cli.ts              # CLI entry point, Commander argument parsing
└── lib/
    ├── convert.ts      # Core orchestration: render → extract → convert
    ├── render.ts       # Puppeteer browser automation and page rendering
    ├── markdown.ts     # Turndown configuration (GFM tables, strikethrough)
    ├── frontmatter.ts  # YAML frontmatter generation (title, source, date)
    ├── io.ts           # Output file path handling
    ├── normalize.ts    # Text normalization utilities
    ├── system.ts       # Chrome/Chromium executable auto-detection
    └── url.ts          # URL validation and utilities
```

## Key Patterns

- Uses `puppeteer-core` (no bundled Chromium) - user must have Chrome/Chromium installed
- Chrome path auto-detection via `src/lib/system.ts` for common OS locations
- Readability extracts main article content, Turndown converts HTML to Markdown
- `--print` outputs to stdout, `--out` writes to file or directory
- Interactive mode pauses for human verification (captchas, logins)
- YAML frontmatter included by default with title, source URL, and extracted date

## CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--out <path>` | Output file or directory | stdout |
| `--print` | Print to stdout | false |
| `--chrome-path <path>` | Chrome executable | auto-detect |
| `--headful` | Show browser window | false (headless) |
| `--interactive` | Pause for human verification | false |
| `--wait-until <event>` | Navigation: load, domcontentloaded, networkidle0, networkidle2 | networkidle2 |
| `--timeout-ms <ms>` | Navigation timeout | 45000 |
| `--wait-for <css>` | Wait for CSS selector | - |
| `--wait-ms <ms>` | Extra wait after navigation | 0 |
| `--user-data-dir <path>` | Chrome profile directory | - |
| `--no-sandbox` | Disable Chrome sandbox (CI/containers) | - |
| `--no-auto-scroll` | Disable lazy-load triggering scroll | - |
| `--no-frontmatter` | Omit YAML frontmatter | - |
| `--title <title>` | Override title | - |
| `--user-agent <ua>` | Override user agent | - |

## Development Notes

- Node.js >= 20 required (see `.nvmrc`)
- ESM modules (`"type": "module"` in package.json)
- tsup builds to `dist/cli.js` with shebang for global install
- Type declarations for `turndown-plugin-gfm` in `src/types/`

## Claude Code Skill

An optional skill wrapper is included in `claude/web-to-markdown/`. To install:

```bash
mkdir -p ~/.claude/skills
cp -R ./claude/web-to-markdown ~/.claude/skills/web-to-markdown
```

Invoke in Claude Code:

```
use the skill web-to-markdown to convert https://example.com to markdown
```
