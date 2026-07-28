import type { PersonaModule } from '@core/types';

export const agentPersona: PersonaModule = {
  id: 'newfold_agent',
  identity: { name: 'Jordan Ellis', initials: 'JE', role: 'Support Agent, Agent-Assist', greeting: 'Jordan' },
  load: () => import('./manifest'),
};
