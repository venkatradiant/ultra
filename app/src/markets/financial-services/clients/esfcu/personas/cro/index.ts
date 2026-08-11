import type { PersonaModule } from '@core/types';

export const croPersona: PersonaModule = {
  id: 'esfcu_cro',
  identity: { name: 'Renata Alvarez', initials: 'RA', role: 'Chief Risk Officer', greeting: 'Renata' },
  load: () => import('./manifest'),
};
