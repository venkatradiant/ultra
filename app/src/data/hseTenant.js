/**
 * Resolves the HSE data module for the active Oil & Gas tenant.
 *
 * The three HSE routes (Live Site Picture, Permit and Job Detail, Muster
 * Status) used to import `data/aramco/hse-gm` directly and gate on a persona-id
 * prefix, which meant a second tenant in this market could not reach them
 * without editing every screen. This is the seam that fixes that: the screens
 * ask for the accessors, the tenant decides which fixtures back them.
 *
 * Loaded dynamically, deliberately. Each tenant's fixture set is several
 * hundred kilobytes of geometry, so a static import of both would put ADNOC's
 * site in Aramco's bundle and vice versa. The dynamic import keeps them in
 * separate chunks and only the active tenant's chunk is fetched.
 *
 * The returned object is cached per tenant so its function identities are
 * stable — `useAsyncData` re-runs whenever its getter changes identity, and a
 * fresh object every render would refetch on every render.
 */

import { usePersona } from '../context/PersonaContext';

const LOADERS = {
  aramco: () => import('./aramco/hse-gm'),
  adnoc: () => import('./adnoc/hse-gm'),
};

/** Client ids that own the HSE routes. */
export const HSE_TENANTS = new Set(Object.keys(LOADERS));

/** `aramco_hse_gm` → `aramco`. Personas in this market are prefixed by tenant. */
export function hseTenantOf(personaId) {
  const prefix = String(personaId || '').split('_')[0];
  return HSE_TENANTS.has(prefix) ? prefix : null;
}

/** Every accessor the HSE components read through. */
const ACCESSORS = [
  'getSiteData', 'getSiteGeo', 'getWorkerPositions', 'getIndoorGeo',
  'getPermits', 'getMuster', 'getActions', 'getAssets', 'getReconciliation',
  'getFlaggedJobs', 'getKpis', 'getSignals', 'getCurrentState', 'getJourney',
];

const CACHE = new Map();

/**
 * Accessors for one tenant. Falls back to Aramco — the reference demo — so a
 * hand-typed URL renders the reference build rather than an empty screen.
 */
export function hseTenant(tenantId) {
  const id = LOADERS[tenantId] ? tenantId : 'aramco';
  if (!CACHE.has(id)) {
    const load = LOADERS[id];
    const bundle = {};
    for (const name of ACCESSORS) {
      bundle[name] = () => load().then((m) => m[name]());
    }
    CACHE.set(id, bundle);
  }
  return CACHE.get(id);
}

/**
 * The active tenant's accessors, for components rendered inside a persona.
 *
 * The HSE components take an explicit `getter` prop — that is how tests and the
 * persona manifests inject data — but their DEFAULT used to be a hard import of
 * the Aramco module, which silently served Aramco's numbers to every other
 * tenant. This hook is that default instead: same seam, resolved per tenant.
 */
export function useHse() {
  const persona = usePersona();
  return hseTenant(hseTenantOf(persona?.id));
}
