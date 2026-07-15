/**
 * Persona: President & CEO (Timothy L. Anderson) — USSFCU-only. Pure executive
 * altitude: state-of-the-business roll-up with a first-class Data Trust Strip and
 * a full-screen Presentation Mode.
 *
 * Exercises the most PersonaWorkspace slots: `signalsComponent` (CeoHomeSignals),
 * `initialExtras` (DataTrustStrip), `overlayComponent` (Presentation Mode) opened
 * via a window event, `statsComponent` (KPI carousel), and top-aligned initial.
 */

import { DollarSign, Users, ShieldAlert, Scale, TrendingUp, Star, CheckCircle, Database } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/ussfcu/ceo/signals.json';
import dataSources from '@/data/ussfcu/ceo/dataSources.json';
import capabilityCallouts from '@/data/ussfcu/ceo/capabilityCallouts.json';

import SignalCard from '@/components/cards/SignalCard';
import CapmKpiCarousel from '@/components/penfed/capmarkets/CapmKpiCarousel';
import CeoHomeSignals from '@/components/ussfcu/ceo/CeoHomeSignals';
import DataTrustStrip from '@/components/ussfcu/ceo/DataTrustStrip';
import LiquidityReconciliation from '@/components/ussfcu/ceo/LiquidityReconciliation';
import LiquidityProjectionChart from '@/components/ussfcu/ceo/LiquidityProjectionChart';
import BusinessHealthPanel from '@/components/ussfcu/ceo/BusinessHealthPanel';
import BoardBriefingPreview from '@/components/ussfcu/ceo/BoardBriefingPreview';
import NetIncomeTrace from '@/components/ussfcu/ceo/NetIncomeTrace';
import PresentationMode from '@/components/ussfcu/ceo/presentation/PresentationMode';

const flows = (getPersonaFlowConfigs('ussfcu') as unknown as Record<string, PersonaManifest['flows']>).ussfcu_ceo;

