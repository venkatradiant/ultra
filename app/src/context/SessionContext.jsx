import { createContext, useContext, useState } from 'react';
import { ADMIN_ACCESS_KEY, verifyLogin } from '../config/access';
import { STORAGE_KEY as CLIENT_KEY } from '../config/clients';

/**
 * The platform gate — whether this tab has been let in at all.
 *
 * Deliberately separate from ClientContext: this answers "are you through the
 * door", ClientContext answers "which client are you looking at". Signing in
 * lands you on the picker; choosing a client is the next, separate step.
 *
 * Scope is the browser TAB (sessionStorage), for both the credential path and
 * the `?access=` bypass. A refresh keeps you in — which matters mid-demo — but
 * closing the tab does not leave the machine unlocked.
 *
 * ⚠️  Not a security boundary. See config/access.ts.
 */

const SESSION_KEY = 'ultra_session';

const SessionContext = createContext(null);

/** Drop the selected client so an unlock always lands on the picker. */
function clearStoredClient() {
  try {
    localStorage.removeItem(CLIENT_KEY);
  } catch { /* private mode — nothing to clear */ }
}

/**
 * Consume `?access=…` if present: grant for the tab, then strip the token from
 * the URL while preserving every other query param AND the hash.
 *
 * Runs in a useState initialiser rather than an effect so the very first render
 * is already unlocked — no flash of the login screen. It is idempotent, which
 * matters because StrictMode invokes it twice in development.
 */
function readInitialSession() {
  try {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') return true;
  } catch { /* storage unavailable — fall through to the URL check */ }

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('access') !== ADMIN_ACCESS_KEY) return false;

    params.delete('access');
    const query = params.toString();
    const url = window.location.pathname + (query ? `?${query}` : '') + window.location.hash;
    window.history.replaceState({}, '', url);

    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch { /* grant still holds for this render tree */ }

    // The admin key means "take me to the markets", so never resume a client
    // left over from a previous visit. This runs before ClientProvider reads
    // that key, because SessionProvider sits above it.
    clearStoredClient();
    return true;
  } catch {
    return false;
  }
}

export function SessionProvider({ children }) {
  const [isUnlocked, setIsUnlocked] = useState(readInitialSession);

  /** Returns false on a bad credential so the form can show an error. */
  function signIn(username, password) {
    if (!verifyLogin(username, password)) return false;
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch { /* the session still holds in memory */ }
    clearStoredClient();
    setIsUnlocked(true);
    return true;
  }

  /** Full sign out — the session and the selected client both go. */
  function signOut() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch { /* nothing to clear */ }
    clearStoredClient();
    setIsUnlocked(false);
  }

  return (
    <SessionContext.Provider value={{ isUnlocked, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
