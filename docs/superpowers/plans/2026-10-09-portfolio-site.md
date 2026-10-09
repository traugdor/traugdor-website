# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Joel Trauger's multipage developer portfolio in Astro and deploy it to GitHub Pages at `joeltrauger.com`.

**Architecture:** A static Astro site. A single route registry (`src/lib/routes.ts`) drives the terminal menu, the home project list, and the "next project" links. A pure command parser (`src/lib/commands.ts`) is the only logic behind the terminal; a thin DOM script wires it to the page. Project stories are Markdown files in an Astro content collection rendered by one shared layout.

**Tech Stack:** Astro, TypeScript, Vitest, GitHub Actions (official Pages actions). No client framework, no external requests.

**Repository rules (from `CLAUDE.md`):** Commit messages carry no `Co-Authored-By` trailer or any AI attribution. Code comments describe the current contract only: no narration of changes or rejected alternatives.

**Spec:** `docs/superpowers/specs/2026-10-09-portfolio-site-design.md`

**Privacy rule:** The contact email address must never appear as a literal string anywhere in the repository (source, tests, docs) except as separate fragments in `src/lib/email.ts`.

---

## File Structure

```
package.json
astro.config.mjs
tsconfig.json
public/CNAME
.github/workflows/deploy.yml
src/content.config.ts
src/content/projects/{santos,vintage-story,snakeoil,comfyui,research}.md
src/lib/routes.ts            route registry, GitHub URL
src/lib/commands.ts          pure parser: input -> Action
src/lib/email.ts             address fragments, assembly
src/scripts/terminal.ts      DOM wiring for the terminal
src/scripts/reveal-email.ts  DOM wiring for the contact button
src/components/Terminal.astro
src/layouts/Base.astro
src/layouts/ProjectLayout.astro
src/pages/index.astro
src/pages/[slug].astro
src/pages/contact.astro
src/styles/global.css
tests/unit/commands.test.ts
tests/unit/email.test.ts
tests/build/dist.test.ts
```

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `public/CNAME`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "website",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run tests/unit",
    "test:build": "vitest run tests/build"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install astro @astrojs/check typescript && npm install -D vitest`
Expected: installs without errors; `package.json` now lists `dependencies` and `devDependencies`. Note the installed Astro major version (`npm ls astro`); the content-collection code in Task 7 targets Astro 5 and later.

- [ ] **Step 3: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://joeltrauger.com',
});
```

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: Write `public/CNAME`**

```
joeltrauger.com
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json public/CNAME
git commit -m "Scaffold Astro project"
```

---

### Task 2: Route registry and command parser

**Files:**
- Create: `src/lib/routes.ts`, `src/lib/commands.ts`
- Test: `tests/unit/commands.test.ts`

- [ ] **Step 1: Write `src/lib/routes.ts`**

```ts
export interface Route {
  /** Command and URL segment, e.g. `santos` -> `/santos`. */
  name: string;
  path: string;
  title: string;
  blurb: string;
}

export const GITHUB_URL = 'https://github.com/traugdor';
export const HOME_PATH = '/';

/** Project routes in display order. The order drives numbering and "next project" links. */
export const projectRoutes: readonly Route[] = [
  { name: 'santos', path: '/santos', title: 'SantOS', blurb: 'a learning project that grew a kernel' },
  { name: 'vintage-story', path: '/vintage-story', title: 'Vintage Story mods', blurb: 'Expanded Stomach, Remedy and Ruin' },
  { name: 'snakeoil', path: '/snakeoil', title: 'SnakeOil Synth', blurb: 'chasing a sound for years' },
  { name: 'comfyui', path: '/comfyui', title: 'ComfyUI nodes', blurb: 'upscaling and audio' },
  { name: 'research', path: '/research', title: 'Research', blurb: 'persistence, huge numbers, pi on a GPU' },
];

export const contactRoute: Route = {
  name: 'contact',
  path: '/contact',
  title: 'Contact',
  blurb: 'say hello',
};

/** Every page the terminal can navigate to, excluding home. */
export const allRoutes: readonly Route[] = [...projectRoutes, contactRoute];
```

- [ ] **Step 2: Write the failing parser tests**

