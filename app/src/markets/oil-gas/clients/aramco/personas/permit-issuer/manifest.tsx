/**
 * Persona: Permit Issuing Authority — Aramco (illustrative).
 *
 * The altitude where the permit book's two structural blind spots become
 * visible: a permit that reads closed while the work continues, and a valid
 * permit whose crew has walked into a zone it does not authorize. Neither
 * changes the permit record, so neither can be found by reading permits.
 *
 * No muster slot — accounting for people is not this role's job.
 */
import { FileText, FilePlus2, Timer, AlertTriangle, ShieldAlert, Clock, TrendingDown, Flame } from 'lucide-react';
import type { ComponentType } from 'react';
import type { PersonaManifest, StatTile } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/aramco/permit-issuer/signals.json';
import dataSources from '@/data/aramco/_shared/dataSources.json';
import capabilityCallouts from '@/data/aramco/permit-issuer/capabilityCallouts.json';
import kpis from '@/data/aramco/permit-issuer/kpis.json';

import FlaggedJobsTable from '@/components/aramco/FlaggedJobsTable';
import PermitDetailCard from '@/components/aramco/PermitDetailCard';
import SiteMap from '@/components/aramco/SiteMap';
import CurrentStateDiagram from '@/components/process/CurrentStateDiagram';
import { getCurrentState } from '@/data/aramco/hse-gm';

const flows = (getPersonaFlowConfigs('aramco') as unknown as Record<string, PersonaManifest['flows']>)
  .aramco_permit_issuer;

const KPI_PRESENTATION: Record<string, { icon: ComponentType<Record<string, unknown>>; iconColor: string; iconBg: string }> = {
  open_permits: { icon: FileText, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10' },
  issued_today: { icon: FilePlus2, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
  expiring: { icon: Timer, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  lapsed_occupied: { icon: AlertTriangle, iconColor: 'text-rose-700', iconBg: 'bg-rose-700/10' },
  scope_breach: { icon: ShieldAlert, iconColor: 'text-rose-700', iconBg: 'bg-rose-700/10' },
  awaiting_verification: { icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  late_close_rate: { icon: TrendingDown, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  high_risk_open: { icon: Flame, iconColor: 'text-rose-700', iconBg: 'bg-rose-700/10' },
};

const stats: StatTile[] = (kpis as Array<Record<string, unknown>>).map((k) => ({
  id: k.id as string,
  label: k.label as string,
  value: k.value as string,
  trend: k.trend as string,
  positive: k.positive as boolean,
  chipText: (k.chipText as string | null) ?? null,
  ...KPI_PRESENTATION[k.id as string],
}));

const manifest: PersonaManifest = {
  id: 'aramco_permit_issuer',
  clientId: 'aramco',
  marketId: 'oil_gas',

  identity: {
    name: 'Permit Issuer',
    initials: 'PI',
    role: 'Permit Issuing Authority, Turnaround',
    greeting: 'Permit Issuer',
  },
  capabilities: [
    'Proactive Intelligence',
    'Anomaly Detection',
    'Predictive Intelligence',
    'Friction Observability',
    'Automated Action',
    'Converged Conversation',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',

  features: {
    // No muster — accounting for people is not this role's job.
    navSlots: ['ask', 'permits', 'liveSite', 'dataSources'],
    // These answers render site plans, roll-up tables and process rails. At the
    // default 3xl measure they scroll horizontally inside a column that has
    // ~400px of unused space either side of it.
    wideInlineComponents: true,
    topAlignedInitial: true,
  },

  ui: {
    greetingFlowKey: 'aramco_iss_greeting',
    contentMaxWidth: 'max-w-6xl',
    inputPlaceholder: 'Ask anything about permits, conditions, expiries, or verification…',
    initialChips: [
      'Show me the permits that lapsed with workers still on location',
      'Which permits expire in the next hour?',
      'Show me the general permit in the confined-space zone',
      'Where is my issue-to-verify time going?',
      'Why did the night shift not log an extension?',
    ],
    goldenPathChip: {
      aramco_iss_greeting: 'Show me the permits that lapsed with workers still on location',
      aramco_iss_lapsed: 'Issue an extension with fresh conditions',
      aramco_iss_extension: 'Show me the general permit in the confined-space zone',
      aramco_iss_general_permit: 'Notify the crew and the supervisor',
      aramco_iss_notify: 'Where is my issue-to-verify time going?',
      aramco_iss_expiring: 'Issue an extension with fresh conditions',
      aramco_iss_night_shift: 'Where is my issue-to-verify time going?',
      aramco_iss_cycle_time: 'Which permits expire in the next hour?',
    },
    flowKeyToCapabilityTrigger: {
      aramco_iss_greeting: 'home_load',
      aramco_iss_lapsed: 'ask_turn_1',
      aramco_iss_general_permit: 'ask_turn_1',
      aramco_iss_expiring: 'ask_turn_2',
      aramco_iss_night_shift: 'ask_turn_3',
      aramco_iss_cycle_time: 'ask_turn_3',
      aramco_iss_extension: 'ask_turn_4',
      aramco_iss_notify: 'ask_turn_4',
    },
    stats,
    signalToChip: {
      'SIG-ARAMCO-ISS-001': 'Show me the permits that lapsed with workers still on location',
      'SIG-ARAMCO-ISS-002': 'Show me the general permit in the confined-space zone',
      'SIG-ARAMCO-ISS-003': 'Why did the night shift not log an extension?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey as string | undefined;

    if (k === 'aramco_iss_greeting' || k === 'aramco_iss_expiring') out.push(<SiteMap key="site-map" />);
    if (k === 'aramco_iss_lapsed' || k === 'aramco_iss_general_permit' || k === 'aramco_iss_notify' || k === 'aramco_iss_extension') {
      out.push(<FlaggedJobsTable key="flagged" />);
    }
    if (k === 'aramco_iss_expiring') out.push(<PermitDetailCard key="permit" compact />);
    if (k === 'aramco_iss_night_shift' || k === 'aramco_iss_cycle_time') {
      out.push(<CurrentStateDiagram key="current-state" getter={getCurrentState} productName="TrackLynk.AI" />);
    }

    return out.length ? out : undefined;
  },
};

export default manifest;
