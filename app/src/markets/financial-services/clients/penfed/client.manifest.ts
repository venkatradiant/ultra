/**
 * Client: Pentagon Federal Credit Union (PenFed).
 *
 * Reuses the shared generic personas (bound to this client's id, so they pick up
 * PenFed's flow overrides) and adds the PenFed-only capmarkets persona.
 */
import type { ClientManifest } from '@core/types';
import { makeOpsPersona } from '../../shared/personas/ops';
import { makeCxPersona } from '../../shared/personas/cx';
import { makeRetentionPersona } from '../../shared/personas/retention';
import { makeRiskPersona } from '../../shared/personas/risk';
import { capmarketsPersona } from './personas/capmarkets';

const CLIENT_ID = 'penfed';

export const penfedClient: ClientManifest = {
  id: CLIENT_ID,
  marketId: 'financial-services',
  branding: {
    name: 'Pentagon Federal Credit Union',
    shortName: 'PenFed',
    nameLines: ['Pentagon Federal', 'Credit Union'],
    tagline: 'AI Platform',
    logo: '/logos/penfed-logo.svg',
    favicon: '/logos/penfed-logo.svg',
    primaryColor: '#003087',
    navLabels: { journey: 'Member Journey', risk: 'Risk Signals' },
  },
  personas: [
    makeOpsPersona(CLIENT_ID),
    makeCxPersona(CLIENT_ID),
    makeRetentionPersona(CLIENT_ID),
    makeRiskPersona(CLIENT_ID),
    capmarketsPersona,
  ],
  defaultPersonaId: 'ops',
};
