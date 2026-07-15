/**
 * Client: Financial Services — the generic (non-branded) tenant that serves as
 * the default. Exposes the shared generic personas. Branding mirrors the entry
 * that used to live in `config/clients.js`.
 */
import type { ClientManifest } from '@core/types';
import { makeOpsPersona } from '../../shared/personas/ops';
import { makeCxPersona } from '../../shared/personas/cx';
import { makeRetentionPersona } from '../../shared/personas/retention';
import { makeRiskPersona } from '../../shared/personas/risk';

const CLIENT_ID = 'financial_services';

export const financialServicesClient: ClientManifest = {
  id: 'financial_services',
  domainId: 'financial-services',
  branding: {
    name: 'Financial Services',
    shortName: 'FS',
    nameLines: ['Financial Services'],
    tagline: 'AI Platform',
    logo: '/logos/fs-logo.svg',
    favicon: '/logos/fs-logo.svg',
    primaryColor: '#003087',
    navLabels: { journey: 'Member Journey', risk: 'Risk Signals' },
  },
  personas: [
    makeOpsPersona(CLIENT_ID),
    makeCxPersona(CLIENT_ID),
    makeRetentionPersona(CLIENT_ID),
    makeRiskPersona(CLIENT_ID),
  ],
  defaultPersonaId: 'ops',
};
