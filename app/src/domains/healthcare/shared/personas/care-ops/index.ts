import type { PersonaModule } from '@core/types';

export function makeCareOpsPersona(clientId: string): PersonaModule {
  return {
    id: 'care_ops',
    identity: { name: 'Dana W.', initials: 'DW', role: 'Care Operations', greeting: 'Dana' },
    load: () => import('./manifest').then((m) => ({ default: m.default(clientId) })),
  };
}
