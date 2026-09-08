import type { PersonaModule } from '@core/types';

/**
 * Abidul — General Manager, Health, Safety and Environment.
 *
 * Named per the alliterative, role-signalling convention that makes the cast
 * memorable: a first name that alliterates with a short role tag. Abidul,
 * Fassy, Rashid, Hussain.
 *
 * `greeting` is the first name alone, because the header addresses her
 * directly — "Good morning, Abidul." Names are representative and illustrative;
 * ADNOC is a target-market example, not a customer.
 */
export const hseGmPersona: PersonaModule = {
  id: 'adnoc_hse_gm',
  identity: {
    name: 'Abidul',
    initials: 'AB',
    role: 'General Manager, Health, Safety and Environment',
    greeting: 'Abidul',
  },
  load: () => import('./manifest'),
};
