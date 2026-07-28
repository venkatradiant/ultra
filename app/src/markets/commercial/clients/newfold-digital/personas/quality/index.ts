import type { PersonaModule } from '@core/types';

export const qualityPersona: PersonaModule = {
  id: 'newfold_quality',
  identity: { name: 'Aisha Karim', initials: 'AK', role: 'Quality & Customer Experience Analyst', greeting: 'Aisha' },
  load: () => import('./manifest'),
};
