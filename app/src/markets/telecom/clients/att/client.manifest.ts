/**
 * AT&T — the client for the AI Billing Workbench demo.
 *
 * AT&T-branded end to end: the official globe supplied by the client, AT&T's
 * own blues, and the Workbench as the product line underneath the mark.
 *
 * Spec §2/§12/§15 asked for carrier branding to be absent, on the grounds that
 * the demo has no named customer behind its data. That is still true of the
 * *data* — every figure is illustrative — but the demo is being taken to AT&T,
 * so the chrome is AT&T's. The mitigation moved rather than disappeared: the
 * Data Sources screen states in full that the operation modelled here is
 * representative, that no figure describes a real carrier, and that the subject
 * matter is billing errors. Read that panel before demoing.
 */
import type { ClientManifest } from '@core/types';
import { billingOperatorPersona } from './personas/billing-operator';
import { platformAdminPersona } from './personas/platform-admin';

export const attClient: ClientManifest = {
  id: 'att',
  marketId: 'telecom',
  branding: {
    name: 'AT&T',
    shortName: 'AT&T',
    nameLines: ['AT&T'],
    tagline: 'AI Billing Workbench',
    // The official globe, supplied by the client. Alpha-masked off its white
    // plate so it sits on any surface.
    logo: '/logos/att-globe.png',
    favicon: '/logos/att-globe.png',
    primaryColor: '#0568AE',
    // Journey/risk/governance are not borrowed — this client has its own
    // operator and admin routes. `dataSources` keeps its default label.
    navLabels: {
      ask: 'AI Conversation',
      patterns: 'Patterns',
      dashboard: 'Dashboard',
      history: 'Resolution History',
      adminConsole: 'Platform Administration',
      agentObservability: 'Agent Observability',
    },
  },
  // Two roles, operator first: spec §15 makes the Billing Operator path the one
  // that has to land, and the Platform Admin the layer that makes it safe.
  personas: [billingOperatorPersona, platformAdminPersona],
  defaultPersonaId: 'att_billing_operator',
};
