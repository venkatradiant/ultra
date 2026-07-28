import type { PersonaModule } from '@core/types';

export const workforcePersona: PersonaModule = {
  id: 'newfold_workforce',
  identity: { name: 'Tomas Herrera', initials: 'TH', role: 'Workforce Planning Analyst', greeting: 'Tomas' },
  load: () => import('./manifest'),
};
