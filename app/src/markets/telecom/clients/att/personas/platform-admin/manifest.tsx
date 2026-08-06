/**
 * Persona: Platform Admin — AI Billing Workbench (illustrative).
 *
 * Spec §10B, six scripted turns: is the fleet healthy → why is Root Cause
 * Analysis degraded → what is actually breaking → will retraining help and by
 * how much → tune the guardrail → commit the action.
 *
 * The admin surface is more control panel than chat, so these turns are
 * query-driven jumps into the relevant console panel rather than a narrative.
 * What holds them together is one judgment: trust versus throughput. Set the
 * auto-resolve threshold too high and operators drown in review; too low and
 * wrong corrections reach customers.
 *
 * Every figure is illustrative (spec §2).
 */
import { Activity, Target, Gauge, Timer, AlertTriangle, Layers, Users, Brain } from 'lucide-react';
import type { ComponentType } from 'react';
import type { PersonaManifest, StatTile } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import { getCurrentState, getJourney } from '@/data/att/platform-admin';
import signals from '@/data/att/platform-admin/signals.json';
import kpis from '@/data/att/platform-admin/kpis.json';
import capabilityCallouts from '@/data/att/platform-admin/capabilityCallouts.json';
import dataSources from '@/data/att/_shared/dataSources.json';

import {
  AgentFleetPanel,
  LatencyDiagnosisPanel,
  RootCausePanel,
  RetrainingPanel,
  RetrainingInProgressPanel,
  ThresholdPanel,
  AdvancedSettingsPanel,
} from '@/components/att/AdminInlinePanels';
import CurrentStateDiagram from '@/components/process/CurrentStateDiagram';
import JourneyMap from '@/components/process/JourneyMap';

const flows = (getPersonaFlowConfigs('att') as unknown as Record<string, PersonaManifest['flows']>)
  .att_platform_admin;

