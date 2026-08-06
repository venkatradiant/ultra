import { createContext, useContext, useState } from 'react';
import { ADMIN_ACCESS_KEY, verifyLogin, verifyClientLogin } from '../config/access';
import { STORAGE_KEY as CLIENT_KEY } from '../config/clients';

/**
 * The gate — whether this tab has been let in, and *as what*.
 *
 * The session carries a **scope**, not a boolean:
 *
 *   'ultra'      signed in at the platform door. Gets the market picker and can
 *                enter any client through it.
 *   '<clientId>' signed in at one client's own door. Is that client. No picker,
 *                and no route to a different tenant.
 *   null         locked.
 *
 * The scope is deliberately authoritative over `selected_client` in
 * localStorage. That key used to be the only record of which tenant you were
 * in, which meant editing it in devtools switched tenant — fine when one
 * credential opened everything, not fine now that a client is handed a link
 * that is supposed to open exactly their own. ClientContext reconciles against
 * this value; see the note there.
 *
 * Scope is per browser TAB (sessionStorage), for both the credential path and
 * the `?access=` bypass. A refresh keeps you in — which matters mid-demo — but
 * closing the tab does not leave the machine unlocked.
 *
 * ⚠️  Not a security boundary. See config/access.ts.
 */

const SESSION_KEY = 'ultra_session';
export const ULTRA_SCOPE = 'ultra';

/**
 * The last tenant this browser was in, kept deliberately across sign-out.
 *
 * `selected_client` cannot answer "whose door should I show" — signing out
 * clears it, which is correct (you are not in that client any more) and useless
 * (the very next thing we need is which client's sign-in page to render). This
 * key is that memory and nothing else: it grants no access, it only decides
 * which of nine doors a locked visitor is looking at.
 */
const LAST_CLIENT_KEY = 'ultra_last_client';

const SessionContext = createContext(null);

/** Drop the selected client so an unlock always lands on the picker. */
function clearStoredClient() {
  try {
    localStorage.removeItem(CLIENT_KEY);
  } catch { /* private mode — nothing to clear */ }
}

/** Remember the tenant for the next locked visit. Survives sign-out. */
export function rememberLastClient(clientId) {
  try {
    if (clientId) localStorage.setItem(LAST_CLIENT_KEY, clientId);
  } catch { /* private mode — the redirect falls back to the platform door */ }
}

export function readLastClient() {
  try {
    return localStorage.getItem(LAST_CLIENT_KEY);
  } catch {
    return null;
  }
}

function writeScope(scope) {
  try {
    sessionStorage.setItem(SESSION_KEY, scope);
  } catch { /* the session still holds in memory */ }
}

/**
 * Consume `?access=…` if present: grant platform scope for the tab, then strip
 * the token from the URL while preserving every other query param AND the hash.
 *
 * Runs in a useState initialiser rather than an effect so the very first render
 * is already unlocked — no flash of the login screen. It is idempotent, which
 * matters because StrictMode invokes it twice in development.
 */
function readInitialScope() {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    // 'true' is the pre-scope format. Reading it as platform scope means a tab
    // that was open across the deploy stays signed in rather than being thrown
    // out mid-demo.
    if (stored === 'true') return ULTRA_SCOPE;
    if (stored) return stored;
  } catch { /* storage unavailable — fall through to the URL check */ }

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('access') !== ADMIN_ACCESS_KEY) return null;

    params.delete('access');
    const query = params.toString();
    const url = window.location.pathname + (query ? `?${query}` : '') + window.location.hash;
    window.history.replaceState({}, '', url);

    writeScope(ULTRA_SCOPE);

    // The admin key means "take me to the markets", so never resume a client
    // left over from a previous visit. This runs before ClientProvider reads
    // that key, because SessionProvider sits above it.
    clearStoredClient();
    return ULTRA_SCOPE;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }) {
  const [scope, setScope] = useState(readInitialScope);

  /** Platform door. Returns false on a bad credential so the form can show an error. */
  function signInAsUltra(username, password) {
    if (!verifyLogin(username, password)) return false;
    writeScope(ULTRA_SCOPE);
    clearStoredClient();
    setScope(ULTRA_SCOPE);
    return true;
  }

  /**
   * A client's own door. Scoped to that client, so the credential handed to
   * NFCU cannot be typed into Aramco's page — `verifyClientLogin` checks
   * against one client, not against all of them.
   */
  function signInAsClient(clientId, username, password) {
    if (!verifyClientLogin(clientId, username, password)) return false;
    writeScope(clientId);
    try {
      localStorage.setItem(CLIENT_KEY, clientId);
    } catch { /* private mode — the scope still carries the client */ }
    rememberLastClient(clientId);
    setScope(clientId);
    return true;
  }

  /** Full sign out — the scope and the selected client both go. */
  function signOut() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch { /* nothing to clear */ }
    clearStoredClient();
    setScope(null);
  }

  return (
    <SessionContext.Provider
      value={{
        scope,
        isUnlocked: scope !== null,
        isPlatformScope: scope === ULTRA_SCOPE,
        /** The client this session is locked to, or null under platform scope. */
        scopedClientId: scope && scope !== ULTRA_SCOPE ? scope : null,
        signInAsUltra,
        signInAsClient,
        signOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