const manifest: PersonaManifest = {
  id: 'ussfcu_ceo',
  clientId: 'ussfcu',
  domainId: 'financial-services',

  identity: { name: 'Timothy L. Anderson', initials: 'TA', role: 'President & Chief Executive Officer', greeting: 'Tim' },
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
  statsComponent: CapmKpiCarousel as unknown as PersonaManifest['statsComponent'],
  signalsComponent: CeoHomeSignals as unknown as PersonaManifest['signalsComponent'],
  initialExtras: DataTrustStrip as unknown as PersonaManifest['initialExtras'],
  overlayComponent: PresentationMode as unknown as PersonaManifest['overlayComponent'],
  features: {
    topAlignedInitial: true,
    overlayOpenEvent: 'ussfcu-ceo:open-presentation',
  },
  // Pure executive altitude — reframe the nav pages.
  navLabels: { journey: 'Business Performance', risk: 'Priority Signals' },

  ui: {
    greetingFlowKey: 'ussfcu_ceo_greeting',
    initialChips: [
      'Where does the business stand this morning?',
      'Walk me through the liquidity signal',
      'Can I trust these numbers?',
      'What happens to liquidity if this continues?',
      'Show me membership and growth',
      'Trace net income back to source',
      'Draft the board briefing',
      'Open the full briefing',
    ],
    goldenPathChip: {
      ussfcu_ceo_greeting: 'Walk me through the liquidity signal',
      ussfcu_ceo_turn_liquidity: 'What happens to liquidity if this continues?',
      ussfcu_ceo_turn_projection: 'Can I trust these numbers this morning?',
      ussfcu_ceo_turn_trust: 'Trace net income back to source',
      ussfcu_ceo_trace_net_income: 'Draft the board briefing',
      ussfcu_ceo_turn_membership: 'Draft the board briefing',
      ussfcu_ceo_turn_board_briefing: 'Open the full briefing',
    },
    flowKeyToCapabilityTrigger: {
      ussfcu_ceo_greeting: 'home_load',
      ussfcu_ceo_signal_1_liquidity: 'home_load',
      ussfcu_ceo_signal_2_membership: 'home_load',
      ussfcu_ceo_signal_3_trust: 'home_load',
      ussfcu_ceo_where_stands: 'home_load',
      ussfcu_ceo_turn_liquidity: 'ask_turn_1',
      ussfcu_ceo_turn_membership: 'ask_turn_1',
      ussfcu_ceo_turn_projection: 'ask_turn_2',
      ussfcu_ceo_turn_trust: 'ask_turn_3',
      ussfcu_ceo_trace_net_income: 'ask_turn_4',
      ussfcu_ceo_turn_board_briefing: 'ask_turn_5',
    },
    stats: [
      { id: 'assets', label: 'Total Assets', value: '$1.53B', trend: '+8.2% YoY', positive: true, icon: DollarSign, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Where does the business stand this morning?' },
      { id: 'members', label: 'Members', value: '52,488', trend: '+3.1% YTD', positive: true, icon: Users, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10', chipText: 'Show me membership and growth' },
      { id: 'net_worth', label: 'Net Worth Ratio', value: '7.50%', trend: 'Well capitalized', positive: true, icon: ShieldAlert, iconColor: 'text-blue-700', iconBg: 'bg-blue-500/10', chipText: null },
      { id: 'loan_to_share', label: 'Loan-to-Share Ratio', value: '84%', trend: '+6 pts · 5-yr high', positive: false, icon: Scale, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Walk me through the liquidity signal' },
      { id: 'net_income', label: 'Net Income, YTD', value: '$9.4M', trend: '+6.8% vs plan', positive: true, icon: TrendingUp, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: null },
      { id: 'nps', label: 'Member NPS', value: '71', trend: 'Voice of Member', positive: true, icon: Star, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: null },
      { id: 'data_trust', label: 'Data Trust Score', value: '98%', trend: 'Validated 6:00 AM ET', positive: true, icon: CheckCircle, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: 'Can I trust these numbers?' },
      { id: 'sources', label: 'Data Sources Connected', value: '6', trend: '1 in migration', positive: true, icon: Database, iconColor: 'text-slate-600', iconBg: 'bg-slate-500/10', chipText: null },
    ],
    signalToChip: {
      'SIG-USSFCU-CEO-001': 'Walk me through the liquidity signal',
      'SIG-USSFCU-CEO-002': 'Show me membership and growth',
      'SIG-USSFCU-CEO-003': 'Can I trust these numbers this morning?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg, sigs) => {
    const out = [];
    const k = msg.flowKey;
    const pushSignal = (id: string, key: string) => {
      const s = sigs.find((x) => x.id === id);
      if (s) out.push(<SignalCard key={key} signal={s} />);
    };

    if (k === 'ussfcu_ceo_signal_1_liquidity') { pushSignal('SIG-USSFCU-CEO-001', 'ceosig1'); out.push(<LiquidityReconciliation key="ceo-recon-sig1" />); }
    if (k === 'ussfcu_ceo_signal_2_membership') { pushSignal('SIG-USSFCU-CEO-002', 'ceosig2'); out.push(<BusinessHealthPanel key="ceo-health-sig2" />); }
    // Legacy JSX components take extra callbacks; the old screen passed none
    // (undefined → no-op). No-op handlers keep identical behavior + satisfy TS.
    const noop = () => {};
    if (k === 'ussfcu_ceo_signal_3_trust') { pushSignal('SIG-USSFCU-CEO-003', 'ceosig3'); out.push(<DataTrustStrip key="ceo-trust-sig3" compact onTrace={noop} />); }
    if (k === 'ussfcu_ceo_turn_liquidity') out.push(<LiquidityReconciliation key={`ceo-recon-${k}`} />);
    if (k === 'ussfcu_ceo_turn_projection' || k === 'ussfcu_ceo_national_opportunity') out.push(<LiquidityProjectionChart key={`ceo-proj-${k}`} />);
    if (k === 'ussfcu_ceo_turn_trust') out.push(<DataTrustStrip key={`ceo-trust-${k}`} expanded onTrace={noop} />);
    if (k === 'ussfcu_ceo_trace_net_income') out.push(<NetIncomeTrace key="ceo-netinc-trace" />);
    if (k === 'ussfcu_ceo_turn_membership') out.push(<BusinessHealthPanel key={`ceo-health-${k}`} />);
    if (k === 'ussfcu_ceo_turn_board_briefing' || k === 'ussfcu_ceo_turn_full_briefing' || k === 'ussfcu_ceo_export_document' || k === 'ussfcu_ceo_add_recommendation') {
      out.push(<BoardBriefingPreview key={`ceo-briefing-${k}`} onViewFullBriefing={noop} />);
    }

    return out.length ? out : undefined;
  },
};

export default manifest;
