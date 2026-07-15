import { useState, useEffect } from 'react';
import AccessDenied from './AccessDenied';

const ACCESS_KEY = import.meta.env.VITE_POC_ACCESS_KEY || 'rdvr@9705';
const SESSION_KEY = 'poc_access_granted';

export default function AccessGate({ children }) {
  const [granted, setGranted] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });

  useEffect(() => {
    if (granted) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('access');

    if (token === ACCESS_KEY) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setGranted(true);

      // Remove ?access= from URL
      params.delete('access');
      const clean = params.toString();
      const newUrl = window.location.pathname + (clean ? `?${clean}` : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
  }, [granted]);

  if (!granted) return <AccessDenied />;

  return children;
}