`tests/unit/commands.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseCommand } from '../../src/lib/commands';
import { allRoutes, GITHUB_URL, HOME_PATH } from '../../src/lib/routes';

const parse = (input: string) => parseCommand(input, allRoutes, GITHUB_URL);

describe('parseCommand', () => {
  it('returns empty for blank input', () => {
    expect(parse('')).toEqual({ type: 'empty' });
    expect(parse('   ')).toEqual({ type: 'empty' });
  });

  it('lists the menu for help and ls', () => {
    expect(parse('help')).toEqual({ type: 'list' });
    expect(parse('ls')).toEqual({ type: 'list' });
  });

  it('navigates to a page by bare name', () => {
    expect(parse('santos')).toEqual({ type: 'navigate', name: 'santos', path: '/santos' });
    expect(parse('vintage-story')).toEqual({ type: 'navigate', name: 'vintage-story', path: '/vintage-story' });
    expect(parse('contact')).toEqual({ type: 'navigate', name: 'contact', path: '/contact' });
  });

  it('navigates with cd <page>', () => {
    expect(parse('cd snakeoil')).toEqual({ type: 'navigate', name: 'snakeoil', path: '/snakeoil' });
  });

  it('ignores case and extra whitespace', () => {
    expect(parse('  CD    ComfyUI  ')).toEqual({ type: 'navigate', name: 'comfyui', path: '/comfyui' });
    expect(parse('  HELP ')).toEqual({ type: 'list' });
  });

  it('goes home for home, bare cd, and cd to home aliases', () => {
    const home = { type: 'navigate', name: 'home', path: HOME_PATH };
    expect(parse('home')).toEqual(home);
    expect(parse('cd')).toEqual(home);
    expect(parse('cd ..')).toEqual(home);
    expect(parse('cd ~')).toEqual(home);
    expect(parse('cd /')).toEqual(home);
    expect(parse('cd home')).toEqual(home);
  });

  it('opens GitHub externally', () => {
    expect(parse('github')).toEqual({ type: 'external', url: GITHUB_URL });
  });

  it('reports unknown input with the trimmed original text', () => {
    expect(parse('  sudo rm -rf  ')).toEqual({ type: 'unknown', input: 'sudo rm -rf' });
    expect(parse('cd nowhere')).toEqual({ type: 'unknown', input: 'cd nowhere' });
    expect(parse('cd santos extra')).toEqual({ type: 'unknown', input: 'cd santos extra' });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../../src/lib/commands`.

- [ ] **Step 4: Write `src/lib/commands.ts`**

```ts
import { HOME_PATH, type Route } from './routes';

export type Action =
  | { type: 'empty' }
  | { type: 'list' }
  | { type: 'navigate'; name: string; path: string }
  | { type: 'external'; url: string }
  | { type: 'unknown'; input: string };

const CD_HOME_TARGETS = ['', '..', '~', '/'];

/**
 * Maps terminal input to an action. Input is trimmed, lowercased, and has
 * internal whitespace collapsed. `routes` excludes home; home is handled here.
 */
export function parseCommand(raw: string, routes: readonly Route[], githubUrl: string): Action {
  const trimmed = raw.trim();
  const input = trimmed.toLowerCase().replace(/\s+/g, ' ');

  if (input === '') return { type: 'empty' };
  if (input === 'help' || input === 'ls') return { type: 'list' };
  if (input === 'github') return { type: 'external', url: githubUrl };

  const isCd = input === 'cd' || input.startsWith('cd ');
  const target = isCd ? input.slice(2).trim() : input;

  if (target === 'home' || (isCd && CD_HOME_TARGETS.includes(target))) {
    return { type: 'navigate', name: 'home', path: HOME_PATH };
  }

  const route = routes.find((r) => r.name === target);
  if (route) return { type: 'navigate', name: route.name, path: route.path };

  return { type: 'unknown', input: trimmed };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS, 8 tests.

- [ ] **Step 6: Commit**

```bash
git add src/lib/routes.ts src/lib/commands.ts tests/unit/commands.test.ts
git commit -m "Add route registry and terminal command parser"
```

---

### Task 3: Email assembly

**Files:**
- Create: `src/lib/email.ts`
- Test: `tests/unit/email.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/unit/email.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { assembleAddress, mailtoHref } from '../../src/lib/email';

