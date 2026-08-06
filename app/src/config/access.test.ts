import { describe, it, expect } from 'vitest';
import {
  verifyLogin,
  verifyClientLogin,
  clientIdForSlug,
  slugForClientId,
  loginPathForClientId,
  CLIENT_CREDENTIALS,
  ADMIN_ACCESS_KEY,
  DEMO_USERNAME,
  DEMO_PASSWORD,
  ULTRA_SLUG,
} from './access';
import { CLIENTS } from './clients';

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

// `clients.js` is untyped JS, so TS infers a literal object with no index
// signature. The test iterates it by key, which is exactly what a
// registry-completeness check has to do.
const CLIENT_REGISTRY = CLIENTS as Record<string, { loginSlug: string }>;
const CLIENT_IDS = Object.keys(CLIENT_REGISTRY);

/**
 * The registry-completeness checks. Everything else here is behaviour; these
 * two are structural, and they are the ones that catch the mistake nobody makes
 * deliberately — registering a client and forgetting its front door, or giving
 * two clients the same URL.
 */
describe('CLIENT_CREDENTIALS covers the client registry', () => {
  it.each(CLIENT_IDS)('%s has a credential', (id) => {
    expect(CLIENT_CREDENTIALS[id]).toBeDefined();
    expect(CLIENT_CREDENTIALS[id].slug.length).toBeGreaterThan(0);
    expect(CLIENT_CREDENTIALS[id].password.length).toBeGreaterThan(0);
  });

  it('has no credential for a client that does not exist', () => {
    Object.keys(CLIENT_CREDENTIALS).forEach((id) => {
      expect(CLIENT_IDS).toContain(id);
    });
  });

  it('agrees with the loginSlug declared on each client', () => {
    CLIENT_IDS.forEach((id) => {
      expect(CLIENT_REGISTRY[id].loginSlug).toBe(CLIENT_CREDENTIALS[id].slug);
    });
  });

  it('gives every client a unique slug, and none of them the platform slug', () => {
    const slugs = CLIENT_IDS.map((id) => CLIENT_CREDENTIALS[id].slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).not.toContain(ULTRA_SLUG);
  });

  it('is URL-safe — a slug goes in a path, so it cannot carry a & or a space', () => {
    CLIENT_IDS.forEach((id) => {
      expect(CLIENT_CREDENTIALS[id].slug).toMatch(/^[a-z0-9-]+$/);
    });
  });
});

describe('verifyClientLogin', () => {
  it.each(CLIENT_IDS)('accepts %s own credential', (id) => {
    const { slug, password } = CLIENT_CREDENTIALS[id];
    expect(verifyClientLogin(id, slug, password)).toBe(true);
  });

  it('is case-insensitive on the username and tolerates surrounding space', () => {
    expect(verifyClientLogin('nfcu', '  NFCU  ', CLIENT_CREDENTIALS.nfcu.password)).toBe(true);
  });

  it('is case-sensitive on the password', () => {
    const { slug, password } = CLIENT_CREDENTIALS.nfcu;
    expect(verifyClientLogin('nfcu', slug, password.toUpperCase())).toBe(false);
  });

  // The point of per-client credentials: what you hand one client opens exactly
  // one tenant. If this ever passes, the whole scheme is decorative.
  it('rejects another client credential', () => {
    expect(verifyClientLogin('aramco', 'nfcu', CLIENT_CREDENTIALS.nfcu.password)).toBe(false);
    expect(
      verifyClientLogin('aramco', CLIENT_CREDENTIALS.aramco.slug, CLIENT_CREDENTIALS.nfcu.password),
    ).toBe(false);
  });

  it('rejects the platform credential on every client page', () => {
    CLIENT_IDS.forEach((id) => {
      expect(verifyClientLogin(id, DEMO_USERNAME, DEMO_PASSWORD)).toBe(false);
    });
  });

  it('rejects a client credential on the platform gate', () => {
    CLIENT_IDS.forEach((id) => {
      const { slug, password } = CLIENT_CREDENTIALS[id];
      expect(verifyLogin(slug, password)).toBe(false);
    });
  });

  it('fails closed on an unknown client, empty input and non-strings', () => {
    expect(verifyClientLogin('nope', 'nope', 'nope@9705')).toBe(false);
    expect(verifyClientLogin('nfcu', '', '')).toBe(false);
    expect(verifyClientLogin('nfcu', undefined as unknown as string, 'x')).toBe(false);
    expect(verifyClientLogin('nfcu', 'nfcu', null as unknown as string)).toBe(false);
  });
});

describe('slug helpers', () => {
  it('round-trips every client id through its slug', () => {
    CLIENT_IDS.forEach((id) => {
      expect(clientIdForSlug(slugForClientId(id) as string)).toBe(id);
    });
  });

  it('returns null for the platform slug and for anything unknown', () => {
    expect(clientIdForSlug(ULTRA_SLUG)).toBeNull();
    expect(clientIdForSlug('nonsense')).toBeNull();
    expect(clientIdForSlug(undefined as unknown as string)).toBeNull();
    expect(slugForClientId('nope')).toBeNull();
  });

  it('builds a login path, falling back to the platform door', () => {
    expect(loginPathForClientId('nfcu')).toBe('/login/nfcu');
    expect(loginPathForClientId('financial_services')).toBe('/login/fs');
    expect(loginPathForClientId(null)).toBe(`/login/${ULTRA_SLUG}`);
    expect(loginPathForClientId('nope')).toBe(`/login/${ULTRA_SLUG}`);
  });
});
