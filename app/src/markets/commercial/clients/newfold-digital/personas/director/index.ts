import type { PersonaModule } from '@core/types';

export const directorPersona: PersonaModule = {
  id: 'newfold_director',
  identity: { name: 'Marisol Castellano', initials: 'MC', role: 'Director, Global Customer Care', greeting: 'Marisol' },
  load: () => import('./manifest'),
};
