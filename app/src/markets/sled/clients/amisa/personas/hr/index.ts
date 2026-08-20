import type { PersonaModule } from '@core/types';

export const hrPersona: PersonaModule = {
  id: 'amisa_hr',
  identity: {
    name: 'Ana Lucía Restrepo',
    initials: 'AR',
    role: 'HR Director — member school',
    greeting: 'Ana Lucía',
  },
  load: () => import('./manifest'),
};
