import type { PersonaModule } from '@core/types';

/**
 * Gina "GM" — General Manager, Health, Safety and Environment.
 *
 * Named per the alliterative, role-signalling convention that makes the cast
 * memorable: a first name that alliterates with a short role tag. Gina "GM",
 * Sally "Shift Super", Penny "Permit", Connor "Complex".
 *
 * `greeting` is the first name alone, because the header addresses her
 * directly — "Good morning, Gina." Names are representative and illustrative;
 * Aramco is a target-market example, not a customer.
 */
export const hseGmPersona: PersonaModule = {
  id: 'aramco_hse_gm',
  identity: {
    name: 'Gina "GM"',
    initials: 'GM',
    role: 'General Manager, Health, Safety and Environment',
    greeting: 'Gina',
  },
  load: () => import('./manifest'),
};
