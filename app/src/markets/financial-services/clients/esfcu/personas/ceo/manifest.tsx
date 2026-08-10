/**
 * Persona: President & CEO (Girado Smith, CPA) — ESFCU's only persona.
 *
 * Executive altitude, built around one hero issue: loan demand outpacing member
 * deposit growth, with the Howard University merger and the education sector's
 * deposit seasonality fragmenting the funding picture across systems.
 *
 * Modelled on the USSFCU CEO manifest — same PersonaWorkspace slots
 * (`signalsComponent`, `initialExtras`, `overlayComponent`, `statsComponent`,
 * top-aligned initial) — with ESFCU's own components and content. Nothing under
 * `components/ussfcu/` is touched.
 */

import { DollarSign, Users, ShieldCheck, Scale, TrendingUp, PiggyBank, Droplets, Database } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/esfcu/ceo/signals.json';
import dataSources from '@/data/esfcu/ceo/dataSources.json';
import capabilityCallouts from '@/data/esfcu/ceo/capabilityCallouts.json';

import SignalCard from '@/components/cards/SignalCard';
import EsfcuKpiCarousel from '@/components/esfcu/ceo/EsfcuKpiCarousel';
import CeoHomeSignals from '@/components/esfcu/ceo/CeoHomeSignals';
import DataTrustStrip from '@/components/esfcu/ceo/DataTrustStrip';
import LoansVsSharesChart from '@/components/esfcu/ceo/LoansVsSharesChart';
import LiquidityForecastChart from '@/components/esfcu/ceo/LiquidityForecastChart';
import ReconciliationPanel from '@/components/esfcu/ceo/ReconciliationPanel';
import AnomalyList from '@/components/esfcu/ceo/AnomalyList';
import MembershipPanel from '@/components/esfcu/ceo/MembershipPanel';
import DepositLineageTrace from '@/components/esfcu/ceo/DepositLineageTrace';
import BoardBriefingPreview from '@/components/esfcu/ceo/BoardBriefingPreview';
import PresentationMode from '@/components/esfcu/ceo/presentation/PresentationMode';

const flows = (getPersonaFlowConfigs('esfcu') as unknown as Record<string, PersonaManifest['flows']>).esfcu_ceo;

