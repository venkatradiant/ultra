import type { PersonaModule } from '@core/types';

/**
 * General Manager, Health, Safety and Environment.
 *
 * Deliberately unnamed — the intake asked for title only. `name` carries the
 * title because the shell needs something to render in the persona switcher,
 * and `greeting` is what the briefing addresses.
 */
export const hseGmPersona: PersonaModule = {
  id: 'aramco_hse_gm',
  identity: {
    name: 'HSE General Manager',
    initials: 'GM',
    role: 'General Manager, Health, Safety and Environment',
    greeting: 'General Manager',
  },
  load: () => import('./manifest'),
};
