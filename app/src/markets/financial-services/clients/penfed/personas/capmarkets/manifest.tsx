/**
 * Persona: Capital Markets Risk (Sowmya Ha) — PenFed-only. Inline-heavy: all its
 * capital-markets visuals compose into the chat thread (no right context panel),
 * and its 8 KPIs render through the paginated CapmKpiCarousel rather than the
 * standard stat bar. Both the carousel and the visuals live in this module, so
 * they code-split with the persona and never ship to other tenants.
 */

import { DollarSign, AlertTriangle, TrendingDown, TrendingUp, Gauge, ShieldAlert, Star, Database } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/penfed/capmarkets/signals.json';
import dataSources from '@/data/penfed/capmarkets/dataSources.json';
import capabilityCallouts from '@/data/capabilityCallouts.json';

import SignalCard from '@/components/cards/SignalCard';
import CapmKpiCarousel from '@/components/penfed/capmarkets/CapmKpiCarousel';
import AbsDelinquencyTrend from '@/components/penfed/capmarkets/AbsDelinquencyTrend';
import DealerScorecardTable from '@/components/penfed/capmarkets/DealerScorecardTable';
import ScenarioComparisonTable from '@/components/penfed/capmarkets/ScenarioComparisonTable';
import SwapEffectivenessGrid from '@/components/penfed/capmarkets/SwapEffectivenessGrid';
import YieldCurveCompare from '@/components/penfed/capmarkets/YieldCurveCompare';
import CapitalWaterfall from '@/components/penfed/capmarkets/CapitalWaterfall';

// getPersonaFlowConfigs is untyped legacy JS; PenFed's registry adds capmarkets.
const flows = (getPersonaFlowConfigs('penfed') as unknown as Record<string, PersonaManifest['flows']>).capmarkets;

const manifest: PersonaManifest = {
  id: 'capmarkets',
  clientId: 'penfed',
  marketId: 'financial-services',

  identity: { name: 'Sowmya Ha', initials: 'SH', role: 'Capital Markets Risk', greeting: 'Sowmya' },
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

  // Inline-only: no right context panel; visuals compose into the chat thread.
  layout: 'inline',
  // Legacy JS component with specific props → cast to the manifest's slot type.
  statsComponent: CapmKpiCarousel as unknown as PersonaManifest['statsComponent'],

  ui: {
    greetingFlowKey: 'greeting',
    initialChips: ['Yes, walk me through them', 'What is driving the delinquency spike?', 'Show me hedge positions'],
    goldenPathChip: {
      greeting: 'Yes, walk me through them',
      signal_1_abs: 'Show me the dealer-level breakdown',
      turn_1_walkthrough: 'Show me the dealer-level breakdown',
      turn_2_dealer_breakdown: 'What happens if we breach the trigger?',
      turn_3_trigger_scenarios: 'Show me the hedge effectiveness signal',
      turn_4_hedge_anomaly: 'What does this mean for our capital ratio?',
      turn_5_capital_impact: 'Execute the remediation path',
    },
    flowKeyToCapabilityTrigger: {
      greeting: 'home_load',
      signal_1_abs: 'home_load',
      signal_2_hedge: 'home_load',
      signal_3_dealer: 'home_load',
      turn_1_walkthrough: 'ask_turn_1',
      turn_2_dealer_breakdown: 'ask_turn_2',
      turn_3_trigger_scenarios: 'ask_turn_3',
      turn_4_hedge_anomaly: 'ask_turn_4',
      turn_5_capital_impact: 'ask_turn_5',
      turn_6_actions: 'ask_turn_6',
    },
    stats: [
      { id: 'abs_outstanding', label: 'ABS Outstanding', value: '$1.3B', trend: '3 active trusts', positive: true, icon: DollarSign, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Show me ABS portfolio outstanding' },
      { id: 'dq_60plus', label: '60+ Delinquency', value: '1.62%', trend: '2024-A near trigger', positive: false, icon: AlertTriangle, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Show me ABS collateral performance across all trusts' },
      { id: 'cpr', label: 'Prepayment (CPR)', value: '14.8%', trend: 'In line w/ deal', positive: true, icon: TrendingDown, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: 'Compare prepayment speeds: 2024-A vs. 2025-A' },
      { id: 'nim', label: 'Net Interest Margin', value: '2.41%', trend: 'Stable', positive: true, icon: TrendingUp, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: 'What is our current interest rate exposure?' },
      { id: 'hedge', label: 'Hedge Effectiveness', value: '89.7%', trend: '-6.5 pts (90d)', positive: false, icon: Gauge, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me the hedge effectiveness signal' },
      { id: 'capital_ratio', label: 'Regulatory Capital', value: '10.32%', trend: 'Well-capitalized', positive: true, icon: ShieldAlert, iconColor: 'text-blue-700', iconBg: 'bg-blue-500/10', chipText: 'What is our capital ratio sensitivity to credit losses?' },
      { id: 'rating_review', label: 'Next Rating Review', value: 'Q3 2026', trend: 'S&P / Fitch', positive: true, icon: Star, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10', chipText: 'Show me the rating agency timeline and open items' },
      { id: 'sources', label: 'Data Sources', value: '7', trend: 'All connected', positive: true, icon: Database, iconColor: 'text-slate-600', iconBg: 'bg-slate-500/10', chipText: 'Show me connected data sources' },
    ],
    signalToChip: {
      'SIG-CAPM-001': 'Yes, walk me through them',
      'SIG-CAPM-002': 'Show me the hedge effectiveness signal',
      'SIG-CAPM-003': 'Show me the dealer-level breakdown',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  // No contextPanel — capmarkets composes everything inline.
  inlineComponents: (msg, sigs) => {
    const out = [];
    const k = msg.flowKey;
    const pushSignal = (id: string, key: string) => {
      const s = sigs.find((x) => x.id === id);
      if (s) out.push(<SignalCard key={key} signal={s} />);
    };

    if (k === 'signal_1_abs') { pushSignal('SIG-CAPM-001', 'capmsig1'); out.push(<AbsDelinquencyTrend key="capm-abs-trend" />); }
    if (k === 'signal_2_hedge') { pushSignal('SIG-CAPM-002', 'capmsig2'); out.push(<SwapEffectivenessGrid key="capm-swap-sig" />); }
    if (k === 'signal_3_dealer') { pushSignal('SIG-CAPM-003', 'capmsig3'); out.push(<DealerScorecardTable key="capm-dealer-sig" />); }
    if (k === 'turn_1_walkthrough' || k === 'delinquency_drivers' || k === 'q_abs_collateral_overview') out.push(<AbsDelinquencyTrend key={`capm-abs-${k}`} />);
    if (k === 'turn_2_dealer_breakdown') out.push(<DealerScorecardTable key="capm-dealer-turn2" />);
    if (k === 'turn_3_trigger_scenarios' || k === 'execute_scenario_b') out.push(<ScenarioComparisonTable key="capm-scenarios" />);
    if (k === 'turn_4_hedge_anomaly' || k === 'hedge_fix_options') { out.push(<SwapEffectivenessGrid key="capm-swap-grid" />); out.push(<YieldCurveCompare key="capm-yield" />); }
    if (k === 'turn_5_capital_impact' || k === 'q_capital_sensitivity') out.push(<CapitalWaterfall key="capm-waterfall" />);
    if (k === 'q_underperforming_dealers' || k === 'dealer_remediation_action') out.push(<DealerScorecardTable key="capm-dealer-q" />);

    return out.length ? out : undefined;
  },
};

export default manifest;
