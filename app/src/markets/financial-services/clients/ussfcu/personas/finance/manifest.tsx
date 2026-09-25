/**
 * Persona: Fiona, USS FCU Finance Team — USSFCU-only.
 *
 * Spec: "Persona and Demo Specification: Finance Team Analyst at USS FCU"
 * (Radiant Digital, Lam Huynh, rev. 2026-09-24, Lauren feedback applied) and
 * the Fiona section of the USSFCU Oral Demo Talk Track v4. Those two are the
 * only source; nothing from the earlier finance narrative remains. No
 * executive title, so the room stays on the questions and the answers rather
 * than on who sees what; the header greets her as "Fiona."
 *
 * The story is seven scripted turns: the morning briefing, then delinquency
 * drift, the board limits, a government shutdown modeled as an employment
 * shock, the capital and liquidity cushion, the shutdown playbook, and the
 * funding side by SEG. The AI text is the spec's own words and the golden
 * path is the talk track's CLICK lines, pinned by
 * data/ussfcu/finance/financeData.test.ts and data/ussfcu/talkTrack.test.ts.
 *
 * Every figure except the public backdrop is illustrative sample data from
 * data/ussfcu/finance/constants.ts, and the briefing says so at the start.
 */

import type { ChatFlowConfig, PersonaManifest } from '@core/types';

import chatFlows from '@/data/ussfcu/finance/chatFlows.json';
import signals from '@/data/ussfcu/finance/signals.json';
import dataSources from '@/data/ussfcu/finance/dataSources.json';
import capabilityCallouts from '@/data/ussfcu/finance/capabilityCallouts.json';
import {
  FINANCE_QUESTIONS,
  FINANCE_CHIPS,
  FOLLOW_UP_CHIPS,
  SUGGESTED_PROMPTS,
  PERSONA,
} from '@/data/ussfcu/finance/constants';
import { financeKpiTiles } from '@/data/ussfcu/finance/kpiTiles';

import FinanceBriefingSignals from '@/components/ussfcu/finance/FinanceBriefingSignals';
import FinanceKpiRow from '@/components/ussfcu/finance/FinanceKpiRow';
import DelinquencyTrend from '@/components/ussfcu/finance/DelinquencyTrend';
import PortfolioLimitChart from '@/components/ussfcu/finance/PortfolioLimitChart';
import ScenarioImpactTable from '@/components/ussfcu/finance/ScenarioImpactTable';
import CapitalLiquidityGauges from '@/components/ussfcu/finance/CapitalLiquidityGauges';
import PlaybookActionTable from '@/components/ussfcu/finance/PlaybookActionTable';
import SegDepositPanel from '@/components/ussfcu/finance/SegDepositPanel';

const ask = FINANCE_CHIPS;
const full = FINANCE_QUESTIONS;
const more = FOLLOW_UP_CHIPS;
const [promptDq, promptLimits, promptShutdown, promptCushion, promptRateMove] = SUGGESTED_PROMPTS;

const K = {
  greeting: 'ussfcu_finance_greeting',
  delinquency: 'ussfcu_finance_turn_delinquency',
  limits: 'ussfcu_finance_turn_limits',
  shutdown: 'ussfcu_finance_turn_shutdown',
  cushion: 'ussfcu_finance_turn_cushion',
  playbook: 'ussfcu_finance_turn_playbook',
  segDeposits: 'ussfcu_finance_turn_seg_deposits',
  hilDriver: 'ussfcu_finance_followup_hil_driver',
  runOff: 'ussfcu_finance_followup_run_off',
  exportBriefing: 'ussfcu_finance_followup_export',
  alcoSummary: 'ussfcu_finance_followup_alco_summary',
  retention: 'ussfcu_finance_followup_retention',
  signals: 'ussfcu_finance_followup_signals',
} as const;

const flows: ChatFlowConfig = {
  chatFlows: chatFlows as unknown as ChatFlowConfig['chatFlows'],
  chipToFlowKey: {
    // The talk track's CLICK lines.
    [ask.delinquency]: K.delinquency,
    [ask.limits]: K.limits,
    [ask.shutdown]: K.shutdown,
    [ask.cushion]: K.cushion,
    [ask.playbook]: K.playbook,
    [ask.segDeposits]: K.segDeposits,
    // The spec's full questions, for a presenter who types or pastes them.
    [full.delinquency]: K.delinquency,
    [full.limits]: K.limits,
    [full.shutdown]: K.shutdown,
    [full.cushion]: K.cushion,
    [full.playbook]: K.playbook,
    [full.segDeposits]: K.segDeposits,
    // §11 suggested prompts. The rate-move prompt keeps its spec wording and
    // opens the shutdown playbook, the only playbook in this story.
    [promptDq]: K.delinquency,
    [promptLimits]: K.limits,
    [promptShutdown]: K.shutdown,
    [promptCushion]: K.cushion,
    [promptRateMove]: K.playbook,
    // §10 follow-ups that mean the same as a scripted turn open that turn.
    [more.ratesAndLiquidity]: K.shutdown,
    [more.downsideOnPool]: K.shutdown,
    [more.capitalHeadroom]: K.cushion,
    // §10 follow-ups with no scripted answer get a short one from spec figures.
    [more.hilDriver]: K.hilDriver,
    [more.runOff]: K.runOff,
    [more.exportThis]: K.exportBriefing,
    [more.exportBriefing]: K.exportBriefing,
    [more.alcoSummary]: K.alcoSummary,
    [more.retentionAction]: K.retention,
    [more.backToSignals]: K.signals,
  },
  askTurnSequence: [K.delinquency, K.limits, K.shutdown, K.cushion, K.playbook, K.segDeposits],
  // The briefing's three signal cards open their turns directly; there is no
  // "walk me through them" signal tour in this script.
  signalSequence: [],
  // Only what is scripted answers. Anything else typed falls to __default__,
  // which names the steps, rather than to a turn that shares a word.
  strictMatch: true,
};

