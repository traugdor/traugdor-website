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
