import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useClient } from './ClientContext';
import { STORAGE_KEY } from '../config/clients';
import personas from '../data/personas';

const PersonaContext = createContext(null);
const PersonaListContext = createContext([]);

const SESSION_KEY = 'active_persona';

// Personas that belong to each client (non-listed clients get the generic set).
// Exported so manifests.test.ts can assert it agrees with each client manifest —
// the two registries used to drift silently.
export const CLIENT_PERSONAS = {
  nfcu: ['nfcu_supervisor', 'nfcu_analyst', 'nfcu_workforce', 'nfcu_director', 'nfcu_member', 'nfcu_agent', 'nfcu_platform_admin'],
  // PenFed: four generic personas + PenFed-only capmarkets (Sowmya Ha).
  // capmarkets is intentionally absent from every other client's allowlist so it
  // cannot be selected via dropdown or URL outside PenFed.
  penfed: ['ops', 'cx', 'retention', 'risk', 'capmarkets'],
  // USSFCU: Risk & Compliance personas first — Evelyn Marsh (VP Compliance, the
  // default) and Nadia Hassan (Compliance Analyst) — alongside the CFO (Sylvia
  // Reyes), the CEO (Timothy Anderson), and the four generic personas. The
  // ussfcu_* personas are intentionally absent from every other client's
  // allowlist so they cannot be selected outside USSFCU.
  ussfcu: ['ussfcu_evelyn', 'ussfcu_nadia', 'ussfcu_cfo', 'ussfcu_ceo', 'ops', 'cx', 'retention', 'risk'],
  // ESFCU: two executive personas — Girado Smith (CEO, funding and liquidity)
  // and Renata Alvarez (CRO, fraud and BSA). Deliberately no generic personas:
  // this tenant is two briefings that share a shell, not a persona sampler.
  // MUST stay in step with esfcuClient.personas — a registry-integrity test in
  // manifests.test.ts asserts the two agree, because registering in only one
  // gives either an invisible persona or a dropdown entry that renders blank.
  esfcu: ['esfcu_ceo', 'esfcu_cro'],
  // Healthcare market — Riverside Health System (care-ops persona).
  riverside_health: ['care_ops'],
  // Commercial market — Newfold Digital. Two CCaaS personas; Marisol (director)
  // is the default, Sofia (ops) second. The newfold_* personas are intentionally
  // absent from every other client's allowlist so they cannot be selected outside
  // Newfold.
  newfold_digital: [
    'newfold_director',
    'newfold_ops',
  ],
  // Oil & Gas market — Aramco (TrackLynk.AI). Four altitudes on one live
  // picture: complex manager (roll-up), HSE GM (the reference demo), shift
  // supervisor and permit issuer (ground level).
  aramco: ['aramco_complex_manager', 'aramco_hse_gm', 'aramco_shift_supervisor', 'aramco_permit_issuer'],
  // Telecommunications market — AT&T (AI Billing Workbench). Two roles: the
  // Billing Operator clearing a cycle (the default and the demo that has to
  // land) and the Platform Admin who sets the guardrails that make it safe.
  att: ['att_billing_operator', 'att_platform_admin'],
  // SLED market — Maryland DoIT (VOCE). Three roles: the Survey Author who
  // designs and publishes, the Administrator who queries the portfolio and
  // clears approvals, and the anonymous Resident who answers. Personas land one
  // per phase — manifests.test.ts asserts this list and doitClient.personas
  // agree in BOTH directions, so allow-listing one before it is built fails the
  // suite rather than rendering blank.
  doit: ['doit_author', 'doit_admin'],
};

// Default (primary) persona per client
const CLIENT_DEFAULT_PERSONA = {
  nfcu: 'nfcu_supervisor',
  ussfcu: 'ussfcu_evelyn',
  esfcu: 'esfcu_ceo',
  riverside_health: 'care_ops',
  newfold_digital: 'newfold_director',
  aramco: 'aramco_hse_gm',
  att: 'att_billing_operator',
  doit: 'doit_author',
};

const GENERIC_PERSONAS = ['ops', 'cx', 'retention', 'risk'];
const GENERIC_DEFAULT = 'ops';

function getClientIdFromStorage() {
  // Reads the same `selected_client` key ClientContext and BrandingContext use.
  // Needed because the initial persona is resolved in a useState initialiser,
  // where hooks are not available yet.
  try {
    return localStorage.getItem(STORAGE_KEY);
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
  const { clientId } = useClient();

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
