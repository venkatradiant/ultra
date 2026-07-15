/**
 * Lazy entry factory for the ops persona, bound to a specific client. The
 * registry stores this module; the manifest (with client-resolved flows) is
 * imported only when ops becomes active → per-persona code-splitting.
 */
import type { PersonaModule } from '@core/types';

export function makeOpsPersona(clientId: string): PersonaModule {
  return {
    id: 'ops',
    identity: { name: 'Maya J.', initials: 'MJ', role: 'Operations & Analytics', greeting: 'Maya' },
    load: () => import('./manifest').then((m) => ({ default: m.default(clientId) })),
  };
}
