/**
 * Demo access configuration — SINGLE SOURCE OF TRUTH for the demo's mock auth.
 *
 * ⚠️  THIS IS NOT A SECURITY BOUNDARY. This is a scripted demo platform. These
 * credentials live in the client bundle by design so the demo can be handed to
 * prospects without a backend. Do NOT model real authentication on this file.
 *
 * When the platform grows a real backend, this module is the one place to swap
 * for a real identity provider.
 */

export interface DemoCredential {
  /** Password entered on the login screen (matched case-sensitively). */
  password: string;
  /** Client/tenant id this credential unlocks. Must exist in the client registry. */
  clientId: string;
}

/** username (lowercased) → credential */
export const DEMO_CREDENTIALS: Record<string, DemoCredential> = {
  financialservices: { password: 'financialservices@9705', clientId: 'financial_services' },
  ussfcu: { password: 'ussfcu@9705', clientId: 'ussfcu' },
  penfed: { password: 'penfed@9705', clientId: 'penfed' },
  nfcu: { password: 'nfcu@9705', clientId: 'nfcu' },
  riverside: { password: 'riverside@9705', clientId: 'riverside_health' },
};

/**
 * URL query token (`?access=…`) that unlocks the admin client-picker without a
 * username/password. Never persisted — see the resolver in the app root.
 */
export const ADMIN_ACCESS_KEY = 'rdvr@9705';

/** Validate a username/password pair. Returns the matched credential or null. */
export function verifyDemoLogin(username: string, password: string): DemoCredential | null {
  const cred = DEMO_CREDENTIALS[username.toLowerCase().trim()];
  return cred && cred.password === password ? cred : null;
}
