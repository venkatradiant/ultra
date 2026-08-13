/**
 * Demo access configuration — SINGLE SOURCE OF TRUTH for every gate in the app.
 *
 * ⚠️  THIS IS NOT A SECURITY BOUNDARY. This is a scripted demo platform with no
 * backend. Every credential below — the platform one AND the per-client ones —
 * ships in the client bundle, so anyone who can load the page can read them all.
 * They stop a URL being casually shared and opening straight into the demo; they
 * stop nothing else. In particular, a client credential does NOT keep that
 * client's data away from anyone else, because all of it is in the same bundle.
 * Do NOT model real authentication on this file.
 *
 * When the platform grows a real backend, this module is the one place to swap
 * for a real identity provider.
 *
 * Two scopes exist:
 *
 *  • **Platform** (`ultra`) — the door to the market and client picker. Signing
 *    in here lets you enter any client, because that is what the picker is for.
 *  • **Client** (`nfcu`, `aramco`, …) — the door to exactly one tenant, at that
 *    tenant's own URL. No picker, and no route to another client.
 *
 * The platform credential is deliberately NOT a master key for the client sign-in
 * forms: `ultra` fails at `/login/nfcu`. What you hand a client opens their
 * tenant, and what you keep opens the picker.
 */

/** The platform credential. Username is matched case-insensitively, password is not. */
export const DEMO_USERNAME = 'ultra';
export const DEMO_PASSWORD = 'ultra@9705';

/** The platform's own login slug, so `/login/ultra` has one place to come from. */
export const ULTRA_SLUG = 'ultra';

/**
 * URL query token (`?access=…`) that skips sign-in and opens the picker.
 * Overridable at build time so the key can be changed without editing source.
 */
export const ADMIN_ACCESS_KEY = import.meta.env.VITE_POC_ACCESS_KEY || 'rdvr@9705';

export interface ClientCredential {
  /** URL segment: `/login/<slug>`. Also the username. */
  slug: string;
  password: string;
}

/**
 * One credential per client, keyed by the client id in `config/clients.js`.
 *
 * Slugs are declared here rather than derived from the client id or short name.
 * They become public URLs someone will paste into an email, so they must not
 * change silently when a display name is edited — and `AT&T` does not derive
 * into anything you can put in a path.
 *
 * `access.test.ts` asserts this map covers every registered client, so adding a
 * client without a credential fails the suite instead of shipping a tenant whose
 * front door 404s.
 */
export const CLIENT_CREDENTIALS: Record<string, ClientCredential> = {
  financial_services: { slug: 'fs', password: 'fs@9705' },
  ussfcu: { slug: 'ussfcu', password: 'ussfcu@9705' },
  esfcu: { slug: 'esfcu', password: 'esfcu@9705' },
  penfed: { slug: 'penfed', password: 'penfed@9705' },
  nfcu: { slug: 'nfcu', password: 'nfcu@9705' },
  newfold_digital: { slug: 'newfold', password: 'newfold@9705' },
  aramco: { slug: 'aramco', password: 'aramco@9705' },
  att: { slug: 'att', password: 'att@9705' },
  riverside_health: { slug: 'riverside', password: 'riverside@9705' },
  doit: { slug: 'doit', password: 'doit@9705' },
};

/** Validate the platform credential. Pure — the gate's only real logic. */
export function verifyLogin(username: string, password: string): boolean {
  if (typeof username !== 'string' || typeof password !== 'string') return false;
  return username.toLowerCase().trim() === DEMO_USERNAME && password === DEMO_PASSWORD;
}

/**
 * Validate a credential against ONE client. Same shape as `verifyLogin`:
 * case-insensitive username, case-sensitive password, fails closed on anything
 * that is not a string.
 *
 * Because the check is scoped to `clientId`, NFCU's credential cannot open
 * Aramco's page and the platform credential cannot open either.
 */
export function verifyClientLogin(
  clientId: string,
  username: string,
  password: string,
): boolean {
  if (typeof username !== 'string' || typeof password !== 'string') return false;
  const cred = CLIENT_CREDENTIALS[clientId];
  if (!cred) return false;
  return username.toLowerCase().trim() === cred.slug && password === cred.password;
}

/** `/login/<slug>` → client id, or null for the platform slug and for nonsense. */
export function clientIdForSlug(slug: string): string | null {
  if (typeof slug !== 'string') return null;
  const wanted = slug.toLowerCase().trim();
  const found = Object.entries(CLIENT_CREDENTIALS).find(([, c]) => c.slug === wanted);
  return found ? found[0] : null;
}

/** Client id → its `/login/<slug>` segment, or null if the client has no gate. */
export function slugForClientId(clientId: string): string | null {
  return CLIENT_CREDENTIALS[clientId]?.slug ?? null;
}

/** The sign-in path for a client, falling back to the platform door. */
export function loginPathForClientId(clientId: string | null | undefined): string {
  const slug = clientId ? slugForClientId(clientId) : null;
  return `/login/${slug || ULTRA_SLUG}`;
}
