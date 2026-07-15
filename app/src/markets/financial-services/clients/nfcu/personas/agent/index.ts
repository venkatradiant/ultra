import type { PersonaModule } from '@core/types';

export const agentPersona: PersonaModule = {
  id: 'nfcu_agent',
  identity: { name: 'David Torres', initials: 'DT', role: 'Contact Center Agent (Agent-Assist)', greeting: 'David' },
  load: () => import('./manifest'),
};
