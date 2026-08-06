/**
 * Persona: Gina "GM", General Manager Health, Safety and Environment — Aramco (illustrative).
 *
 * The TrackLynk.AI reference demo. One turnaround morning, six scripted turns:
 * where do things stand → which jobs are running outside their permit → the
 * confined-space drill-in → can I trust these numbers → what do I act on before
 * the night shift → who is unaccounted for in a muster.
 *
 * Every figure is illustrative and labeled. Aramco company-level facts are real
 * and sourced (FY2025 Annual Report); nothing confidential is used.
 */
import { FileText, Flame, Users, AlertTriangle, Activity, ShieldAlert, ClipboardList, Timer } from 'lucide-react';
import type { ComponentType } from 'react';
import type { PersonaManifest, StatTile } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/aramco/hse-gm/signals.json';
import dataSources from '@/data/aramco/_shared/dataSources.json';
import capabilityCallouts from '@/data/aramco/hse-gm/capabilityCallouts.json';
import kpis from '@/data/aramco/hse-gm/kpis.json';

import LazySiteMap from '@/components/aramco/LazySiteMap';
import FlaggedJobsTable from '@/components/aramco/FlaggedJobsTable';
import PermitDetailCard from '@/components/aramco/PermitDetailCard';
import LazyIndoorViewer from '@/components/aramco/LazyIndoorViewer';
import EvidenceTrustPanel from '@/components/aramco/EvidenceTrustPanel';
import HeadcountReconciliationPanel from '@/components/aramco/HeadcountReconciliationPanel';
import PrioritizedActionCards from '@/components/aramco/PrioritizedActionCards';
import MusterBoard from '@/components/aramco/MusterBoard';
import MusterLocationMap from '@/components/aramco/MusterLocationMap';
import AssetHealthCard from '@/components/aramco/AssetHealthCard';
import CurrentStateDiagram from '@/components/process/CurrentStateDiagram';
import { getCurrentState } from '@/data/aramco/hse-gm';
import JourneyMap from '@/components/process/JourneyMap';
import { getJourney } from '@/data/aramco/hse-gm';

const flows = (getPersonaFlowConfigs('aramco') as unknown as Record<string, PersonaManifest['flows']>).aramco_hse_gm;

/**
 * KPI presentation, keyed by the id in kpis.json. Values, sources, targets and
 * freshness stay in the fixture; only the icon and its tint live here, because
 * a lucide component cannot be expressed in JSON.
 */
