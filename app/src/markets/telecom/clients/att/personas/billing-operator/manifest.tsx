/**
 * Persona: Billing Operator — AI Billing Workbench (illustrative).
 *
 * Spec §10A, seven scripted turns: where does the cycle stand → group the 207
 * anomalies → open the hero pattern → trust the number → look ahead → take the
 * action → close and prove it.
 *
 * The whole demo turns on one moment: 207 individually-flagged anomalies become
 * six decisions, and one of them is safe enough to execute in bulk. Everything
 * in this manifest exists to make that moment legible — the pattern grid, the
 * per-account confidence, and the audit trail written as she acts.
 *
 * Every figure is illustrative. There is no named customer behind this data
 * (spec §2); see the Data Sources screen for the full statement.
 */
import { AlertTriangle, Layers, DollarSign, Target, Timer, CheckCircle2, Clock, Gauge } from 'lucide-react';
import type { ComponentType } from 'react';
import type { PersonaManifest, StatTile } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import { getCurrentState, getJourney } from '@/data/att/billing-operator';
import signals from '@/data/att/billing-operator/signals.json';
import kpis from '@/data/att/billing-operator/kpis.json';
import capabilityCallouts from '@/data/att/billing-operator/capabilityCallouts.json';
import dataSources from '@/data/att/_shared/dataSources.json';

import CycleOverviewCards from '@/components/att/CycleOverviewCards';
import BusinessImpactStrip from '@/components/att/BusinessImpactStrip';
import PatternCardGrid from '@/components/att/PatternCardGrid';
import PatternDetailPanel from '@/components/att/PatternDetailPanel';
import ResolutionLogPanel from '@/components/att/ResolutionLogPanel';
import CurrentStateDiagram from '@/components/process/CurrentStateDiagram';
import JourneyMap from '@/components/process/JourneyMap';

const flows = (getPersonaFlowConfigs('att') as unknown as Record<string, PersonaManifest['flows']>)
  .att_billing_operator;

/**
 * KPI presentation, keyed by the id in kpis.json. Values, sources, targets and
 * freshness stay in the fixture; only the icon and its tint live here, because
 * a lucide component cannot be expressed in JSON.
 */
