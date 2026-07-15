import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import personas from '../data/personas';

const PersonaContext = createContext(null);
const PersonaListContext = createContext([]);

const SESSION_KEY = 'active_persona';

// Personas that belong to each client (non-listed clients get the generic set)
const CLIENT_PERSONAS = {
  nfcu: ['nfcu_supervisor', 'nfcu_analyst', 'nfcu_workforce', 'nfcu_director', 'nfcu_member', 'nfcu_agent'],
  // PenFed: four generic personas + PenFed-only capmarkets (Sowmya Ha).
  // capmarkets is intentionally absent from every other client's allowlist so it
  // cannot be selected via dropdown or URL outside PenFed.
  penfed: ['ops', 'cx', 'retention', 'risk', 'capmarkets'],
  // USSFCU: USSFCU-only CFO persona (Sylvia Reyes) listed first as the default,
  // alongside the pure-executive CEO persona (Timothy Anderson) and the four
  // generic personas. ussfcu_cfo and ussfcu_ceo are intentionally absent from
  // every other client's allowlist so they cannot be selected outside USSFCU.
  ussfcu: ['ussfcu_cfo', 'ussfcu_ceo', 'ops', 'cx', 'retention', 'risk'],
  // Healthcare domain — Riverside Health System (care-ops persona).
  riverside_health: ['care_ops'],
};

// Default (primary) persona per client
const CLIENT_DEFAULT_PERSONA = {
  nfcu: 'nfcu_supervisor',
  ussfcu: 'ussfcu_cfo',
  riverside_health: 'care_ops',
};

const GENERIC_PERSONAS = ['ops', 'cx', 'retention', 'risk'];
const GENERIC_DEFAULT = 'ops';

function getClientIdFromStorage() {
  try {
    const auth = JSON.parse(localStorage.getItem('auth_state') || 'null');
    return auth?.clientId || null;
  } catch {
    return null;
  }
}

function getAllowedIds(clientId) {
  return CLIENT_PERSONAS[clientId] || GENERIC_PERSONAS;
}

function getDefaultId(clientId) {
  return CLIENT_DEFAULT_PERSONA[clientId] || GENERIC_DEFAULT;
}

export function PersonaProvider({ children }) {
  const location = useLocation();
  const { auth } = useAuth();
  const clientId = auth?.clientId || null;

  const allowedIds = useMemo(() => getAllowedIds(clientId), [clientId]);
  const defaultId = useMemo(() => getDefaultId(clientId), [clientId]);

  const [persona, setPersona] = useState(() => {
    // Lazy init: read clientId directly from storage (hooks not available here)
    const cId = getClientIdFromStorage();
    const allowed = getAllowedIds(cId);
    const defId = getDefaultId(cId);

    const params = new URLSearchParams(window.location.search);
    const urlPersona = params.get('persona');
    if (urlPersona && personas[urlPersona] && allowed.includes(urlPersona)) {
      sessionStorage.setItem(SESSION_KEY, urlPersona);
      return personas[urlPersona];
    }
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored && personas[stored] && allowed.includes(stored)) {
      return personas[stored];
    }
    return personas[defId] || personas.ops;
  });

  // When client switches, reset to client-default if current persona is not allowed
  useEffect(() => {
    if (!allowedIds.includes(persona.id)) {
      const next = personas[defaultId] || personas.ops;
      sessionStorage.setItem(SESSION_KEY, next.id);
      setPersona(next);
    }
  }, [clientId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Expose active persona id for DemoRunner
  useEffect(() => {
    window.__activePersona = persona.id;
    return () => { window.__activePersona = null; };
  }, [persona]);

  // React to URL ?persona= changes (persona switcher navigation)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlPersona = params.get('persona');
    if (
      urlPersona &&
      personas[urlPersona] &&
      allowedIds.includes(urlPersona) &&
      urlPersona !== persona.id
    ) {
      sessionStorage.setItem(SESSION_KEY, urlPersona);
      setPersona(personas[urlPersona]);
    }
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const allowedPersonas = useMemo(
    () => allowedIds.map((id) => personas[id]).filter(Boolean),
    [allowedIds]
  );

  return (
    <PersonaContext.Provider value={persona}>
      <PersonaListContext.Provider value={allowedPersonas}>
        {children}
      </PersonaListContext.Provider>
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error('usePersona must be used within PersonaProvider');
  return ctx;
}

export function usePersonaList() {
  return useContext(PersonaListContext);
}
