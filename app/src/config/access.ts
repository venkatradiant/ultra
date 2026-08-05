/**
 * Demo access configuration — SINGLE SOURCE OF TRUTH for the platform gate.
 *
 * ⚠️  THIS IS NOT A SECURITY BOUNDARY. This is a scripted demo platform with no
 * backend. The credential below ships in the client bundle, so anyone who can
 * load the page can read it. It stops a URL being casually shared and opening
 * straight into the demo; it stops nothing else. Do NOT model real
 * authentication on this file.
 *
 * When the platform grows a real backend, this module is the one place to swap
 * for a real identity provider.
 *
 * Note the scope: this gates the *platform* — you sign in to reach the market
 * and client picker. It does not select a client. That used to be one
 * credential per tenant; it is now a single parent gate.
 */

/** The one demo credential. Username is matched case-insensitively, password is not. */
export const DEMO_USERNAME = 'ultra';
export const DEMO_PASSWORD = 'ultra@9705';

/**
 * URL query token (`?access=…`) that skips sign-in and opens the picker.
 * Overridable at build time so the key can be changed without editing source.
 */
export const ADMIN_ACCESS_KEY = import.meta.env.VITE_POC_ACCESS_KEY || 'rdvr@9705';

/** Validate a username/password pair. Pure — the gate's only real logic. */
export function verifyLogin(username: string, password: string): boolean {
  if (typeof username !== 'string' || typeof password !== 'string') return false;
  return username.toLowerCase().trim() === DEMO_USERNAME && password === DEMO_PASSWORD;
}
