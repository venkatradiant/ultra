import type { PersonaModule } from '@core/types';

export const directorPersona: PersonaModule = {
  id: 'amisa_director',
  identity: {
    name: 'Dr. Dereck Rhoads',
    initials: 'DR',
    role: 'Executive Director',
    greeting: 'Dereck',
  },
  load: () => import('./manifest'),
};
