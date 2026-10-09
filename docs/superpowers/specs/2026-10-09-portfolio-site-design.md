# Portfolio Site Design

Personal developer site for Joel Trauger, served from GitHub Pages at `joeltrauger.com`. Its purpose is to show recent projects and to advertise Joel as a developer without hard-selling: not actively seeking employment or contract work, but open to the right offer.

## Audience and tone

Anyone: employers, clients, peers. Showcase first. Unfinished work is shown honestly, with what was learned. A low-pressure "open to the right work" line appears on the home and contact pages.

## Stack

- Astro (static output) with TypeScript.
- Content pages written as Markdown, rendered through one shared layout.
- Vanilla TypeScript for the terminal menu; no client framework.
- Self-hosted fonts. No analytics, no third-party scripts.
- Deployed by a GitHub Actions workflow on push to `main` using the official Pages actions.
- Custom domain `joeltrauger.com` served at the site root, via a `CNAME` file in `public/`.

## Pages

| Route | Content |
| --- | --- |
| `/` | Intro, large terminal menu inset, numbered project list |
| `/santos` | SantOS |
| `/vintage-story` | Expanded Stomach, Remedy and Ruin (WIP) |
| `/snakeoil` | SnakeOil Synth |
| `/comfyui` | ComfyUI nodes |
| `/research` | MultiplicationPersistence, ExtremeLargeNumberMath, piLeibniz-GPU |
| `/contact` | Obfuscated email link, link to GitHub profile |

Project order is fixed as listed above. The footer and the terminal menu link to `https://github.com/traugdor` for the full repository list. No other repositories are featured.

## Layout and look

- Page content is centered with a maximum width of 1024px. Long-form prose sits in a narrower column inside it for readability.
- Clean editorial style: warm off-white background, serif headlines and body text, sans-serif UI details.
- The terminal is a dark inset with green monospace text. On `/` it is a large panel beside the intro; on all other pages it is a slim bar in the header.
- Dark mode via `prefers-color-scheme`. Layout works at phone widths.

## Terminal menu

The terminal is the site's navigation. Visitors can click menu entries or type commands.

- Commands: `help`, `ls`, `cd <page>`, `home`, `contact`, `github`, plus each page name used bare (`santos`, `vintage-story`, `snakeoil`, `comfyui`, `research`).
- Input is trimmed and case-insensitive. Unknown input prints a "not found, try help" message.
- `github` opens the GitHub profile; every other command navigates to a site route.
- Menu entries are real `<a>` links in the HTML, so navigation works with JavaScript disabled. Without JavaScript the terminal renders as the plain link list.
- The input is a labeled text field; the output region is announced to screen readers.
- Command parsing is a pure function (`input -> action`), separate from DOM code.

## Project page template

- Title, one-line pitch, long-form story.
- "At a glance" box: tech used, status (shipped, in progress, WIP), repo links.
- Pages with several repos get a short section per repo.
- "Next project" link at the bottom following the fixed order; the last project links to `/contact`.

## Content

Stories are drafted from the repository READMEs and Joel's descriptions, then edited by Joel. Anything not supplied by Joel or present in a README is left as a clearly marked gap in the Markdown rather than invented. Repo facts (languages, links) are written by hand; the site makes no GitHub API calls.

1. **SantOS** — began as a learning project and grew into an operating system with a custom kernel (C, bare-metal ELF kernel on a FAT12 filesystem).
2. **Vintage Story mods** — Expanded Stomach; Remedy and Ruin (work in progress).
3. **SnakeOil Synth** — a whistling-filter sound Joel chased for years, found on a Behringer Deepmind 12; researched, prototyped in Python, then converted to a VST with AI coding assistants.
4. **ComfyUI** — the main nodes repo (ComfyUI-quadMoons-nodes), the Ultimate SD Upscale node for GGUF models, and the Riffusion node.
5. **Research** — MultiplicationPersistence, ExtremeLargeNumberMath, piLeibniz-GPU.

## Email obfuscation

The contact address does not appear in the source or the built HTML. It is stored as separate fragments and assembled by script into a `mailto:` link when the visitor activates a "reveal email" control. Without JavaScript, the contact page directs visitors to the GitHub profile.

## Testing and verification

- Unit tests for the command parser: each valid command, `cd` with and without an argument, unknown input, case and whitespace handling.
- A build-output test asserting the contact address is absent from every generated HTML file.
- `astro check` and `astro build` must pass before deploy.
- Manual browser check of every page at phone and desktop widths, with and without JavaScript.

## Out of scope

Blog, CMS, contact form, analytics, live GitHub data, listings for repositories outside the five stories.
