/**
 * Persona: USS FCU Finance Team — USSFCU-only.
 *
 * Spec: "Finance Persona: Demo Narrative for Validation" (Radiant Digital,
 * prepared for Lauren, 2026-09-23). The generalised finance-team persona the
 * CEO and CFO will see: no executive title, so the room stays on the questions
 * and the answers rather than on who sees what. Business value first.
 *
 * The story is three overnight signals and six approved finance questions in
 * one line — see what is moving, check it against our limits, model a shock,
 * test our cushion, decide, then watch the funding side. The questions and
 * the answers are the narrative's own words (the chips carry short labels for
 * them), pinned by
 * data/ussfcu/finance/financeData.test.ts; the golden path is those six
 * questions in order and stops after the sixth (data/ussfcu/talkTrack.test.ts).
 *
 * Every figure except USS FCU's public profile (assets, net worth ratio,
 * loan-to-share) is illustrative sample data from data/ussfcu/finance/constants.ts,
 * and each card says so.
 */

import { Landmark, Scale, Percent, Car, Home, Users } from 'lucide-react';
import type { ChatFlowConfig, PersonaManifest, StatTile } from '@core/types';

import chatFlows from '@/data/ussfcu/finance/chatFlows.json';
import signals from '@/data/ussfcu/finance/signals.json';
import dataSources from '@/data/ussfcu/finance/dataSources.json';
import capabilityCallouts from '@/data/ussfcu/finance/capabilityCallouts.json';
import {
  FINANCE_QUESTIONS,
  FINANCE_CHIPS,
  PUBLIC_FACTS,
  DQ_SEGMENTS,
  CONCENTRATION_LIMITS,
  SEG_OUTFLOW_TRIGGER_PCT,
  pctOfNetWorth,
  segTotals,
  fmtPct,
  fmtSignedPct,
} from '@/data/ussfcu/finance/constants';

import FinanceBriefingSignals from '@/components/ussfcu/finance/FinanceBriefingSignals';
import FinanceKpiRow from '@/components/ussfcu/finance/FinanceKpiRow';
import DelinquencyBySegmentPanel from '@/components/ussfcu/finance/DelinquencyBySegmentPanel';
import ConcentrationLimitsPanel from '@/components/ussfcu/finance/ConcentrationLimitsPanel';
import RateShockMatrix from '@/components/ussfcu/finance/RateShockMatrix';
import CapitalLiquidityStress from '@/components/ussfcu/finance/CapitalLiquidityStress';
import RatePlaybookLadder from '@/components/ussfcu/finance/RatePlaybookLadder';
import SegDepositMonitor from '@/components/ussfcu/finance/SegDepositMonitor';

const ask = FINANCE_CHIPS;
const full = FINANCE_QUESTIONS;

const K = {
  greeting: 'ussfcu_finance_greeting',
  delinquency: 'ussfcu_finance_turn_delinquency',
  limits: 'ussfcu_finance_turn_limits',
  rateShock: 'ussfcu_finance_turn_rate_shock',
  dryPowder: 'ussfcu_finance_turn_dry_powder',
  playbook: 'ussfcu_finance_turn_playbook',
  segDeposits: 'ussfcu_finance_turn_seg_deposits',
} as const;

const flows: ChatFlowConfig = {
  chatFlows: chatFlows as unknown as ChatFlowConfig['chatFlows'],
  chipToFlowKey: {
    [ask.delinquency]: K.delinquency,
    [ask.limits]: K.limits,
    [ask.rateShock]: K.rateShock,
    [ask.dryPowder]: K.dryPowder,
    [ask.playbook]: K.playbook,
    [ask.segDeposits]: K.segDeposits,
    // The narrative's full wording, for a presenter who types or pastes it.
    [full.delinquency]: K.delinquency,
    [full.limits]: K.limits,
    [full.rateShock]: K.rateShock,
    [full.dryPowder]: K.dryPowder,
    [full.playbook]: K.playbook,
    [full.segDeposits]: K.segDeposits,
  },
  askTurnSequence: [K.delinquency, K.limits, K.rateShock, K.dryPowder, K.playbook, K.segDeposits],
  // The briefing's three signal cards open their questions directly; there is
  // no separate "walk me through them" signal tour in this narrative.
  signalSequence: [],
  // Only the six approved questions answer. Anything else typed falls to
  // __default__, which names them, rather than to a turn that shares a word.
  strictMatch: true,
};

const indirectAuto = DQ_SEGMENTS.find((s) => s.id === 'indirect_auto')!;
const firstMortgage = CONCENTRATION_LIMITS.find((c) => c.id === 'first_mortgage')!;

