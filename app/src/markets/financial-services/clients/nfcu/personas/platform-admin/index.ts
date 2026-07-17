import type { PersonaModule } from '@core/types';

/** AI Governance Admin (Daniel Okonkwo) — lazily-loaded governance persona. */
export const platformAdminPersona: PersonaModule = {
  id: 'nfcu_platform_admin',
  identity: {
    name: 'Daniel Okonkwo',
    initials: 'DO',
    role: 'AI Governance Admin, LLMOps',
    greeting: 'Daniel',
  },
  load: () => import('./manifest'),
};
