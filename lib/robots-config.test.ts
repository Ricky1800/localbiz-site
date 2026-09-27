import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getRobotsRules } from './robots-config';

describe('getRobotsRules', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should allow all when NEXT_PUBLIC_ALLOW_INDEXING is unset', () => {
    delete process.env.NEXT_PUBLIC_ALLOW_INDEXING;
    const rules = getRobotsRules();
    expect(rules).toEqual({ userAgent: '*', allow: '/' });
  });

  it('should disallow all when NEXT_PUBLIC_ALLOW_INDEXING is false', () => {
    process.env.NEXT_PUBLIC_ALLOW_INDEXING = 'false';
    const rules = getRobotsRules();
    expect(rules).toEqual({ userAgent: '*', disallow: '/' });
  });
});
