import type { PersonaModule } from '@core/types';

export const analystPersona: PersonaModule = {
  id: 'nfcu_analyst',
  identity: { name: 'Derek Whitfield', initials: 'DW', role: 'Workforce Planning Analyst', greeting: 'Derek' },
  load: () => import('./manifest'),
};