const KPI_PRESENTATION: Record<string, { icon: ComponentType<Record<string, unknown>>; iconColor: string; iconBg: string }> = {
  active_permits: { icon: FileText, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10' },
  high_risk_permits: { icon: Flame, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  people_on_site: { icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10' },
  jobs_without_permit: { icon: AlertTriangle, iconColor: 'text-rose-700', iconBg: 'bg-rose-700/10' },
  trcr: { icon: Activity, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
  near_misses: { icon: ShieldAlert, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
  overdue_actions: { icon: ClipboardList, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  muster_time: { icon: Timer, iconColor: 'text-slate-500', iconBg: 'bg-slate-500/10' },
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
  id: 'aramco_hse_gm',
  clientId: 'aramco',
  marketId: 'oil_gas',

  identity: {
    name: 'Gina "GM"',
    initials: 'GM',
    role: 'General Manager, Health, Safety and Environment',
    greeting: 'Gina',
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
    // The spec's five routes, in spec order. Journey/risk/governance are not
    // borrowed — this market has its own HSE routes.
    navSlots: ['ask', 'liveSite', 'permits', 'muster', 'dataSources'],
    // These answers render site plans, roll-up tables and process rails. At the
    // default 3xl measure they scroll horizontally inside a column that has
    // ~400px of unused space either side of it.
    wideInlineComponents: true,
    // Eight KPI tiles plus three signal cards make a tall briefing; centering it
    // would push the greeting off the top on shorter viewports.
    topAlignedInitial: true,
  },

  ui: {
    greetingFlowKey: 'aramco_hse_greeting',
    contentMaxWidth: 'max-w-6xl',
    inputPlaceholder: 'Ask anything about people, permits, hazard zones, or the muster…',
    // Spec §11 suggested prompts, plus the two signal-card entry points.
    initialChips: [
      'What is the riskiest job on site right now?',
      'Show me every job in a hazard zone without a valid permit.',
      'Walk me through the confined-space entry on Unit 3.',
      "Can I trust today's headcount, and where does it come from?",
      'What are the top three actions to take before the night shift?',
      'During a muster, who is unaccounted for?',
      'Show me the contractor surge exposure',
      'How does this work today, without TrackLynk?',
      'Walk me through my turnaround day',
      'How is the compressor on Unit 2?',
    ],
    // The golden path walks the six spec turns in order. Every value here is a
    // chip that exists in that turn's suggested_chips.
    goldenPathChip: {
      aramco_hse_greeting: 'Show the three flagged jobs',
      aramco_hse_flagged_jobs: 'Walk me through the confined-space entry on Unit 3.',
      aramco_hse_confined_space: 'Can I trust these numbers?',
      aramco_hse_trust: 'What should I act on before the night shift?',
      aramco_hse_actions: 'During a muster, who is unaccounted for?',
      aramco_hse_riskiest_job: 'Show me every job in a hazard zone without a valid permit.',
      aramco_hse_evidence_job1: 'What should I act on before the night shift?',
      aramco_hse_site_map: 'Walk me through the confined-space entry on Unit 3.',
      aramco_hse_standby_person: 'Can I trust these numbers?',
      aramco_hse_unmatched_28: 'What should I act on before the night shift?',
      aramco_hse_hand_off: 'During a muster, who is unaccounted for?',
      aramco_hse_no_signal_2: 'Message the zone wardens',
      aramco_hse_surge_exposure: 'Show me every job in a hazard zone without a valid permit.',
      aramco_hse_idle_time: 'What should I act on before the night shift?',
      aramco_hse_current_state: 'Where does TrackLynk change the picture?',
      aramco_hse_future_state: 'Walk me through my turnaround day',
      aramco_hse_journey: 'How long did the last muster actually take?',
      aramco_hse_muster_benchmark: 'During a muster, who is unaccounted for?',
      aramco_hse_asset_health: 'Which permits are inside the exclusion radius?',
      aramco_hse_asset_fleet: 'What should I act on before the night shift?',
      aramco_hse_exclusion_permits: 'What should I act on before the night shift?',
    },
    // All six capabilities are exercised across the six turns, per spec §1.
    flowKeyToCapabilityTrigger: {
      aramco_hse_greeting: 'home_load',
      aramco_hse_riskiest_job: 'home_load',
      aramco_hse_surge_exposure: 'ask_turn_5',
      aramco_hse_flagged_jobs: 'ask_turn_1',
      aramco_hse_evidence_job1: 'ask_turn_1',
      aramco_hse_no_signal_2: 'ask_turn_1',
      aramco_hse_confined_space: 'ask_turn_2',
      aramco_hse_standby_person: 'ask_turn_2',
      aramco_hse_site_map: 'ask_turn_2',
      aramco_hse_trust: 'ask_turn_3',
      aramco_hse_unmatched_28: 'ask_turn_3',
      aramco_hse_source_reliability: 'ask_turn_3',
      aramco_hse_entry_exit_log: 'ask_turn_3',
      aramco_hse_idle_time: 'ask_turn_3',
      aramco_hse_actions: 'ask_turn_4',
      aramco_hse_notify_issuer: 'ask_turn_4',
      aramco_hse_gas_test_reminder: 'ask_turn_4',
      aramco_hse_export_recon: 'ask_turn_4',
      aramco_hse_hand_off: 'ask_turn_4',
      aramco_hse_edit_action_1: 'ask_turn_4',
      aramco_hse_handover_report: 'ask_turn_4',
      aramco_hse_message_wardens: 'ask_turn_4',
      aramco_hse_incident_log: 'ask_turn_4',
      aramco_hse_muster: 'ask_turn_5',
      aramco_hse_muster_benchmark: 'ask_turn_5',
      aramco_hse_current_state: 'ask_turn_3',
      aramco_hse_journey: 'ask_turn_3',
      // Equipment condition is a forecast about consequence, so it carries the
      // predictive tag; the fleet view fuses three sources, so it carries
      // converged conversation.
      aramco_hse_asset_health: 'ask_turn_5',
      aramco_hse_asset_fleet: 'ask_turn_2',
      aramco_hse_exclusion_permits: 'ask_turn_1',
      aramco_hse_future_state: 'ask_turn_2',
    },
    stats,
    signalToChip: {
      'SIG-ARAMCO-HSE-001': 'Can I trust these numbers?',
      'SIG-ARAMCO-HSE-002': 'Show me the contractor surge exposure',
      'SIG-ARAMCO-HSE-003': 'Where is verification idle time coming from?',
      'SIG-ARAMCO-HSE-004': 'How is the compressor on Unit 2?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  // Visualizations per spec §10. Attached by flowKey rather than declared in the
  // chat JSON, so the script stays pure content and the components stay typed.
  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey as string | undefined;

    // Step 1 — situational briefing: TEXT ONLY, deliberately.
    //
    // The greeting reads as an executive brief and reveals visuals on demand as
    // Gina drills in. Holding the map back is also what makes the reveal land
    // when she asks for it. The standing signal cards and KPI tiles above the
    // conversation stay visible — those are the dashboard, not the AI turn.
    if (k === 'aramco_hse_site_map' || k === 'aramco_hse_surge_exposure') {
      out.push(<LazySiteMap key="site-map" />);
    }

    // Step 2 — permit violations: the map *and* the evidence, per the response
    // mapping. The map is zoomed to the three flagged jobs and its worker layer
    // is off, so the markers are the only thing competing for attention.
    if (k === 'aramco_hse_flagged_jobs' || k === 'aramco_hse_evidence_job1' || k === 'aramco_hse_riskiest_job') {
      out.push(<LazySiteMap key="flagged-map" variant="flagged" height="340px" title="Where the three flagged jobs are" />);
      out.push(<FlaggedJobsTable key="flagged-jobs" />);
    }

    // Step 3 — the confined-space drill-in.
    if (k === 'aramco_hse_confined_space' || k === 'aramco_hse_standby_person' || k === 'aramco_hse_entry_exit_log') {
      // The interior first, then the permit record. The conditions read as
      // positions you can check against each other before they read as rows.
      out.push(<LazyIndoorViewer key="indoor" />);
      out.push(<PermitDetailCard key="permit-detail" compact={k === 'aramco_hse_standby_person'} />);
    }

    // Step 4 — trust: every figure sourced, the one that disagreed reconciled.
    if (k === 'aramco_hse_trust') {
      out.push(<EvidenceTrustPanel key="trust" />);
      out.push(<HeadcountReconciliationPanel key="recon" />);
    }
    if (k === 'aramco_hse_unmatched_28' || k === 'aramco_hse_source_reliability' || k === 'aramco_hse_export_recon') {
      out.push(<HeadcountReconciliationPanel key="recon-detail" />);
    }

    // Step 5 — prioritized actions with the hand-off control.
    if (k === 'aramco_hse_actions' || k === 'aramco_hse_edit_action_1' || k === 'aramco_hse_hand_off' || k === 'aramco_hse_handover_report') {
      out.push(<PrioritizedActionCards key="actions" />);
    }

    // Step 6 — muster: the board, then where the unaccounted were last seen.
    // "28 outstanding" is a number; three pins on a map is a search plan.
    if (k === 'aramco_hse_muster' || k === 'aramco_hse_no_signal_2' || k === 'aramco_hse_message_wardens' || k === 'aramco_hse_incident_log' || k === 'aramco_hse_muster_benchmark') {
      out.push(<MusterBoard key="muster" />);
      out.push(<MusterLocationMap key="muster-map" />);
    }

    // Device and equipment health — the third domain pattern. Equipment
    // condition earns a place in an HSE product because it changes the risk of
    // the permits around it, not on its own account.
    if (k === 'aramco_hse_asset_health' || k === 'aramco_hse_exclusion_permits') {
      out.push(<AssetHealthCard key="asset" />);
    }
    if (k === 'aramco_hse_asset_fleet') {
      out.push(<AssetHealthCard key="asset-fleet" fleet />);
    }

    // Spec §8 — how high-risk work runs today, and the four interventions.
    if (k === 'aramco_hse_current_state' || k === 'aramco_hse_future_state') {
      out.push(<CurrentStateDiagram key="current-state" getter={getCurrentState} productName="TrackLynk.AI" />);
    }

    // Spec §9 — the turnaround-day journey and its traceability to signals.
    if (k === 'aramco_hse_journey') {
      out.push(<JourneyMap key="journey" getter={getJourney} title="Gina 'GM' — Turnaround Day Journey" idleHint="Hover a phase for its pain points, Gina's own words, and the opportunity that answers them. The emotional low is Phase 4 — the muster — which is where this demo's payoff sits." />);
    }

    return out.length ? out : undefined;
  },
};

export default manifest;
