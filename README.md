# web2md

Render a webpage using a locally installed Chromium-family browser (via `puppeteer-core`) and convert the main content to **clean Markdown** (Readability + Turndown).

## Install

```bash
npm install
```

## Usage

```bash
npm run dev -- https://example.com/article --out ./article.md
```

Print to stdout:

```bash
npm run dev -- https://example.com/article --print
```

Write into a directory (auto-filename from title):

```bash
npm run dev -- https://example.com/article --out ./out/
```

JS-rendered pages (tune waiting):

```bash
npm run dev -- https://example.com/app --wait-until domcontentloaded --wait-ms 2000 --out ./app.md
```

Pages with “human verification” / login walls:

```bash
npm run dev -- https://example.com --interactive --user-data-dir ./tmp/chrome-profile --out ./out/
```

This does not bypass CAPTCHAs; it just opens Chrome so you can complete any checks yourself, then press Enter in the terminal to continue.

Use a specific Chrome executable:

```bash
npm run dev -- https://example.com --chrome-path /usr/bin/google-chrome --out ./page.md
```

Use a dedicated profile directory (helps with logged-in sites / preferences):

```bash
npm run dev -- https://example.com --user-data-dir ./tmp/chrome-profile --out ./page.md
```

Tip: don’t point `--user-data-dir` at your *active* Chrome profile directory (Chrome will lock it). Use a dedicated folder for automation.

Build a distributable CLI (then you can run it as `web2md` if installed globally via `npm link` or `npm i -g .`):

```bash
npm run build
./dist/cli.js --help
```

## Notes

- Prefer `puppeteer-core` (no bundled Chromium). Provide `--chrome-path` if auto-detection fails.
- For JS-heavy pages, tweak `--wait-until`, `--wait-for`, or `--wait-ms`.

## Claude Code skill

If you use Claude Code, this repo includes an optional skill wrapper that calls `web2md`.

Install it by copying the skill folder into `~/.claude/skills`:

```bash
mkdir -p ~/.claude/skills
cp -R ./claude/web-to-markdown ~/.claude/skills/web-to-markdown
```

Then, in Claude, invoke it explicitly:

`use the skill web-to-markdown to convert https://example.com to markdown`
