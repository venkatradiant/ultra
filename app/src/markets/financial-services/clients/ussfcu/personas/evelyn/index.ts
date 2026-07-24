import type { PersonaModule } from '@core/types';

export const evelynPersona: PersonaModule = {
  id: 'ussfcu_evelyn',
  identity: { name: 'Evelyn Marsh', initials: 'EM', role: 'VP, Compliance & Public Policy', greeting: 'Evelyn' },
  load: () => import('./manifest'),
};
