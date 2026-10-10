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
