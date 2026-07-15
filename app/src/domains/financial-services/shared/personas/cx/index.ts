import type { PersonaModule } from '@core/types';

export function makeCxPersona(clientId: string): PersonaModule {
  return {
    id: 'cx',
    identity: { name: 'Priya K.', initials: 'PK', role: 'CX Transformation', greeting: 'Priya' },
    load: () => import('./manifest').then((m) => ({ default: m.default(clientId) })),
  };
}