const KPI_PRESENTATION: Record<string, { icon: ComponentType<Record<string, unknown>>; iconColor: string; iconBg: string }> = {
  uptime: { icon: Activity, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
  avg_confidence: { icon: Target, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
  fleet_accuracy: { icon: Gauge, iconColor: 'text-brand', iconBg: 'bg-brand/10' },
  fleet_latency: { icon: Timer, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
  failure_rate: { icon: AlertTriangle, iconColor: 'text-rose-600', iconBg: 'bg-rose-500/10' },
  total_inferences: { icon: Layers, iconColor: 'text-brand', iconBg: 'bg-brand/10' },
  active_operators: { icon: Users, iconColor: 'text-slate-500', iconBg: 'bg-slate-500/10' },
  training_quality: { icon: Brain, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
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
  id: 'att_platform_admin',
  clientId: 'att',
  marketId: 'telecom',

  identity: {
    name: 'Aria N.',
    initials: 'AN',
    role: 'Platform Admin — System Configuration',
    greeting: 'Aria',
  },
  capabilities: [
    'Proactive Intelligence',
    'Friction Observability',
    'Converged Conversation',
    'Predictive Intelligence',
    'Automated Action',
    'Anomaly Detection',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',

  features: {
    navSlots: ['ask', 'adminConsole', 'agentObservability', 'dataSources'],
    wideInlineComponents: true,
    topAlignedInitial: true,
  },

  ui: {
    greetingFlowKey: 'att_adm_greeting',
    contentMaxWidth: 'max-w-6xl',
    inputPlaceholder: 'Ask about agent health, root causes, thresholds, or the next retrain…',
    // Spec §11B suggested prompts, plus the process/journey entry points.
    initialChips: [
      'Are all the AI agents healthy right now?',
      'Why is response time elevated on the Root Cause Analysis agent?',
      'What is the dominant root cause of anomalies this cycle?',
      'Will the next retraining improve tax-rule detection, and by how much?',
      'Raise the auto-resolve threshold and show me the review-load trade-off',
      'Should I retrain early?',
      'How does platform tuning work today, without the console?',
      'Walk me through the decision',
    ],
    // Walks the spec's six turns. One deviation: step 5 (threshold) does not
    // offer step 6's question in §10B, so the golden path continues to
    // "Confirm and save" and the full order lives in `askTurnSequence`.
    goldenPathChip: {
      att_adm_greeting: 'Why is Root Cause Analysis degraded?',
      att_adm_diagnose: 'What is causing the anomalies themselves?',
      att_adm_root_causes: 'Will retraining improve tax detection?',
      att_adm_forecast: 'Raise the auto-resolve threshold',
      att_adm_threshold: 'Confirm and save',
      att_adm_confirm_save: 'Return to agent health',
      att_adm_latency_trends: 'Should I retrain early?',
      att_adm_error_history: 'Should I retrain early?',
      att_adm_should_retrain: 'Trigger early retraining',
      att_adm_harden_sync: 'Trigger early retraining',
      att_adm_agents_by_cause: 'Will retraining improve tax detection?',
      att_adm_keep_schedule: 'Raise the auto-resolve threshold',
      att_adm_keep_90: 'Require SME approval for high-risk',
      att_adm_sme_high_risk: 'Save all configuration',
      att_adm_retrain: 'Notify operators',
      att_adm_notify_operators: 'Save all configuration',
      att_adm_save_all: 'Return to agent health',
      att_adm_return_health: 'Why is Root Cause Analysis degraded?',
      att_adm_current_state: 'Where does the console change the picture?',
      att_adm_future_state: 'Walk me through the decision',
      att_adm_journey: 'Why is Root Cause Analysis degraded?',
    },
    flowKeyToCapabilityTrigger: {
      att_adm_greeting: 'home_load',
      att_adm_return_health: 'home_load',
      att_adm_diagnose: 'ask_turn_1',
      att_adm_latency_trends: 'ask_turn_1',
      att_adm_error_history: 'ask_turn_1',
      att_adm_keep_90: 'ask_turn_1',
      att_adm_current_state: 'ask_turn_1',
      att_adm_root_causes: 'ask_turn_2',
      att_adm_future_state: 'ask_turn_2',
      att_adm_journey: 'ask_turn_2',
      att_adm_forecast: 'ask_turn_3',
      att_adm_should_retrain: 'ask_turn_3',
      att_adm_harden_sync: 'ask_turn_3',
      att_adm_keep_schedule: 'ask_turn_3',
      att_adm_threshold: 'ask_turn_4',
      att_adm_confirm_save: 'ask_turn_4',
      att_adm_retrain: 'ask_turn_4',
      att_adm_notify_operators: 'ask_turn_4',
      att_adm_save_all: 'ask_turn_4',
      att_adm_sme_high_risk: 'ask_turn_4',
      att_adm_agents_by_cause: 'ask_turn_5',
    },
    stats,
    signalToChip: {
      'SIG-ATT-ADM-001': 'Why is Root Cause Analysis degraded?',
      'SIG-ATT-ADM-002': 'What is driving anomalies this cycle?',
      'SIG-ATT-ADM-003': 'Will retraining improve detection, and by how much?',
      'SIG-ATT-ADM-004': 'Raise the auto-resolve threshold',
      'SIG-ATT-ADM-005': 'Save all configuration',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  // Each turn renders the console panel it is talking about (spec §10B: "treat
  // these as query-driven jumps into the relevant console panel").
  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey as string | undefined;

    // Step 1 — fleet health.
    if (k === 'att_adm_greeting' || k === 'att_adm_return_health' || k === 'att_adm_agents_by_cause') {
      out.push(<AgentFleetPanel key="fleet" />);
    }

    // Step 2 — the diagnosis: the tail moved, not the mean.
    if (k === 'att_adm_diagnose') {
      out.push(<LatencyDiagnosisPanel key="diagnosis" />);
    }
    if (k === 'att_adm_latency_trends') {
      out.push(<LatencyDiagnosisPanel key="latency" withFailure={false} withAccuracy />);
    }
    if (k === 'att_adm_error_history') {
      out.push(<LatencyDiagnosisPanel key="errors" withFailure />);
    }

    // Step 3 — what is actually breaking.
    if (k === 'att_adm_root_causes' || k === 'att_adm_harden_sync') {
      out.push(<RootCausePanel key="root-causes" />);
    }

    // Step 4 — the forecast, beside the record it is measured against.
    if (k === 'att_adm_forecast' || k === 'att_adm_should_retrain' || k === 'att_adm_keep_schedule') {
      out.push(<RetrainingPanel key="retraining" />);
    }

    // Step 6 — the commit: retraining in progress, with its governance entry.
    if (k === 'att_adm_retrain' || k === 'att_adm_notify_operators') {
      out.push(<RetrainingInProgressPanel key="retraining-live" />);
    }

    // Steps 5 and 6 — the guardrail, with its review-load projection.
    if (k === 'att_adm_threshold' || k === 'att_adm_confirm_save' || k === 'att_adm_keep_90' || k === 'att_adm_sme_high_risk') {
      out.push(<ThresholdPanel key="thresholds" />);
    }
    // "Save all configuration" covers the guardrails *and* the switches, so it
    // shows both rather than implying only the thresholds were written.
    if (k === 'att_adm_save_all') {
      out.push(<ThresholdPanel key="thresholds-saved" />);
      out.push(<AdvancedSettingsPanel key="advanced-saved" />);
    }

    // Spec §8B — how platform tuning happens without the console.
    if (k === 'att_adm_current_state' || k === 'att_adm_future_state') {
      out.push(
        <CurrentStateDiagram
          key="current-state"
          getter={getCurrentState}
          productName="AI Billing Workbench"
          gapLegend="Outside any system — the attribution gap"
        />,
      );
    }

    // Spec §9B — notice → diagnose → decide.
    if (k === 'att_adm_journey') {
      out.push(
        <JourneyMap
          key="journey"
          getter={getJourney}
          title="Platform Admin — Warning to Decision"
          idleHint="Hover a phase for its pain points, the admin's own words, and the opportunity that answers them. The whole arc is three phases long because the console's claim is that a warning should explain itself before it reaches a second one."
        />,
      );
    }

    return out.length ? out : undefined;
  },
};

export default manifest;
