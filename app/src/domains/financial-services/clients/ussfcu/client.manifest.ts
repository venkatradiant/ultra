/**
 * Client: United States Senate Federal Credit Union (USSFCU).
 *
 * Exposes the USSFCU-only executive personas (CFO default, CEO) plus the shared
 * generic personas (base flows — USSFCU has no generic flow overrides).
 */
import type { ClientManifest } from '@core/types';
import { makeOpsPersona } from '../../shared/personas/ops';
import { makeCxPersona } from '../../shared/personas/cx';
import { makeRetentionPersona } from '../../shared/personas/retention';
import { makeRiskPersona } from '../../shared/personas/risk';
import { cfoPersona } from './personas/cfo';
import { ceoPersona } from './personas/ceo';

const CLIENT_ID = 'ussfcu';

export const ussfcuClient: ClientManifest = {
  id: CLIENT_ID,
  domainId: 'financial-services',
  branding: {
    name: 'United States Senate Federal Credit Union',
    shortName: 'USSFCU',
    nameLines: ['United States Senate', 'Federal Credit Union'],
    tagline: 'AI Platform',
    logo: '/ussfcu-seal.png',
    favicon: '/ussfcu-seal.png',
    primaryColor: '#003087',
    navLabels: { journey: 'Member Journey', risk: 'Risk Signals' },
  },
  personas: [
    cfoPersona,
    ceoPersona,
    makeOpsPersona(CLIENT_ID),
    makeCxPersona(CLIENT_ID),
    makeRetentionPersona(CLIENT_ID),
    makeRiskPersona(CLIENT_ID),
  ],
  defaultPersonaId: 'ussfcu_cfo',
};
