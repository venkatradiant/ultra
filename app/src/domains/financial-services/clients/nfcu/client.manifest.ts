/**
 * Client: Navy Federal Credit Union (NFCU) — Workforce AI Platform.
 *
 * All six personas are migrated. Supervisor + director use the manifest
 * `briefing` machinery (intraday dashboard, briefing panel, root-cause tree);
 * the Sticky Intelligence Widget continues to render from AppShell.
 */
import type { ClientManifest } from '@core/types';
import { supervisorPersona } from './personas/supervisor';
import { directorPersona } from './personas/director';
import { analystPersona } from './personas/analyst';
import { workforcePersona } from './personas/workforce';
import { memberPersona } from './personas/member';
import { agentPersona } from './personas/agent';

export const nfcuClient: ClientManifest = {
  id: 'nfcu',
  domainId: 'financial-services',
  branding: {
    name: 'Navy Federal Credit Union',
    shortName: 'NFCU',
    nameLines: ['Navy Federal', 'Credit Union'],
    tagline: 'Workforce AI Platform',
    logo: '/logos/nfcu-logo.svg',
    favicon: '/logos/nfcu-logo.svg',
    primaryColor: '#003087',
    navLabels: { journey: 'Workforce Intelligence', risk: 'Quality Signals', governance: 'Model Governance' },
  },
  personas: [supervisorPersona, directorPersona, analystPersona, workforcePersona, memberPersona, agentPersona],
  defaultPersonaId: 'nfcu_supervisor',
};
