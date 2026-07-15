import type { PersonaModule } from '@core/types';

export const workforcePersona: PersonaModule = {
  id: 'nfcu_workforce',
  identity: { name: 'Janelle Moreau', initials: 'JM', role: 'Quality & Member Experience Analyst', greeting: 'Janelle' },
  load: () => import('./manifest'),
};
