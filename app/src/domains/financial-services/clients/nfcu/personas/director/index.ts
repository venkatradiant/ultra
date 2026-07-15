import type { PersonaModule } from '@core/types';

export const directorPersona: PersonaModule = {
  id: 'nfcu_director',
  identity: { name: 'Marcus Tillman', initials: 'MT', role: 'Director, Contact Center Operations', greeting: 'Marcus' },
  load: () => import('./manifest'),
};
