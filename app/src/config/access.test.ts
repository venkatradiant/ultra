import { describe, it, expect } from 'vitest';
import { verifyLogin, ADMIN_ACCESS_KEY, DEMO_USERNAME, DEMO_PASSWORD } from './access';

/**
 * `verifyLogin` is the gate's only real logic, and it is pure — so it is the
 * one part worth testing. The gate itself (SessionContext + App's branching)
 * would need a jsdom/React setup this repo does not have.
 */
describe('verifyLogin', () => {
  it('accepts the demo credential', () => {
    expect(verifyLogin(DEMO_USERNAME, DEMO_PASSWORD)).toBe(true);
  });

  it('is case-insensitive on the username and tolerates surrounding space', () => {
    expect(verifyLogin('  ULTRA  ', DEMO_PASSWORD)).toBe(true);
  });

  it('is case-sensitive on the password', () => {
    expect(verifyLogin(DEMO_USERNAME, DEMO_PASSWORD.toUpperCase())).toBe(false);
  });

  it('rejects a wrong password, a wrong user, and empty input', () => {
    expect(verifyLogin(DEMO_USERNAME, 'wrong')).toBe(false);
    expect(verifyLogin('nfcu', DEMO_PASSWORD)).toBe(false);
    expect(verifyLogin('', '')).toBe(false);
  });

  it('does not throw on non-string input', () => {
    // Inputs come from form state, but a stale caller passing undefined should
    // fail closed rather than crash the gate.
    expect(verifyLogin(undefined as unknown as string, DEMO_PASSWORD)).toBe(false);
    expect(verifyLogin(DEMO_USERNAME, null as unknown as string)).toBe(false);
  });
});

describe('ADMIN_ACCESS_KEY', () => {
  it('is a non-empty token', () => {
    expect(typeof ADMIN_ACCESS_KEY).toBe('string');
    expect(ADMIN_ACCESS_KEY.length).toBeGreaterThan(0);
  });
});
