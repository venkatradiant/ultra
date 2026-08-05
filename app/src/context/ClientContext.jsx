import { createContext, useContext, useState } from 'react';
import { CLIENTS, STORAGE_KEY } from '../config/clients';

/**
 * Which client the app is currently showing.
 *
 * This replaces the old AuthContext. The platform is a demo prototype with no
 * backend and no real accounts, so the previous username/password screen was
 * theatre in front of a client picker — it gated nothing and its credentials
 * shipped in the client bundle. Selecting a client IS the entry step now.
 *
 * `selected_client` is the single source of truth, shared with BrandingContext,
 * so there is no second copy of the client id to drift out of sync.
 */

const ClientContext = createContext(null);

export function ClientProvider({ children }) {
  const [clientId, setClientId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && CLIENTS[saved] ? saved : null;
    } catch {
      return null;
    }
  });

  /** Enter the app as a client. Unknown ids are ignored rather than crashing. */
  function selectClient(id) {
    if (!CLIENTS[id]) return;
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch { /* private mode — the session still works, it just won't persist */ }
    setClientId(id);
  }

  /** Return to the client picker. */
  function clearClient() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* nothing to clear */ }
    setClientId(null);
  }

  return (
    <ClientContext.Provider value={{ clientId, hasClient: !!clientId, selectClient, clearClient }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  return useContext(ClientContext);
}
