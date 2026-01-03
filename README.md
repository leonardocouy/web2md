# web2md

A command-line tool that renders web pages using a locally installed Chromium-family browser and converts the main content to clean Markdown.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@leoflores/web2md)](https://www.npmjs.com/package/@leoflores/web2md)

## About

Extracts the main article content from any webpage using Mozilla's Readability (the same algorithm behind Firefox Reader View) and converts it to GitHub-flavored Markdown with Turndown. Perfect for saving articles, documentation, or any web content for offline reading or AI processing.

## Features

- **Smart Extraction** - Uses Readability to identify and extract main article content
- **Clean Markdown** - Converts to GFM with tables, strikethrough, and code blocks
- **JS-Rendered Pages** - Full Puppeteer support for SPAs and dynamic content
- **Interactive Mode** - Pause for captchas, logins, or human verification
- **YAML Frontmatter** - Includes title, source URL, and publication date
- **Lazy Load Support** - Auto-scroll triggers lazy-loaded images and content
- **No Bundled Browser** - Uses your existing Chrome/Chromium installation

## Installation

Run directly without installing:

```bash
npx @leoflores/web2md <url> --print
```

Or install globally:

```bash
npm install -g @leoflores/web2md
```

### Requirements

- Node.js >= 20
- Chrome, Chromium, or Edge installed locally

## Usage

```bash
web2md <url> [options]
```

### Quick Examples

```bash
# Print markdown to stdout
web2md https://example.com/article --print

# Save to specific file
web2md https://example.com/article --out ./article.md

# Save to directory (auto-filename from title)
web2md https://example.com/article --out ./out/

# JS-heavy pages: wait for content to load
web2md https://example.com/app --wait-until domcontentloaded --wait-ms 2000 --out ./app.md

# Interactive mode for login/captcha
web2md https://example.com --interactive --user-data-dir ./tmp/chrome-profile --out ./out/
```

## Options Reference

### Output Options

| Option | Description | Default |
|--------|-------------|---------|
| `--out <path>` | Output file or directory | stdout |
| `--print` | Print to stdout | false |
| `--frontmatter` | Include YAML frontmatter | true |
| `--no-frontmatter` | Omit YAML frontmatter | - |
| `--title <title>` | Override title in output | - |

### Browser Options

| Option | Description | Default |
|--------|-------------|---------|
| `--chrome-path <path>` | Chrome executable path | auto-detect |
| `--headful` | Show browser window | false (headless) |
| `--interactive` | Pause for human verification | false |
| `--user-data-dir <path>` | Chrome profile directory | - |
| `--user-agent <ua>` | Override user agent | - |
| `--no-sandbox` | Disable Chrome sandbox (CI/containers) | - |

### Navigation Options

| Option | Description | Default |
|--------|-------------|---------|
| `--wait-until <event>` | load, domcontentloaded, networkidle0, networkidle2 | networkidle2 |
| `--timeout-ms <ms>` | Navigation timeout | 45000 |
| `--wait-for <css>` | Wait for CSS selector | - |
| `--wait-ms <ms>` | Extra wait after navigation | 0 |
| `--no-auto-scroll` | Disable lazy-load triggering | - |

## Common Workflows

### Save Documentation

```bash
# Single page
web2md https://docs.example.com/guide --out ./docs/guide.md

# With shorter timeout for fast sites
web2md https://docs.example.com/api --timeout-ms 15000 --out ./docs/api.md
```

### Handle JavaScript-Heavy Sites

```bash
# Wait for specific element
web2md https://spa.example.com --wait-for ".article-content" --out ./article.md

# Wait for network to settle + extra time
web2md https://spa.example.com --wait-until networkidle0 --wait-ms 3000 --out ./article.md
```

### Sites with Login/Captcha

```bash
# First run: complete verification manually
web2md https://protected.example.com --interactive --user-data-dir ./tmp/profile --out ./article.md
# Browser opens, you complete login/captcha, press Enter to continue

# Subsequent runs: reuse the saved session
web2md https://protected.example.com --user-data-dir ./tmp/profile --out ./another.md
```

### CI/Docker Environments

```bash
# Disable sandbox for containers
web2md https://example.com --no-sandbox --out ./output.md
```

## Claude Code Skill

An optional skill wrapper is included for Claude Code users:

```bash
mkdir -p ~/.claude/skills
cp -R ./claude/web-to-markdown ~/.claude/skills/web-to-markdown
```

Then invoke in Claude:

```
use the skill web-to-markdown to convert https://example.com to markdown
```

## Development

```bash
# Install dependencies
npm install

# Run CLI in development
npm run dev -- https://example.com --print

# Type check
npm run typecheck

# Build distributable
npm run build
```

## How It Works

1. **Render** - Puppeteer launches Chrome and navigates to the URL
2. **Wait** - Configurable waiting strategy for JS content to load
3. **Extract** - Readability identifies and extracts the main article
4. **Convert** - Turndown transforms HTML to GitHub-flavored Markdown
5. **Output** - Write to file or stdout with optional YAML frontmatter

## Acknowledgments

Built with:
- [puppeteer-core](https://pptr.dev/) - Browser automation
- [@mozilla/readability](https://github.com/mozilla/readability) - Content extraction
- [turndown](https://github.com/mixmark-io/turndown) - HTML to Markdown conversion

## License

MIT License. See [LICENSE](LICENSE) for details.