const KPI_PRESENTATION: Record<string, { icon: ComponentType<Record<string, unknown>>; iconColor: string; iconBg: string }> = {
  total_anomalies: { icon: AlertTriangle, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  in_patterns: { icon: Layers, iconColor: 'text-brand', iconBg: 'bg-brand/10' },
  revenue_at_risk: { icon: DollarSign, iconColor: 'text-rose-600', iconBg: 'bg-rose-500/10' },
  avg_confidence: { icon: Target, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
  sla_remaining: { icon: Timer, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  auto_corrected: { icon: CheckCircle2, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
  pending_review: { icon: Clock, iconColor: 'text-slate-500', iconBg: 'bg-slate-500/10' },
  detection_accuracy: { icon: Gauge, iconColor: 'text-brand', iconBg: 'bg-brand/10' },
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
  id: 'att_billing_operator',
  clientId: 'att',
  marketId: 'telecom',

  identity: {
    name: 'Bianca R.',
    initials: 'BR',
    role: 'Billing Operator — Anomaly Resolution',
    greeting: 'Bianca',
  },
  capabilities: [
    'Proactive Intelligence',
    'Anomaly Detection',
    'Converged Conversation',
    'Friction Observability',
    'Predictive Intelligence',
    'Automated Action',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',

  features: {
    // Spec §12's operator routes, in demo order. Journey/risk/governance are
    // not borrowed — this client has its own.
    navSlots: ['ask', 'patterns', 'dashboard', 'history', 'dataSources'],
    // The answers here render six-card grids and an 87-row table. At the
    // default 3xl measure those scroll horizontally inside a column with room
    // to spare either side.
    wideInlineComponents: true,
    // Eight KPI tiles plus three signal cards is a tall briefing; centering it
    // pushes the greeting off the top on shorter viewports.
    topAlignedInitial: true,
  },

  ui: {
    greetingFlowKey: 'att_op_greeting',
    contentMaxWidth: 'max-w-6xl',
    inputPlaceholder: 'Ask about the cycle, a pattern, a root cause, or what happens if you wait…',
    // Spec §11A suggested prompts, plus the process/journey entry points.
    initialChips: [
      'Where does this cycle stand and how much time do I have?',
      'Show me the anomaly patterns by dollar impact',
      'Open the Missing AutoPay Discount pattern and explain the root cause',
      'Can I trust these corrections before I apply them?',
      'Apply the fix to all eligible accounts and log it for audit',
      'What is my fastest path to close the cycle?',
      'How does this work today, without the workbench?',
      'Walk me through my cycle',
    ],
    // The golden path walks the spec's seven turns. Every value is a chip that
    // exists in that turn's suggested_chips.
    //
    // One deviation worth naming: step 4 (trust) points at "Apply Fix to All"
    // rather than at step 5 (look ahead), because §10A's step-4 follow-ups do
    // not offer step 5's question. The full 7-turn order lives in
    // `askTurnSequence`, which is what the guided runner walks.
    goldenPathChip: {
      att_op_greeting: 'Show me the patterns',
      att_op_patterns: 'Open Missing AutoPay Discount',
      att_op_hero_pattern: 'Can I trust these corrections?',
      att_op_trust: 'Apply Fix to All',
      att_op_look_ahead: 'Apply Fix to All',
      att_op_apply_fix: 'Summarize what I have resolved',
      att_op_close_and_prove: 'Export as PDF',
      att_op_biggest_risk: 'Show me the patterns',
      att_op_sla_remaining: 'Show me the patterns',
      att_op_sort_by_impact: 'Open Missing AutoPay Discount',
      att_op_highest_confidence: 'Open Missing AutoPay Discount',
      att_op_low_confidence_rows: 'Apply to accounts above 90% only',
      att_op_apply_above_90: 'Escalate the low-confidence accounts',
      att_op_escalate_low: 'Summarize what I have resolved',
      att_op_next_pattern: 'Summarize what I have resolved',
      att_op_fastest_path: 'Apply Fix to All',
      att_op_export_audit: 'Export as PDF',
      att_op_export_pdf: 'Show escalated items',
      att_op_escalated_items: 'Return to cycle overview',
      att_op_return_overview: 'Show me the patterns',
      att_op_current_state: 'Where does the workbench change the picture?',
      att_op_future_state: 'Walk me through my cycle',
      att_op_journey: 'Show me the patterns',
    },
    // All six capabilities across the seven turns, per spec §1.
    flowKeyToCapabilityTrigger: {
      att_op_greeting: 'home_load',
      att_op_return_overview: 'home_load',
      att_op_patterns: 'ask_turn_1',
      att_op_sort_by_impact: 'ask_turn_1',
      att_op_biggest_risk: 'ask_turn_1',
      att_op_next_pattern: 'ask_turn_1',
      att_op_hero_pattern: 'ask_turn_2',
      att_op_future_state: 'ask_turn_2',
      att_op_journey: 'ask_turn_2',
      att_op_trust: 'ask_turn_3',
      att_op_highest_confidence: 'ask_turn_3',
      att_op_low_confidence_rows: 'ask_turn_3',
      att_op_escalated_items: 'ask_turn_3',
      att_op_current_state: 'ask_turn_3',
      att_op_look_ahead: 'ask_turn_4',
      att_op_sla_remaining: 'ask_turn_4',
      att_op_fastest_path: 'ask_turn_4',
      att_op_apply_fix: 'ask_turn_5',
      att_op_apply_above_90: 'ask_turn_5',
      att_op_escalate_low: 'ask_turn_5',
      att_op_close_and_prove: 'ask_turn_5',
      att_op_export_audit: 'ask_turn_5',
      att_op_export_pdf: 'ask_turn_5',
    },
    stats,
    signalToChip: {
      'SIG-ATT-OPS-001': 'Open Missing AutoPay Discount',
      'SIG-ATT-OPS-002': 'Open Duplicate Device Installments',
      'SIG-ATT-OPS-003': 'What is the biggest dollar risk?',
      'SIG-ATT-OPS-004': 'Show me the patterns',
      'SIG-ATT-OPS-005': 'Which has the highest confidence?',
      'SIG-ATT-OPS-006': 'Show me the patterns',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  // Visualizations per spec §10A/§13, attached by flowKey rather than declared
  // in the chat JSON, so the script stays pure content and components stay typed.
  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey as string | undefined;

    // Step 1 — situational briefing. Scope and clock, then the modeled impact.
    if (k === 'att_op_greeting' || k === 'att_op_return_overview' || k === 'att_op_sla_remaining') {
      out.push(<CycleOverviewCards key="cycle-overview" />);
    }
    if (k === 'att_op_greeting') {
      out.push(<BusinessImpactStrip key="business-impact" />);
    }

    // Step 2 — 207 anomalies as six decisions.
    if (k === 'att_op_patterns' || k === 'att_op_sort_by_impact' || k === 'att_op_biggest_risk' || k === 'att_op_highest_confidence') {
      out.push(<PatternCardGrid key="patterns" />);
    }

    // Step 3 — the hero pattern drill-in: root cause, projection, 87 rows.
    if (k === 'att_op_hero_pattern') {
      out.push(<PatternDetailPanel key="hero-detail" />);
    }
    // The next-pattern turn is about Duplicate Device Installments, so it has
    // to render PATTERN-002's 34 rows — not the hero's 87.
    if (k === 'att_op_next_pattern') {
      out.push(<PatternDetailPanel key="next-detail" patternId="PATTERN-002" />);
    }

    // Step 4 — trust: the reconciliation and the confidence distribution.
    if (k === 'att_op_trust') {
      out.push(<PatternDetailPanel key="hero-trust" mode="trust" />);
    }
    if (k === 'att_op_low_confidence_rows') {
      out.push(<PatternDetailPanel key="hero-low" mode="lowConf" />);
    }

    // Step 5 — look ahead: the projection against the SLA clock.
    if (k === 'att_op_look_ahead' || k === 'att_op_fastest_path') {
      out.push(<PatternDetailPanel key="hero-impact" mode="impact" />);
    }

    // Step 6 — the success state, then the audit rows it just wrote.
    if (k === 'att_op_apply_fix') {
      out.push(
        <ResolutionLogPanel
          key="audit-applied"
          success={{
            title: 'Missing AutoPay Discount — cleared',
            stats: [
              { value: '87', label: 'accounts corrected' },
              { value: '$850.14', label: 'returned to customers' },
              { value: '93%', label: 'average confidence' },
              { value: '0', label: 'failures' },
            ],
          }}
        />,
      );
    }
    if (k === 'att_op_apply_above_90') {
      out.push(
        <ResolutionLogPanel
          key="audit-partial"
          success={{
            title: 'Applied to the 70 accounts at or above 90%',
            stats: [
              { value: '70', label: 'accounts corrected' },
              { value: '$683.29', label: 'returned to customers' },
              { value: '17', label: 'held, not dropped' },
              { value: '0', label: 'failures' },
            ],
          }}
        />,
      );
    }
    if (k === 'att_op_escalate_low') {
      out.push(
        <ResolutionLogPanel
          key="audit-escalated"
          success={{
            title: '17 accounts escalated to SME review',
            stats: [
              { value: '17', label: 'accounts escalated' },
              { value: '$0', label: 'written to bills' },
              { value: '3', label: 'evidence artefacts attached' },
              { value: '—', label: 'resolves outside this cycle' },
            ],
          }}
        />,
      );
    }
    // Step 7 — close and prove: session tiles plus the export action.
    if (k === 'att_op_close_and_prove' || k === 'att_op_export_audit' || k === 'att_op_export_pdf') {
      out.push(<ResolutionLogPanel key="audit-summary" withSummary withExport />);
    }
    if (k === 'att_op_escalated_items') {
      out.push(<ResolutionLogPanel key="audit-escalated-only" filterStatus="Escalated" />);
    }

    // Spec §8A — how a cycle is cleared today, and the five interventions.
    if (k === 'att_op_current_state' || k === 'att_op_future_state') {
      out.push(
        <CurrentStateDiagram
          key="current-state"
          getter={getCurrentState}
          productName="AI Billing Workbench"
          gapLegend="Outside any system — the trust gap"
        />,
      );
    }

    // Spec §9A — the operator's four-phase cycle journey.
    if (k === 'att_op_journey') {
      out.push(
        <JourneyMap
          key="journey"
          getter={getJourney}
          title="Billing Operator — Cycle Journey"
          idleHint="Hover a phase for its pain points, the operator's own words, and the opportunity that answers them. The emotional low is Phase 1 — the cycle opening with no sense of scope — and the payoff is Phase 4, one reviewed action landing in an audit log."
        />,
      );
    }

    return out.length ? out : undefined;
  },
};

export default manifest;
