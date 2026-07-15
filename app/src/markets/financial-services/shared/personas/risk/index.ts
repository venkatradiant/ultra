import type { PersonaModule } from '@core/types';

export function makeRiskPersona(clientId: string): PersonaModule {
  return {
    id: 'risk',
    identity: { name: 'James R.', initials: 'JR', role: 'Risk & Fraud', greeting: 'James' },
    load: () => import('./manifest').then((m) => ({ default: m.default(clientId) })),
  };
}
