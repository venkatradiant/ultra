import type { PersonaModule } from '@core/types';

export const cfoPersona: PersonaModule = {
  id: 'ussfcu_cfo',
  identity: { name: 'Sylvia Reyes', initials: 'SR', role: 'Chief Financial Officer', greeting: 'Sylvia' },
  load: () => import('./manifest'),
};
