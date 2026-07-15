import { createContext, useContext, useState } from 'react';
import { STORAGE_KEY, CLIENTS } from '../config/clients';
import { verifyDemoLogin } from '../config/access';

const AUTH_KEY = 'auth_state';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Standard credential login
  function login(username, password) {
    const cred = verifyDemoLogin(username, password);
    if (!cred) return false;

    const authState = { username: username.toLowerCase().trim(), clientId: cred.clientId, mode: 'credentials' };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
    localStorage.setItem(STORAGE_KEY, cred.clientId);
    setAuth(authState);
    return true;
  }

  // Admin path: select client directly without credentials
  function adminSelectClient(clientId) {
    if (!CLIENTS[clientId]) return;
    const authState = { username: '__admin__', clientId, mode: 'admin' };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
    localStorage.setItem(STORAGE_KEY, clientId);
    setAuth(authState);
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!auth, auth, login, adminSelectClient, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
