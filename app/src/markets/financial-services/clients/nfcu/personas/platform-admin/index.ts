import type { PersonaModule } from '@core/types';

/** Platform Administrator (Daniel Okonkwo) — lazily-loaded governance persona. */
export const platformAdminPersona: PersonaModule = {
  id: 'nfcu_platform_admin',
  identity: {
    name: 'Daniel Okonkwo',
    initials: 'DO',
    role: 'Platform Administrator, AI Governance & LLMOps',
    greeting: 'Daniel',
  },
  load: () => import('./manifest'),
};
