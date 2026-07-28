import type { PersonaModule } from '@core/types';

export const governancePersona: PersonaModule = {
  id: 'newfold_governance',
  identity: { name: 'Arjun Nair', initials: 'AN', role: 'AI Governance Admin, LLMOps', greeting: 'Arjun' },
  load: () => import('./manifest'),
};
