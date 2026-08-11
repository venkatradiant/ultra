import { usePersona } from '../context/PersonaContext';

/**
 * `/fraud-operations` — the ESFCU CRO's queue, case triage and link graph
 * (CRO spec §12). The panels land in a later phase; this is the route and its
 * persona guard.
 *
 * The guard matters on its own: the sidebar only shows this link for the CRO,
 * but the route resolves for anyone who types the URL, and hiding a link is not
 * access control. Same pattern as `PatternResolution` for the AT&T operator.
 */
export default function FraudOperations() {
  const persona = usePersona();

  if (persona?.id !== 'esfcu_cro') {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-text-muted">This view is not available for the active persona.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-muted">Fraud Operations</h2>
      <p className="max-w-2xl text-[12px] text-text-muted">
        The re-ranked alert queue, case triage and the receiving-account link graph.
      </p>
    </div>
  );
}