const stats: Array<StatTile & { publicProfile?: boolean }> = [
  { id: 'assets', label: 'Total assets', value: `$${(PUBLIC_FACTS.totalAssetsM / 1000).toFixed(2)}B`, trend: 'USS FCU public profile', positive: true, icon: Landmark, iconColor: 'text-brand', iconBg: 'bg-brand/10', chipText: ask.dryPowder, publicProfile: true },
  { id: 'net_worth', label: 'Net worth ratio', value: fmtPct(PUBLIC_FACTS.netWorthRatioPct, 2), trend: 'Well capitalized', positive: true, icon: Scale, iconColor: 'text-brand', iconBg: 'bg-brand/10', chipText: ask.dryPowder, publicProfile: true },
  { id: 'loan_to_share', label: 'Loan-to-share', value: `${PUBLIC_FACTS.loanToSharePct}%`, trend: 'Five-year high', positive: false, icon: Percent, iconColor: 'text-warning', iconBg: 'bg-warning-subtle', chipText: ask.dryPowder, publicProfile: true },
  { id: 'indirect_auto_dq', label: 'Indirect auto 60-day delinquency', value: fmtPct(indirectAuto.series[indirectAuto.series.length - 1]), trend: `Above its ${fmtPct(indirectAuto.parameterPct)} parameter`, positive: false, icon: Car, iconColor: 'text-critical', iconBg: 'bg-critical-subtle', chipText: ask.delinquency },
  { id: 'mortgage_concentration', label: 'First mortgage, % of net worth', value: `${Math.round(pctOfNetWorth(firstMortgage.balanceM))}%`, trend: `${firstMortgage.capPctOfNw}% board cap`, positive: false, icon: Home, iconColor: 'text-warning', iconBg: 'bg-warning-subtle', chipText: ask.limits },
  { id: 'seg_deposits', label: 'Core SEG deposits, month over month', value: fmtSignedPct(segTotals().changePct), trend: `1 group past the ${SEG_OUTFLOW_TRIGGER_PCT}% trigger`, positive: false, icon: Users, iconColor: 'text-warning', iconBg: 'bg-warning-subtle', chipText: ask.segDeposits },
];

const manifest: PersonaManifest = {
  id: 'ussfcu_finance',
  clientId: 'ussfcu',
  marketId: 'financial-services',

  identity: { name: 'Finance Team', initials: 'FT', role: 'USS FCU Finance', greeting: 'Finance Team' },
  // The five the narrative's six questions demonstrate, in the order they appear.
  capabilities: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Predictive Intelligence',
    'Anomaly Detection',
    'Automated Action',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',
  signalsComponent: FinanceBriefingSignals as unknown as PersonaManifest['signalsComponent'],
  statsComponent: FinanceKpiRow as unknown as PersonaManifest['statsComponent'],
  features: {
    // Three signal cards and a KPI grid make a tall briefing; top-aligned so the
    // greeting is never pushed off the top.
    topAlignedInitial: true,
    // The segment table, the shock grid and the SEG table want more measure
    // than a chat bubble allows.
    wideInlineComponents: true,
    // Everything this persona does happens in the conversation. Explicit so the
    // financial-services default slots (Member Journey, Risk Signals) — pages
    // built for other personas — do not appear.
    navSlots: ['ask', 'dataSources'],
  },

  ui: {
    greetingFlowKey: K.greeting,
    // "A member of the USS FCU finance team starting the day."
    greetingLabel: 'Good morning',
    inputPlaceholder: 'Ask about delinquency, board limits, rate shocks, liquidity or SEG deposits…',
    initialChips: [ask.delinquency, ask.limits, ask.rateShock, ask.dryPowder, ask.playbook, ask.segDeposits],
    // The narrative's six questions, in its order; the highlight ends after the sixth.
    goldenPathChip: {
      [K.greeting]: ask.delinquency,
      [K.delinquency]: ask.limits,
      [K.limits]: ask.rateShock,
      [K.rateShock]: ask.dryPowder,
      [K.dryPowder]: ask.playbook,
      [K.playbook]: ask.segDeposits,
    },
    flowKeyToCapabilityTrigger: {
      [K.greeting]: 'home_load',
      [K.delinquency]: 'ask_turn_1',
      [K.limits]: 'ask_turn_2',
      [K.rateShock]: 'ask_turn_3',
      [K.dryPowder]: 'ask_turn_4',
      [K.playbook]: 'ask_turn_5',
      [K.segDeposits]: 'ask_turn_6',
    },
    stats,
    // Each opening signal opens the question that answers it.
    signalToChip: {
      'SIG-USSFCU-FIN-001': ask.delinquency,
      'SIG-USSFCU-FIN-002': ask.limits,
      'SIG-USSFCU-FIN-003': ask.rateShock,
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    switch (msg.flowKey) {
      case K.delinquency:
        return [<DelinquencyBySegmentPanel key={`fin-dq-${msg.id}`} />];
      case K.limits:
        return [<ConcentrationLimitsPanel key={`fin-limits-${msg.id}`} />];
      case K.rateShock:
        return [<RateShockMatrix key={`fin-shock-${msg.id}`} />];
      case K.dryPowder:
        return [<CapitalLiquidityStress key={`fin-stress-${msg.id}`} />];
      case K.playbook:
        return [<RatePlaybookLadder key={`fin-playbook-${msg.id}`} />];
      case K.segDeposits:
        return [<SegDepositMonitor key={`fin-seg-${msg.id}`} />];
      default:
        return undefined;
    }
  },
};

export default manifest;
