/**
 * Persona: Complex Manager (site VP) — Aramco (illustrative).
 *
 * The highest altitude, and the one the specification names as the proof that
 * this is a platform rather than a screen: the same live permit-and-location
 * data the HSE GM, permit issuers and shift supervisors work from, rolled up
 * across units and filtered to the decisions a site VP actually owns —
 * schedule versus safety, the surge, and the figures that leave the site for
 * the regulator and the board's safety committee.
 *
 * No permit-detail slot: drilling into a single confined-space entry is not
 * this altitude's job.
 */
import { Users, AlertTriangle, Activity, CalendarClock, Timer, TrendingUp, ClipboardList, FileCheck2 } from 'lucide-react';
import type { ComponentType } from 'react';
import type { PersonaManifest, StatTile } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/aramco/complex-manager/signals.json';
import dataSources from '@/data/aramco/_shared/dataSources.json';
import capabilityCallouts from '@/data/aramco/complex-manager/capabilityCallouts.json';
import kpis from '@/data/aramco/complex-manager/kpis.json';

import UnitRollupTable from '@/components/aramco/UnitRollupTable';
import SiteMap from '@/components/aramco/SiteMap';
import HeadcountReconciliationPanel from '@/components/aramco/HeadcountReconciliationPanel';
import EvidenceTrustPanel from '@/components/aramco/EvidenceTrustPanel';
import MusterBoard from '@/components/aramco/MusterBoard';
import CurrentStateDiagram from '@/components/aramco/CurrentStateDiagram';

const flows = (getPersonaFlowConfigs('aramco') as unknown as Record<string, PersonaManifest['flows']>)
  .aramco_complex_manager;

const KPI_PRESENTATION: Record<string, { icon: ComponentType<Record<string, unknown>>; iconColor: string; iconBg: string }> = {
  site_population: { icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10' },
  open_exposures: { icon: AlertTriangle, iconColor: 'text-rose-700', iconBg: 'bg-rose-700/10' },
  trcr: { icon: Activity, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
  turnaround: { icon: CalendarClock, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  muster_time: { icon: Timer, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
  surge: { icon: TrendingUp, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  overdue_actions: { icon: ClipboardList, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  audit_ready: { icon: FileCheck2, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
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
  id: 'aramco_complex_manager',
  clientId: 'aramco',
  marketId: 'oil_gas',

  identity: {
    name: 'Complex Manager',
    initials: 'CM',
    role: 'Complex Manager, Refining and Petrochemical Site',
    greeting: 'Complex Manager',
  },
  capabilities: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Predictive Intelligence',
    'Friction Observability',
    'Automated Action',
    'Anomaly Detection',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',

  features: {
    // No permit detail — drilling into one confined-space entry is not this
    // altitude's job. The roll-up and the muster are.
    navSlots: ['ask', 'liveSite', 'muster', 'dataSources'],
    // These answers render site plans, roll-up tables and process rails. At the
    // default 3xl measure they scroll horizontally inside a column that has
    // ~400px of unused space either side of it.
    wideInlineComponents: true,
    topAlignedInitial: true,
  },

  ui: {
    greetingFlowKey: 'aramco_cm_greeting',
    contentMaxWidth: 'max-w-6xl',
    inputPlaceholder: 'Ask anything about site exposure, the turnaround, or what you report…',
    initialChips: [
      'Show me safety exposure by unit',
      'What is the schedule versus safety trade-off?',
      'Why are the headcounts disagreeing?',
      'What happens at the next surge?',
      "What would I tell the board's safety committee today?",
    ],
    goldenPathChip: {
      aramco_cm_greeting: 'Show me safety exposure by unit',
      aramco_cm_unit_rollup: 'What is the schedule versus safety trade-off?',
      aramco_cm_schedule_safety: 'What happens at the next surge?',
      aramco_cm_surge: "What would I tell the board's safety committee today?",
      aramco_cm_headcount: "What would I tell the board's safety committee today?",
      aramco_cm_board: 'Assemble the committee pack',
      aramco_cm_committee_pack: 'Show me safety exposure by unit',
    },
    flowKeyToCapabilityTrigger: {
      aramco_cm_greeting: 'home_load',
      aramco_cm_unit_rollup: 'ask_turn_1',
      aramco_cm_schedule_safety: 'ask_turn_2',
      aramco_cm_surge: 'ask_turn_2',
      aramco_cm_headcount: 'ask_turn_3',
      aramco_cm_board: 'ask_turn_4',
      aramco_cm_committee_pack: 'ask_turn_4',
    },
    stats,
    signalToChip: {
      'SIG-ARAMCO-CM-001': 'Show me safety exposure by unit',
      'SIG-ARAMCO-CM-002': 'Why are the headcounts disagreeing?',
      'SIG-ARAMCO-CM-003': 'What happens at the next surge?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey as string | undefined;

    if (k === 'aramco_cm_greeting') {
      out.push(<UnitRollupTable key="rollup" />);
    }
    if (k === 'aramco_cm_unit_rollup') {
      out.push(<UnitRollupTable key="rollup-detail" />);
      out.push(<SiteMap key="site-map" />);
    }
    if (k === 'aramco_cm_schedule_safety' || k === 'aramco_cm_surge') {
      out.push(<CurrentStateDiagram key="current-state" />);
    }
    if (k === 'aramco_cm_headcount') {
      out.push(<HeadcountReconciliationPanel key="recon" />);
    }
    if (k === 'aramco_cm_board' || k === 'aramco_cm_committee_pack') {
      out.push(<EvidenceTrustPanel key="trust" />);
      out.push(<MusterBoard key="muster" />);
    }

    return out.length ? out : undefined;
  },
};

export default manifest;
