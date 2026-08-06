/**
 * Persona: Shift Supervisor, Units 2 and 3 — Aramco (illustrative).
 *
 * Ground altitude on the same turnaround morning the HSE GM is looking at. The
 * GM sees three flagged jobs across the site; the supervisor sees the two on
 * their units, the condition on the clock, and the two actions the GM assigned
 * — with the same evidence already attached rather than re-explained.
 *
 * Reuses the HSE GM's components and site fixtures unchanged. That reuse is the
 * demonstration: one live picture, read at four altitudes.
 */
import { Users, FileText, AlertTriangle, Timer, ClipboardCheck, UserCheck, Clock, HeartPulse } from 'lucide-react';
import type { ComponentType } from 'react';
import type { PersonaManifest, StatTile } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/aramco/shift-supervisor/signals.json';
import dataSources from '@/data/aramco/_shared/dataSources.json';
import capabilityCallouts from '@/data/aramco/shift-supervisor/capabilityCallouts.json';
import kpis from '@/data/aramco/shift-supervisor/kpis.json';

import FlaggedJobsTable from '@/components/aramco/FlaggedJobsTable';
import PermitDetailCard from '@/components/aramco/PermitDetailCard';
import LazyIndoorViewer from '@/components/aramco/LazyIndoorViewer';
import PrioritizedActionCards from '@/components/aramco/PrioritizedActionCards';
import MusterBoard from '@/components/aramco/MusterBoard';

const flows = (getPersonaFlowConfigs('aramco') as unknown as Record<string, PersonaManifest['flows']>)
  .aramco_shift_supervisor;

const KPI_PRESENTATION: Record<string, { icon: ComponentType<Record<string, unknown>>; iconColor: string; iconBg: string }> = {
  my_people: { icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10' },
  my_permits: { icon: FileText, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  my_flagged: { icon: AlertTriangle, iconColor: 'text-rose-700', iconBg: 'bg-rose-700/10' },
  conditions_due: { icon: Timer, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  assigned: { icon: ClipboardCheck, iconColor: 'text-rose-700', iconBg: 'bg-rose-700/10' },
  muster_point: { icon: UserCheck, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
  awaiting_verification: { icon: Clock, iconColor: 'text-slate-500', iconBg: 'bg-slate-500/10' },
  consecutive_shift: { icon: HeartPulse, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
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
  id: 'aramco_shift_supervisor',
  clientId: 'aramco',
  marketId: 'oil_gas',

  identity: {
    name: 'Sally "Shift Super"',
    initials: 'SS',
    role: 'Shift Supervisor, Units 2 and 3',
    greeting: 'Sally',
  },
  capabilities: [
    'Proactive Intelligence',
    'Anomaly Detection',
    'Converged Conversation',
    'Friction Observability',
    'Automated Action',
    'Predictive Intelligence',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',

  features: {
    navSlots: ['ask', 'liveSite', 'permits', 'muster', 'dataSources'],
    // These answers render site plans, roll-up tables and process rails. At the
    // default 3xl measure they scroll horizontally inside a column that has
    // ~400px of unused space either side of it.
    wideInlineComponents: true,
    topAlignedInitial: true,
  },

  ui: {
    greetingFlowKey: 'aramco_sup_greeting',
    contentMaxWidth: 'max-w-6xl',
    inputPlaceholder: 'Ask anything about your crews, permits, or the muster…',
    initialChips: [
      'Show me the expired hot-work permits',
      'What is the status on the Unit 3 confined space?',
      'What has been assigned to me?',
      'Who is on location right now?',
      'How is my muster point looking?',
      'Draft the stop-work notice',
    ],
    goldenPathChip: {
      aramco_sup_greeting: 'Show me the expired hot-work permits',
      aramco_sup_expired_permits: 'Draft the stop-work notice',
      aramco_sup_stop_work: 'What is the status on the Unit 3 confined space?',
      aramco_sup_confined_space: 'Remind the crew of the gas test',
      aramco_sup_gas_reminder: 'What has been assigned to me?',
      aramco_sup_assigned: 'How is my muster point looking?',
      aramco_sup_on_location: 'Draft the stop-work notice',
      aramco_sup_extension: 'What has been assigned to me?',
    },
    flowKeyToCapabilityTrigger: {
      aramco_sup_greeting: 'home_load',
      aramco_sup_expired_permits: 'ask_turn_1',
      aramco_sup_stop_work: 'ask_turn_4',
      aramco_sup_extension: 'ask_turn_4',
      aramco_sup_on_location: 'ask_turn_2',
      aramco_sup_confined_space: 'ask_turn_2',
      aramco_sup_gas_reminder: 'ask_turn_4',
      aramco_sup_assigned: 'ask_turn_4',
      aramco_sup_muster: 'ask_turn_5',
    },
    stats,
    signalToChip: {
      'SIG-ARAMCO-SUP-001': 'Show me the expired hot-work permits',
      'SIG-ARAMCO-SUP-002': 'What is the status on the Unit 3 confined space?',
      'SIG-ARAMCO-SUP-003': 'Who is on location right now?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey as string | undefined;

    // The greeting is text only — an executive brief, with visuals revealed as
    // Sally drills in. Same rule across all four Aramco personas.
    if (k === 'aramco_sup_expired_permits' || k === 'aramco_sup_on_location') {
      out.push(<FlaggedJobsTable key="flagged" />);
    }
    if (k === 'aramco_sup_confined_space' || k === 'aramco_sup_gas_reminder') {
      out.push(<LazyIndoorViewer key="indoor" />);
      out.push(<PermitDetailCard key="permit" compact={k === 'aramco_sup_gas_reminder'} />);
    }
    if (k === 'aramco_sup_assigned' || k === 'aramco_sup_stop_work' || k === 'aramco_sup_extension') {
      out.push(<PrioritizedActionCards key="actions" />);
    }
    if (k === 'aramco_sup_muster') out.push(<MusterBoard key="muster" />);

    return out.length ? out : undefined;
  },
};

export default manifest;