describe('email assembly', () => {
  it('assembles a well-formed address', () => {
    expect(assembleAddress()).toMatch(/^[a-z0-9.]+@[a-z0-9]+\.[a-z]+$/);
  });

  it('builds a mailto href around the assembled address', () => {
    expect(mailtoHref()).toBe(`mailto:${assembleAddress()}`);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../../src/lib/email`.

- [ ] **Step 3: Write `src/lib/email.ts`**

```ts
// The address is kept as fragments so it never appears as one literal string
// in source or build output. Joined only when a visitor asks to reveal it.
const LOCAL_PART = ['joel', 'trauger'];
const DOMAIN = ['gmail', 'com'];

export function assembleAddress(): string {
  return `${LOCAL_PART.join('.')}@${DOMAIN.join('.')}`;
}

export function mailtoHref(): string {
  return `mailto:${assembleAddress()}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS, 10 tests total.

- [ ] **Step 5: Commit**

```bash
git add src/lib/email.ts tests/unit/email.test.ts
git commit -m "Add obfuscated email assembly"
```

---

### Task 4: Global styles and base layout

**Files:**
- Create: `src/styles/global.css`, `src/layouts/Base.astro`

- [ ] **Step 1: Write `src/styles/global.css`**

```css
:root {
  --bg: #faf8f4;
  --fg: #1c1b19;
  --muted: #7a756b;
  --rule: #e2ddd2;
  --serif: Georgia, 'Times New Roman', serif;
  --sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --mono: ui-monospace, 'Cascadia Code', Consolas, monospace;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #16150f;
    --fg: #ece8dd;
    --muted: #9b968a;
    --rule: #302e26;
  }
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--serif);
  line-height: 1.6;
}

a { color: inherit; }

.page { max-width: 1024px; margin: 0 auto; padding: 0 28px; }

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid var(--rule);
  font: 14px var(--sans);
}
.site-header a { text-decoration: none; font-weight: 600; font-size: 15px; }
.site-header span { color: var(--muted); }

.eyebrow {
  font: 600 11px/1 var(--sans);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
}

.site-footer {
  margin-top: 56px;
  padding: 22px 0 40px;
  border-top: 1px solid var(--rule);
  font: 13px var(--sans);
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

/* Home */
.hero {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 40px;
  padding: 48px 0 36px;
  align-items: start;
}
.hero h1 { font-size: 44px; line-height: 1.1; margin: 12px 0 16px; font-weight: 600; }
.hero p { font: 16px/1.6 var(--sans); color: var(--muted); margin: 0 0 20px; }
.hero .cta { font: 14px var(--sans); }
.hero .cta a { border-bottom: 1px solid var(--fg); text-decoration: none; padding-bottom: 1px; }
.hero .cta small { color: var(--muted); margin-left: 14px; }

.how-i-work {
  margin: 0 0 40px;
  padding: 18px 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  font-size: 18px;
  max-width: 720px;
}

.section-label {
  font: 600 11px/1 var(--sans);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 8px 0 12px;
}

.project-list { border-top: 1px solid var(--rule); }
.project-list a {
  display: grid;
  grid-template-columns: 44px 240px 1fr 24px;
  align-items: baseline;
  padding: 16px 0;
  border-bottom: 1px solid var(--rule);
  text-decoration: none;
  font-family: var(--sans);
}
.project-list a:hover { background: color-mix(in srgb, var(--fg) 4%, transparent); }
.project-list .n { color: var(--muted); font-size: 13px; }
.project-list .t { font: 600 19px var(--serif); }
.project-list .d { color: var(--muted); font-size: 14px; }
.project-list .ar { color: var(--muted); }

/* Terminal */
.term {
  background: #0b0f0c;
  color: #7cfc9a;
  font: 13px/1.7 var(--mono);
  border-radius: 10px;
  overflow: hidden;
}
.term a { color: #d8ffe3; text-decoration: none; }
.term a:hover { text-decoration: underline; }
.term .dim { color: #5f8f6e; }
.term form { display: flex; gap: 8px; align-items: center; }
.term form[hidden] { display: none; }
.term label { color: #5f8f6e; white-space: nowrap; }
.term input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: 0;
  color: #7cfc9a;
  font: inherit;
  caret-color: #7cfc9a;
  padding: 0;
}
.term-log { white-space: pre-wrap; color: #d8ffe3; }
.term-log:empty { display: none; }

.term-big { box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2); }
.term-big .term-bar {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 9px 14px;
  background: #121813;
  color: #5f8f6e;
  font-size: 11px;
}
.term-big .term-bar i { width: 9px; height: 9px; border-radius: 50%; background: #2c3a30; display: inline-block; }
.term-big .term-bar span { margin-left: 6px; }
.term-big .term-body { padding: 12px 16px 14px; }
.term-big ul { list-style: none; margin: 0 0 10px; padding: 0; }
.term-big li a { display: inline-block; min-width: 9.5em; }
.term-big li span { color: #8fd9a8; }
.term-big .term-log { max-height: 160px; overflow-y: auto; margin-bottom: 8px; }

.term-slim { margin: 14px 0 0; padding: 8px 14px; }
.term-slim .term-body { display: flex; gap: 8px 18px; flex-wrap: wrap; align-items: center; }
.term-slim ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 6px 16px; flex-wrap: wrap; }
.term-slim li span { display: none; }
.term-slim .term-log { flex-basis: 100%; }
.term-slim form { flex: 1 1 160px; }

/* Project and contact pages */
.project-page h1,
.contact-page h1 { font-size: 46px; line-height: 1.1; margin: 12px 0 8px; font-weight: 600; }
.project-page header { margin-top: 36px; }
.pitch { font: 18px/1.5 var(--sans); color: var(--muted); margin: 0 0 32px; max-width: 640px; }

.project-cols { display: grid; grid-template-columns: 1fr 260px; gap: 48px; align-items: start; }
.prose { max-width: 640px; font-size: 18px; }
.prose p { margin: 0 0 1.1em; }
.prose h2 { font-size: 24px; margin: 1.6em 0 0.4em; }
.prose .gap {
  border: 1px dashed var(--muted);
  color: var(--muted);
  padding: 10px 14px;
  font: 14px var(--sans);
  border-radius: 6px;
  margin: 0 0 1.1em;
}

.glance { font: 14px/1.5 var(--sans); border: 1px solid var(--rule); border-radius: 8px; padding: 16px 18px; }
.glance h2 { margin: 0 0 10px; font: 600 11px var(--sans); letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); }
.glance dl { margin: 0; }
.glance dt { color: var(--muted); font-size: 12px; margin-top: 10px; }
.glance dd { margin: 2px 0 0; }
.glance ul { margin: 2px 0 0; padding-left: 18px; }

.next { margin-top: 40px; padding: 18px 0; border-top: 1px solid var(--rule); font: 15px var(--sans); }

.contact-page { padding-top: 24px; }
.contact-page .prose { margin-top: 24px; }
.reveal {
  font: 15px var(--sans);
  background: var(--fg);
  color: var(--bg);
  border: 0;
  border-radius: 6px;
  padding: 10px 18px;
  cursor: pointer;
}

@media (max-width: 860px) {
  .hero,
  .project-cols { grid-template-columns: 1fr; }
  .project-list a { grid-template-columns: 34px 1fr 20px; }
  .project-list .d { grid-column: 2 / 3; }
  .hero h1,
  .project-page h1,
  .contact-page h1 { font-size: 34px; }
}
```

- [ ] **Step 2: Write `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';
import Terminal from '../components/Terminal.astro';

interface Props {
  title: string;
  description: string;
  /** Slim terminal bar under the header. The home page shows the large terminal instead. */
  slimTerminal?: boolean;
}

const { title, description, slimTerminal = true } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>
    <div class="page">
      <header class="site-header">
        <a href="/">Joel Trauger</a>
        <span>Developer</span>
      </header>
      {slimTerminal && <Terminal variant="slim" />}
      <slot />
      <footer class="site-footer">
        <span>&copy; Joel Trauger</span>
        <span>
          <a href="https://github.com/traugdor">See all repositories on GitHub</a>
          &nbsp;·&nbsp;
          <a href="/contact">Contact</a>
        </span>
      </footer>
    </div>
  </body>
</html>
```

- [ ] **Step 3: Commit**

The layout imports `Terminal.astro`, which is written in Task 5, so do not build yet.

```bash
git add src/styles/global.css src/layouts/Base.astro
git commit -m "Add global styles and base layout"
```

---

### Task 5: Terminal component and script

**Files:**
- Create: `src/components/Terminal.astro`, `src/scripts/terminal.ts`

- [ ] **Step 1: Write `src/components/Terminal.astro`**

The menu is a real list of links so navigation works without JavaScript. The form is hidden until the script runs.

```astro
---
import { allRoutes } from '../lib/routes';

interface Props {
  variant?: 'big' | 'slim';
}

const { variant = 'big' } = Astro.props;
const inputId = `term-input-${variant}`;
---

<div class={`term term-${variant}`} data-terminal>
  {
    variant === 'big' && (
      <div class="term-bar" aria-hidden="true">
        <i /><i /><i />
        <span>joeltrauger.com</span>
      </div>
    )
  }
  <div class="term-body">
    <nav aria-label="Site menu">
      <ul>
        <li><a href="/">home</a> <span>back to the start</span></li>
        {
          allRoutes.map((route) => (
            <li>
              <a href={route.path}>{route.name}</a> <span>{route.blurb}</span>
            </li>
          ))
        }
        <li><a href="https://github.com/traugdor">github</a> <span>all repositories</span></li>
      </ul>
    </nav>
    <div class="term-log" data-log role="log" aria-live="polite"></div>
    <form hidden data-form>
      <label for={inputId}>guest@jt:~$</label>
      <input id={inputId} type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type help" />
    </form>
  </div>
</div>

<script>
  import '../scripts/terminal';
</script>
```

- [ ] **Step 2: Write `src/scripts/terminal.ts`**

```ts
import { parseCommand } from '../lib/commands';
import { allRoutes, GITHUB_URL } from '../lib/routes';

const NAME_WIDTH = 14;

function menuText(): string {
  const rows = [
    ...allRoutes.map((r) => `${r.name.padEnd(NAME_WIDTH)}${r.blurb}`),
    `${'home'.padEnd(NAME_WIDTH)}back to the start`,
    `${'github'.padEnd(NAME_WIDTH)}all repositories`,
  ];
  return rows.join('\n');
}

function print(log: HTMLElement, text: string): void {
  const line = document.createElement('div');
  line.textContent = text;
  log.append(line);
  log.scrollTop = log.scrollHeight;
}

function wire(term: HTMLElement): void {
  const form = term.querySelector<HTMLFormElement>('[data-form]');
  const log = term.querySelector<HTMLElement>('[data-log]');
  const input = form?.querySelector('input');
  if (!form || !log || !input) return;

  form.hidden = false;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const raw = input.value;
    input.value = '';
    const action = parseCommand(raw, allRoutes, GITHUB_URL);

    switch (action.type) {
      case 'empty':
        return;
      case 'list':
        print(log, menuText());
        return;
      case 'navigate':
        print(log, `-> ${action.path}`);
        window.location.assign(action.path);
        return;
      case 'external':
        print(log, `opening ${action.url}`);
        window.location.assign(action.url);
        return;
      case 'unknown':
        print(log, `not found: ${action.input}. try help`);
        return;
    }
  });
}

document.querySelectorAll<HTMLElement>('[data-terminal]').forEach(wire);
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Terminal.astro src/scripts/terminal.ts
git commit -m "Add terminal menu component"
```

---

### Task 6: Content collection, project layout, and project pages

**Files:**
- Create: `src/content.config.ts`, `src/layouts/ProjectLayout.astro`, `src/pages/[slug].astro`, `src/content/projects/*.md`

- [ ] **Step 1: Write `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    pitch: z.string(),
    status: z.string(),
    tech: z.array(z.string()),
    repos: z.array(z.object({ label: z.string(), url: z.string().url() })),
  }),
});

export const collections = { projects };
```

If the installed Astro reports that `z` from `astro:content` is deprecated, import it from `astro/zod` instead.

- [ ] **Step 2: Write `src/layouts/ProjectLayout.astro`**

```astro
---
import Base from './Base.astro';
import { allRoutes, type Route } from '../lib/routes';

interface Props {
  route: Route;
  index: number;
  pitch: string;
  status: string;
  tech: string[];
  repos: { label: string; url: string }[];
}

const { route, index, pitch, status, tech, repos } = Astro.props;
const next = allRoutes[allRoutes.findIndex((r) => r.name === route.name) + 1];
const number = String(index + 1).padStart(2, '0');
---

<Base title={`${route.title} — Joel Trauger`} description={pitch}>
  <main class="project-page">
    <header>
      <div class="eyebrow">{number} · Project</div>
      <h1>{route.title}</h1>
      <p class="pitch">{pitch}</p>
    </header>
    <div class="project-cols">
      <div class="prose"><slot /></div>
      <aside class="glance">
        <h2>At a glance</h2>
        <dl>
          <dt>Built with</dt>
          <dd>{tech.join(', ')}</dd>
          <dt>Status</dt>
          <dd>{status}</dd>
          <dt>Source</dt>
          <dd>
            <ul>
              {repos.map((repo) => <li><a href={repo.url}>{repo.label}</a></li>)}
            </ul>
          </dd>
        </dl>
      </aside>
    </div>
    {next && <p class="next">Next: <a href={next.path}>{next.title} &rarr;</a></p>}
  </main>
</Base>
```

- [ ] **Step 3: Write `src/pages/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import ProjectLayout from '../layouts/ProjectLayout.astro';
import { projectRoutes } from '../lib/routes';

export async function getStaticPaths() {
  const entries = await getCollection('projects');
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const index = projectRoutes.findIndex((r) => r.name === entry.id);
if (index === -1) throw new Error(`No route registered for project "${entry.id}"`);

const { Content } = await render(entry);
---

<ProjectLayout route={projectRoutes[index]} index={index} {...entry.data}>
  <Content />
</ProjectLayout>
```

- [ ] **Step 4: Write `src/content/projects/santos.md`**

Gaps are marked with `<div class="gap">` and must be replaced by Joel before the first deploy.

```markdown
---
pitch: A learning project that grew into an operating system with its own kernel.
status: Ongoing
tech:
  - C
  - Bare-metal ELF kernel
  - FAT12
repos:
  - label: github.com/traugdor/SantOS
    url: https://github.com/traugdor/SantOS
---

SantOS started as a way to learn how a computer boots and what an operating system does once it has control. It is a simple OS built around a bare-metal ELF kernel on a FAT12 filesystem, written in C.

<div class="gap">[Joel: how it started, the moment it stopped being an exercise, what the kernel does today, and what you learned.]</div>

Contributions are welcome as long as the reason for each change is clearly explained.
```

- [ ] **Step 5: Write `src/content/projects/vintage-story.md`**

```markdown
---
pitch: Mods for Vintage Story, one finished and one in progress.
status: Expanded Stomach released; Remedy and Ruin in progress
tech:
  - C#
  - Vintage Story modding API
repos:
  - label: ExpandedStomach
    url: https://github.com/traugdor/ExpandedStomach
  - label: Remedy-And-Ruin (WIP)
    url: https://github.com/traugdor/Remedy-And-Ruin
---

## Expanded Stomach

Eat all you want, finish that last bite. Expanded Stomach lets players eat more than their satiety meter would normally allow, within limits. Just don't do it all the time.

<div class="gap">[Joel: why you made it, how it works, how it was received.]</div>

## Remedy and Ruin (work in progress)

<div class="gap">[Joel: what Remedy and Ruin is and where it stands.]</div>
```

- [ ] **Step 6: Write `src/content/projects/snakeoil.md`**

```markdown
---
pitch: Chasing a sound I had heard about for years, then building the synth that makes it.
status: Working synth; VST built with AI coding assistants
tech:
  - Python
  - VST
repos:
  - label: SnakeOil-Synth
    url: https://github.com/traugdor/SnakeOil-Synth
---

For years I had heard about a whistling filter sound and wanted it. Then I bought a Behringer Deepmind 12, which has exactly that sound.

I did a lot of research into how the sound is made, prototyped the synth in Python, and then converted it to a VST with the help of AI coding assistants.

<div class="gap">[Joel: what the research turned up, how the prototype behaves, which assistants you used and how you directed them, and where the VST can be downloaded. Confirm whether the VST lives in the SnakeOil-Synth repo; its GitHub description currently reads "Python MIDI synth".]</div>
```

- [ ] **Step 7: Write `src/content/projects/comfyui.md`**

```markdown
---
pitch: Custom ComfyUI nodes for upscaling and audio generation.
status: Released
tech:
  - Python
  - ComfyUI
repos:
  - label: ComfyUI-quadMoons-nodes
    url: https://github.com/traugdor/ComfyUI-quadMoons-nodes
  - label: ComfyUI-UltimateSDUpscale-GGUF
    url: https://github.com/traugdor/ComfyUI-UltimateSDUpscale-GGUF
  - label: ComfyUI-Riffusion
    url: https://github.com/traugdor/ComfyUI-Riffusion
---

## quadMoons nodes

The main repository for the nodes I wrote on my own for ComfyUI.

<div class="gap">[Joel: which nodes are in it and what they do.]</div>

## Ultimate SD Upscale for GGUF models

A GGUF implementation of the Ultimate SD Upscale node.

<div class="gap">[Joel: why GGUF support was needed and how it works.]</div>

## Riffusion

A Riffusion extension that generates audio from text.

<div class="gap">[Joel: how you built it and what you can make with it.]</div>
```

- [ ] **Step 8: Write `src/content/projects/research.md`**

```markdown
---
pitch: Small research projects on persistence, huge numbers, and pi.
status: Experiments
tech:
  - C#
  - Python
repos:
  - label: MultiplicationPersistence
    url: https://github.com/traugdor/MultiplicationPersistence
  - label: ExtremeLargeNumberMath
    url: https://github.com/traugdor/ExtremeLargeNumberMath
  - label: piLeibniz-GPU
    url: https://github.com/traugdor/piLeibniz-GPU
---

## MultiplicationPersistence

A multithreaded search for the lowest number with the highest multiplication persistence, from 0 up to an input maximum.

<div class="gap">[Joel: what you found and how far it got.]</div>

## ExtremeLargeNumberMath

A C# library for computing extremely large numbers.

<div class="gap">[Joel: the problem it solves and how it represents the numbers.]</div>

## piLeibniz-GPU

Calculates pi on your GPU with the Leibniz algorithm. It is a very expensive task, which makes it useful as a benchmark.

<div class="gap">[Joel: results, hardware, and what you learned about GPU work.]</div>
```

- [ ] **Step 9: Commit**

```bash
git add src/content.config.ts src/layouts/ProjectLayout.astro "src/pages/[slug].astro" src/content
git commit -m "Add project pages and content"
```

---

### Task 7: Home and contact pages

**Files:**
- Create: `src/pages/index.astro`, `src/pages/contact.astro`, `src/scripts/reveal-email.ts`

- [ ] **Step 1: Write `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Terminal from '../components/Terminal.astro';
import { projectRoutes } from '../lib/routes';
---

<Base
  title="Joel Trauger — Developer"
  description="Joel Trauger's projects: an operating system, a synthesizer, game mods, ComfyUI nodes, and research."
  slimTerminal={false}
>
  <main>
    <section class="hero">
      <div>
        <div class="eyebrow">Developer · Tinkerer</div>
        <h1>I build things to find out how they work.</h1>
        <p>An operating system, a synthesizer, game mods, and a few experiments in math. Some of it is finished. All of it taught me something.</p>
        <div class="cta">
          <a href="/santos">Start with SantOS &rarr;</a>
          <small>Open to the right work.</small>
        </div>
      </div>
      <Terminal variant="big" />
    </section>

    <p class="how-i-work">
      I'm an AI-first developer with more than a decade of experience doing it the hard way first. I use AI
      assistants because I know what good work looks like, and I know when they get it wrong.
    </p>

    <h2 class="section-label">Projects</h2>
    <nav class="project-list" aria-label="Projects">
      {
        projectRoutes.map((route, i) => (
          <a href={route.path}>
            <span class="n">{String(i + 1).padStart(2, '0')}</span>
            <span class="t">{route.title}</span>
            <span class="d">{route.blurb}</span>
            <span class="ar">&rarr;</span>
          </a>
        ))
      }
    </nav>
  </main>
</Base>
```

- [ ] **Step 2: Write `src/scripts/reveal-email.ts`**

```ts
import { assembleAddress, mailtoHref } from '../lib/email';

const button = document.querySelector<HTMLButtonElement>('[data-reveal-email]');
const target = document.querySelector<HTMLElement>('[data-email-target]');

if (button && target) {
  button.hidden = false;
  button.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = mailtoHref();
    link.textContent = assembleAddress();
    target.replaceChildren(link);
    button.hidden = true;
  });
}
```

- [ ] **Step 3: Write `src/pages/contact.astro`**

The button is hidden until the script runs. The `noscript` block gives visitors without JavaScript a way to reach Joel.

```astro
---
import Base from '../layouts/Base.astro';
import { GITHUB_URL } from '../lib/routes';
---

<Base title="Contact — Joel Trauger" description="Get in touch with Joel Trauger.">
  <main class="contact-page">
    <div class="eyebrow">Contact</div>
    <h1>Say hello</h1>
    <div class="prose">
      <p>I'm not actively looking for work, but I'm open to the right offer, whether that's a full-time role or side work that pays well enough.</p>
      <p>
        <button class="reveal" type="button" data-reveal-email hidden>Reveal email address</button>
        <span data-email-target></span>
        <noscript>Email is revealed with JavaScript. Without it, reach me through <a href={GITHUB_URL}>my GitHub profile</a>.</noscript>
      </p>
      <p>The rest of my work is on <a href={GITHUB_URL}>GitHub</a>.</p>
    </div>
  </main>
</Base>

<script>
  import '../scripts/reveal-email';
</script>
```

- [ ] **Step 4: Run the type check and build**

Run: `npm run check && npm run build`
Expected: `astro check` reports 0 errors; the build lists `/index.html`, `/santos/index.html`, `/vintage-story/index.html`, `/snakeoil/index.html`, `/comfyui/index.html`, `/research/index.html`, `/contact/index.html`.

- [ ] **Step 5: Commit**

```bash
git add src/pages src/scripts/reveal-email.ts
git commit -m "Add home and contact pages"
```

---

### Task 8: Build-output test

**Files:**
- Test: `tests/build/dist.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assembleAddress } from '../../src/lib/email';
import { allRoutes } from '../../src/lib/routes';

const DIST = join(process.cwd(), 'dist');
const TEXT_EXTENSIONS = ['.html', '.js', '.css', '.json', '.xml', '.txt', '.map'];

function textFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return textFiles(path);
    return TEXT_EXTENSIONS.some((ext) => path.endsWith(ext)) ? [path] : [];
  });
}

describe('built site', () => {
  it('has been built', () => {
    expect(existsSync(DIST), 'run `npm run build` first').toBe(true);
  });

  it('contains a page for every route', () => {
    expect(existsSync(join(DIST, 'index.html'))).toBe(true);
    for (const route of allRoutes) {
      expect(existsSync(join(DIST, route.name, 'index.html')), route.path).toBe(true);
    }
  });

  it('never contains the contact address or a mailto link', () => {
    const address = assembleAddress();
    for (const file of textFiles(DIST)) {
      const content = readFileSync(file, 'utf8');
      expect(content.includes(address), `${file} contains the address`).toBe(false);
      expect(content.includes('mailto:' + address), `${file} contains a mailto link`).toBe(false);
    }
  });

  it('keeps the CNAME file', () => {
    expect(readFileSync(join(DIST, 'CNAME'), 'utf8').trim()).toBe('joeltrauger.com');
  });
});
```

- [ ] **Step 2: Run it**

Run: `npm run build && npm run test:build`
Expected: PASS, 4 tests. If the address check fails, the bundler folded the fragments into one literal; change `email.ts` so the fragments are not statically joinable (for example, build them from a function) and re-run.

- [ ] **Step 3: Commit**

```bash
git add tests/build/dist.test.ts
git commit -m "Add build-output tests"
```

---

### Task 9: Deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run check
      - run: npm test
      - run: npm run build
      - run: npm run test:build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deploy workflow"
```

---

### Task 10: Browser verification

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: serves at `http://localhost:4321`.

- [ ] **Step 2: Check each page at desktop width**

Open `/`, `/santos`, `/vintage-story`, `/snakeoil`, `/comfyui`, `/research`, `/contact`. Confirm: content never exceeds 1024px wide; the home page shows the large terminal; every other page shows the slim terminal; the "next project" link follows the order and the last project links to Contact.

- [ ] **Step 3: Check the terminal**

On the home page type `help`, `cd snakeoil`, `HOME`, `github`, `nonsense`. Confirm: the list prints, `cd snakeoil` navigates to `/snakeoil`, the unknown input prints "not found: nonsense. try help", and clicking any menu entry also navigates.

- [ ] **Step 4: Check the contact page**

Click "Reveal email address". Confirm the address appears as a mailto link. View page source and confirm the address is absent.

- [ ] **Step 5: Check phone width and no-JavaScript**

Resize to 375px wide: no horizontal scroll, columns stack. Disable JavaScript: the terminal form is hidden, the menu links still navigate, and the contact page shows the GitHub fallback text.

- [ ] **Step 6: Report**

State which checks passed and which did not. Do not claim a check passed without having done it.

---

## Manual steps for Joel (not automated)

1. Replace every `<div class="gap">` in `src/content/projects/*.md` with the real story before the first deploy. These blocks are visibly marked on the page.
2. Create the GitHub repository, add it as `origin`, and push `main`.
3. In the repository's Settings → Pages, set Source to **GitHub Actions**, and set the custom domain to `joeltrauger.com`.
4. Point `joeltrauger.com` at GitHub Pages: `A` records for `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` on the apex domain, and a `CNAME` for `www` to `traugdor.github.io`. Enable "Enforce HTTPS" once the certificate is issued.

---

## Self-Review

**Spec coverage:** stack and `CNAME` (Task 1), routes and fixed order (Task 2 `routes.ts`), 1024px width and look (Task 4), terminal commands and no-JS fallback (Tasks 2, 5), project template with glance box and next link (Task 6), the five stories (Task 6), AI-first statement on home (Task 7), obfuscated email (Tasks 3, 7, 8), GitHub link in footer and menu (Tasks 4, 5), deploy (Task 9), tests and manual browser check (Tasks 2, 3, 8, 10). Dark mode and phone widths are in `global.css`. System fonts only, no external requests.

**Placeholders:** none in the plan. The `gap` blocks in the content files are deliberate, visible markers for story details only Joel can supply.

**Type consistency:** `Route` fields (`name`, `path`, `title`, `blurb`), `parseCommand(raw, routes, githubUrl)`, `Action` variants, `assembleAddress`, and `mailtoHref` are used consistently across tasks.
