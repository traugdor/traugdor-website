import { parseCommand } from '../lib/commands';
import { allRoutes, GITHUB_URL } from '../lib/routes';

/** Menu rows in the order the static menu shows them: home, every page, then GitHub. */
function menuRows(): [name: string, blurb: string][] {
  return [
    ['home', 'back to the start'],
    ...allRoutes.map((r): [string, string] => [r.name, r.blurb]),
    ['github', 'all repositories'],
  ];
}

function print(log: HTMLElement, text: string): void {
  const line = document.createElement('div');
  line.textContent = text;
  log.append(line);
  log.scrollTop = log.scrollHeight;
}

/** Prints the menu as two-column rows so a long blurb wraps inside its own column. */
function printMenu(log: HTMLElement): void {
  for (const [name, blurb] of menuRows()) {
    const row = document.createElement('div');
    row.className = 'term-row';
    const nameCell = document.createElement('span');
    nameCell.textContent = name;
    const blurbCell = document.createElement('span');
    blurbCell.textContent = blurb;
    row.append(nameCell, blurbCell);
    log.append(row);
  }
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
        printMenu(log);
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