const manifest: PersonaManifest = {
  id: 'ussfcu_finance',
  clientId: 'ussfcu',
  marketId: 'financial-services',

  identity: { name: PERSONA.name, initials: PERSONA.initials, role: PERSONA.role, greeting: PERSONA.greeting },
  // Spec §1: all six tags are demonstrated across the flow, in step order.
  capabilities: [
    'Proactive Intelligence',
    'Anomaly Detection',
    'Converged Conversation',
    'Predictive Intelligence',
    'Friction Observability',
    'Automated Action',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',
  signalsComponent: FinanceBriefingSignals as unknown as PersonaManifest['signalsComponent'],
  statsComponent: FinanceKpiRow as unknown as PersonaManifest['statsComponent'],
  features: {
    // Three signal cards and eight KPI tiles make a tall briefing; top-aligned
    // so the greeting is never pushed off the top.
    topAlignedInitial: true,
    // The trend chart, limit bars, gauges and SEG table want more measure than
    // a chat bubble allows.
    wideInlineComponents: true,
    // Spec §12: the briefing home, Portfolio and Limits, Scenarios and ALM,
    // and Data sources.
    navSlots: ['ask', 'portfolioRisk', 'scenarios', 'dataSources'],
  },

  ui: {
    greetingFlowKey: K.greeting,
    // Header: "Good morning, Fiona" — matches the opening line under it.
    greetingLabel: 'Good morning',
    inputPlaceholder: 'Ask about delinquency, board limits, a shutdown scenario, capital and liquidity, or SEG deposits…',
    // §11 suggested query prompts (typeahead and the pre-greeting row).
    initialChips: [...SUGGESTED_PROMPTS],
    // Talk Track v4, Fiona's CLICK lines in order; the highlight ends at Step 7.
    goldenPathChip: {
      [K.greeting]: ask.delinquency,
      [K.delinquency]: ask.limits,
      [K.limits]: ask.shutdown,
      [K.shutdown]: ask.cushion,
      [K.cushion]: ask.playbook,
      [K.playbook]: ask.segDeposits,
    },
    // One tag per response. Steps map to their own callout; follow-ups share
    // the callout of the step that carries the same capability.
    flowKeyToCapabilityTrigger: {
      [K.greeting]: 'home_load',
      [K.delinquency]: 'ask_turn_1',
      [K.limits]: 'ask_turn_2',
      [K.shutdown]: 'ask_turn_3',
      [K.cushion]: 'ask_turn_4',
      [K.playbook]: 'ask_turn_5',
      [K.segDeposits]: 'ask_turn_6',
      [K.hilDriver]: 'ask_turn_1',
      [K.runOff]: 'ask_turn_2',
      [K.exportBriefing]: 'ask_turn_5',
      [K.alcoSummary]: 'ask_turn_5',
      [K.retention]: 'ask_turn_6',
      [K.signals]: 'home_load',
    },
    stats: financeKpiTiles(),
    // Each opening signal opens the turn that answers it (its §6 "Action").
    signalToChip: {
      'SIG-USSFCU-FIN-001': ask.delinquency,
      'SIG-USSFCU-FIN-002': ask.limits,
      'SIG-USSFCU-FIN-003': ask.shutdown,
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    switch (msg.flowKey) {
      case K.delinquency:
        return [<DelinquencyTrend key={`fin-dq-${msg.id}`} />];
      case K.limits:
        return [<PortfolioLimitChart key={`fin-limits-${msg.id}`} />];
      case K.shutdown:
        return [<ScenarioImpactTable key={`fin-shutdown-${msg.id}`} />];
      case K.cushion:
        return [<CapitalLiquidityGauges key={`fin-cushion-${msg.id}`} />];
      case K.playbook:
        return [<PlaybookActionTable key={`fin-playbook-${msg.id}`} />];
      case K.segDeposits:
        return [<SegDepositPanel key={`fin-seg-${msg.id}`} />];
      default:
        return undefined;
    }
  },
};

export default manifest;