const manifest: PersonaManifest = {
  id: 'esfcu_ceo',
  clientId: 'esfcu',
  marketId: 'financial-services',

  identity: { name: 'Girado Smith', initials: 'GS', role: 'President & Chief Executive Officer', greeting: 'Girado' },
  capabilities: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Friction Observability',
    'Predictive Intelligence',
    'Anomaly Detection',
    'Automated Action',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',
  statsComponent: EsfcuKpiCarousel as unknown as PersonaManifest['statsComponent'],
  signalsComponent: CeoHomeSignals as unknown as PersonaManifest['signalsComponent'],
  initialExtras: DataTrustStrip as unknown as PersonaManifest['initialExtras'],
  overlayComponent: PresentationMode as unknown as PersonaManifest['overlayComponent'],
  features: {
    topAlignedInitial: true,
    overlayOpenEvent: 'esfcu-ceo:open-presentation',
    // The reconciliation panel, the two exhibit charts and the deck preview all
    // want more measure than a chat bubble allows.
    wideInlineComponents: true,
  },
  // Executive altitude — the two detail pages are the business roll-up and the
  // state-of-the-business signal set. Duplicated on the client manifest and in
  // TopHeader's personaNavLabels; all three must agree.
  navLabels: { journey: 'Business Performance', risk: 'Priority Signals' },

  ui: {
    greetingFlowKey: 'esfcu_ceo_greeting',
    // Spec §11, verbatim.
    initialChips: [
      'Where does the business stand this morning?',
      'Walk me through the liquidity signal',
      'Can I trust these numbers after the Howard University merger?',
      'What happens to liquidity if loan demand keeps outpacing deposits?',
      'Show me membership and growth',
      'Trace the deposit figure back to source',
      'Draft the board briefing',
      'Open the full briefing',
    ],
    // The golden path walks spec §10's seven turns in order. Each value must be
    // among that turn's suggested_chips — manifests.test.ts asserts it.
    goldenPathChip: {
      esfcu_ceo_greeting: 'Walk me through the liquidity signal',
      esfcu_ceo_where_stands: 'Walk me through the liquidity signal',
      esfcu_ceo_turn_liquidity: 'Can I trust these numbers?',
      esfcu_ceo_turn_trust: 'What happens to liquidity if this continues?',
      esfcu_ceo_trace_deposit: 'What happens to liquidity if this continues?',
      esfcu_ceo_reconcile_division: 'Is anything out of policy?',
      esfcu_ceo_turn_projection: 'Is anything out of policy?',
      esfcu_ceo_show_options: 'Draft the board briefing',
      esfcu_ceo_turn_anomalies: 'Draft the board briefing',
      esfcu_ceo_turn_membership: 'Draft the board briefing',
      esfcu_ceo_turn_board_briefing: 'Open the full briefing',
    },
    flowKeyToCapabilityTrigger: {
      esfcu_ceo_greeting: 'home_load',
      esfcu_ceo_signal_1_liquidity: 'home_load',
      esfcu_ceo_signal_2_reconciliation: 'home_load',
      esfcu_ceo_signal_3_seasonality: 'home_load',
      esfcu_ceo_where_stands: 'home_load',
      esfcu_ceo_turn_liquidity: 'ask_turn_1',
      esfcu_ceo_turn_membership: 'ask_turn_1',
      esfcu_ceo_turn_trust: 'ask_turn_2',
      esfcu_ceo_trace_deposit: 'ask_turn_2',
      esfcu_ceo_reconcile_division: 'ask_turn_2',
      esfcu_ceo_turn_projection: 'ask_turn_3',
      esfcu_ceo_show_options: 'ask_turn_3',
      esfcu_ceo_turn_anomalies: 'ask_turn_4',
      esfcu_ceo_turn_board_briefing: 'ask_turn_5',
      esfcu_ceo_adjust_action: 'ask_turn_5',
      esfcu_ceo_assign_owners: 'ask_turn_5',
      esfcu_ceo_turn_full_briefing: 'ask_turn_5',
    },
    // Spec §7. The real/illustrative marker and each KPI's source and
    // calculation live in data/esfcu/ceo/kpis.json, keyed by these ids.
    stats: [
      { id: 'assets', label: 'Total Assets', value: '≈$1.36B', trend: 'Real · NCUA Dec 2025', positive: true, icon: DollarSign, iconColor: 'text-blue-700', iconBg: 'bg-blue-500/10', chipText: 'Where does the business stand this morning?' },
      { id: 'members', label: 'Members', value: '≈84,000', trend: 'Real · NCUA Dec 2025', positive: true, icon: Users, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10', chipText: 'Show me membership and growth' },
      { id: 'net_worth', label: 'Net Worth Ratio', value: '9.62%', trend: 'Well capitalized', positive: true, icon: ShieldCheck, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: null },
      { id: 'loan_to_share', label: 'Loan-to-Share Ratio', value: '89.7%', trend: '+5.3 pts · rising', positive: false, icon: Scale, iconColor: 'text-amber-700', iconBg: 'bg-amber-500/10', chipText: 'Walk me through the liquidity signal' },
      { id: 'share_growth', label: 'Deposit Growth, YoY', value: '+3.1%', trend: 'Slowing', positive: false, icon: PiggyBank, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: null },
      { id: 'loan_growth', label: 'Loan Growth, YoY', value: '+6.4%', trend: 'Outpacing shares', positive: false, icon: TrendingUp, iconColor: 'text-amber-700', iconBg: 'bg-amber-500/10', chipText: 'What happens to liquidity if loan demand keeps outpacing deposits?' },
      { id: 'on_hand_liquidity', label: 'On-Hand Liquidity', value: '11.2%', trend: 'Drifting toward floor', positive: false, icon: Droplets, iconColor: 'text-cyan-700', iconBg: 'bg-cyan-500/10', chipText: null },
      { id: 'data_trust', label: 'Data Confidence', value: '92%', trend: 'HU division pending', positive: false, icon: Database, iconColor: 'text-slate-600', iconBg: 'bg-slate-500/10', chipText: 'Can I trust these numbers after the Howard University merger?' },
    ],
    signalToChip: {
      'SIG-ESFCU-CEO-001': 'Walk me through the liquidity signal',
      'SIG-ESFCU-CEO-002': 'Can I trust these numbers after the Howard University merger?',
      'SIG-ESFCU-CEO-003': 'What happens to liquidity if loan demand keeps outpacing deposits?',
      'SIG-ESFCU-CEO-004': 'Show me membership and growth',
      'SIG-ESFCU-CEO-005': 'Where does the business stand this morning?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  // Spec §13's response-appropriate rendering table: each answer generates the
  // visualization that fits it, not one fixed layout.
  inlineComponents: (msg, sigs) => {
    const out = [];
    const k = msg.flowKey;
    const pushSignal = (id: string, key: string) => {
      const s = sigs.find((x) => x.id === id);
      if (s) out.push(<SignalCard key={key} signal={s} />);
    };
    // Legacy JSX components take extra callbacks; no-op handlers keep behaviour
    // identical and satisfy TS.
    const noop = () => {};

    if (k === 'esfcu_ceo_signal_1_liquidity') { pushSignal('SIG-ESFCU-CEO-001', 'sig1'); out.push(<LoansVsSharesChart key="sig1-loans" />); }
    if (k === 'esfcu_ceo_signal_2_reconciliation') { pushSignal('SIG-ESFCU-CEO-002', 'sig2'); out.push(<ReconciliationPanel key="sig2-recon" />); }
    if (k === 'esfcu_ceo_signal_3_seasonality') { pushSignal('SIG-ESFCU-CEO-003', 'sig3'); out.push(<LiquidityForecastChart key="sig3-forecast" />); }

    // Step 1 — situational briefing card plus the trust strip. No chart yet.
    if (k === 'esfcu_ceo_where_stands') out.push(<DataTrustStrip key="stands-trust" compact onTrace={noop} />);
    // Step 2 — dual-line loans versus shares with the ratio overlay.
    if (k === 'esfcu_ceo_turn_liquidity') out.push(<LoansVsSharesChart key="turn-loans" />);
    // Step 3 — the reconciliation panel, plus the trust strip flipping to pending.
    if (k === 'esfcu_ceo_turn_trust') {
      out.push(<ReconciliationPanel key="turn-recon" />);
      out.push(<DataTrustStrip key="turn-trust-strip" expanded onTrace={noop} />);
    }
    if (k === 'esfcu_ceo_reconcile_division') out.push(<ReconciliationPanel key="reconcile-recon" />);
    if (k === 'esfcu_ceo_trace_deposit') out.push(<DepositLineageTrace key="trace-deposit" />);
    // Step 4 — forecast, baseline vs with-campaign, seasonality band, ceiling.
    if (k === 'esfcu_ceo_turn_projection' || k === 'esfcu_ceo_show_options') out.push(<LiquidityForecastChart key={`forecast-${k}`} />);
    // Step 5 — anomaly list with evidence links and a trend-breaking sparkline.
    if (k === 'esfcu_ceo_turn_anomalies') out.push(<AnomalyList key="anomalies" />);
    if (k === 'esfcu_ceo_turn_membership') out.push(<MembershipPanel key="membership" />);
    // Step 6/7 — the drafted briefing with owners, timeframes and the deck.
    if (
      k === 'esfcu_ceo_turn_board_briefing'
      || k === 'esfcu_ceo_turn_full_briefing'
      || k === 'esfcu_ceo_adjust_action'
      || k === 'esfcu_ceo_assign_owners'
    ) {
      // No onViewFullBriefing prop on purpose: without one the component falls
      // back to dispatching `esfcu-ceo:open-presentation`, which PersonaWorkspace
      // already listens for. Passing a no-op here would make the button dead.
      out.push(<BoardBriefingPreview key={`briefing-${k}`} />);
    }

    return out.length ? out : undefined;
  },
};

export default manifest;
