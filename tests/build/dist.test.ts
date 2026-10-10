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
