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
