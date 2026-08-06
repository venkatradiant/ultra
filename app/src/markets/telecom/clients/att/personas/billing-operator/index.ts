import type { PersonaModule } from '@core/types';

/**
 * Billing Operator — "Anomaly Resolution" (spec §3, Persona A).
 *
 * Bianca is representative and illustrative; the name exists because the header
 * greets by first name and the persona switcher needs something to render.
 */
export const billingOperatorPersona: PersonaModule = {
  id: 'att_billing_operator',
  identity: {
    name: 'Bianca R.',
    initials: 'BR',
    role: 'Billing Operator — Anomaly Resolution',
    greeting: 'Bianca',
  },
  load: () => import('./manifest'),
};
