/**
 * Client: Riverside Health System — the reference healthcare tenant. Demonstrates
 * that a whole new market plugs in with the same client/persona shape as finance.
 */
import type { ClientManifest } from '@core/types';
import { makeCareOpsPersona } from '../../shared/personas/care-ops';

const CLIENT_ID = 'riverside_health';

export const riversideHealthClient: ClientManifest = {
  id: CLIENT_ID,
  marketId: 'healthcare',
  branding: {
    name: 'Riverside Health System',
    shortName: 'Riverside',
    nameLines: ['Riverside', 'Health System'],
    tagline: 'Care Intelligence Platform',
    logo: '/logos/fs-logo.svg',
    favicon: '/logos/fs-logo.svg',
    primaryColor: '#0F766E',
    navLabels: { journey: 'Patient Journey', risk: 'Clinical Signals' },
  },
  personas: [makeCareOpsPersona(CLIENT_ID)],
  defaultPersonaId: 'care_ops',
};
