/**
 * Client: Newfold Digital — Cross-Brand Customer Care Intelligence.
 *
 * A CCaaS prototype for Newfold's global care operation (~7M SMB customers across
 * 80+ brands: Bluehost, Network Solutions, Web.com, HostGator, Domain.com,
 * Crazy Domains, Yoast). Genesys Cloud is the contact-center platform
 * of record; Radiant's intelligence layer connects it to Billing, Domains,
 * Hosting, Marketing, IT, and the legacy brand support systems being consolidated.
 *
 * Seven personas mirror the NFCU CCaaS build, re-skinned banking → SMB hosting.
 * Default = Marisol Castellano (Director); Sofia Reyes second.
 */
import type { ClientManifest } from '@core/types';
import { directorPersona } from './personas/director';
import { opsPersona } from './personas/ops';
import { workforcePersona } from './personas/workforce';
import { qualityPersona } from './personas/quality';
import { governancePersona } from './personas/governance';
import { memberPersona } from './personas/member';
import { agentPersona } from './personas/agent';

export const newfoldDigitalClient: ClientManifest = {
  id: 'newfold_digital',
  marketId: 'commercial',
  branding: {
    name: 'Newfold Digital',
    shortName: 'Newfold',
    nameLines: ['Newfold', 'Digital'],
    tagline: 'Customer Care Intelligence',
    logo: '/logos/newfold-icon.svg',
    favicon: '/logos/newfold-icon.svg',
    primaryColor: '#F27121',
    // Governance is intentionally NOT set here — per spec the business personas
    // have 4 pages (Ask, Workforce Intelligence, Quality Signals, Data Sources).
    // The governance persona (Arjun) adds its own Governance/Observability/
    // Inventory modules via features.navSlots + navLabels in its manifest.
    navLabels: { journey: 'Workforce Intelligence', risk: 'Quality Signals' },
  },
  personas: [
    directorPersona,
    opsPersona,
    workforcePersona,
    qualityPersona,
    governancePersona,
    memberPersona,
    agentPersona,
  ],
  defaultPersonaId: 'newfold_director',
};
