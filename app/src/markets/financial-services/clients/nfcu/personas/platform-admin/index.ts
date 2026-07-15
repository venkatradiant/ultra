import type { PersonaModule } from '@core/types';

/** Platform Administrator (Rama Kandarpa) — lazily-loaded governance persona. */
export const platformAdminPersona: PersonaModule = {
  id: 'nfcu_platform_admin',
  identity: {
    name: 'Rama Kandarpa',
    initials: 'RK',
    role: 'Platform Administrator, AI Governance & LLMOps',
    greeting: 'Rama',
  },
  load: () => import('./manifest'),
};
