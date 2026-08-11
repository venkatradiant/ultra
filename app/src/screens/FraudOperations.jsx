import { usePersona } from '../context/PersonaContext';
import FraudOperationsView from '../components/esfcu/cro/FraudOperationsView';

/**
 * `/fraud-operations` — the ESFCU CRO's queue, case triage and link graph
 * (spec §12).
 *
 * The persona guard is not decoration. The sidebar only offers this link to the
 * CRO, but the route resolves for anyone who types the URL, and hiding a link is
 * not access control. Same pattern as `PatternResolution` for the AT&T operator.
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

  return <FraudOperationsView />;
}
