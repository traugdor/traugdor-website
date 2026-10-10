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
