/**
 * Persona: Quality & Customer Experience Analyst (Aisha Karim) — Newfold Digital.
 *
 * Monitors contact quality, agent compliance, and sentiment across all brands. A
 * 4-step flow: the auto-renewal disclosure compliance gap (macro-change timeline +
 * shift heatmap), the remediation actions, and the refund repeat-contact
 * correlation to the underlying IT billing-sync delay.
 */
import { Award, ClipboardCheck, CheckCircle2, Frown, RefreshCw, Star } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/newfold-digital/quality/signals.json';
import dataSources from '@/data/newfold-digital/_shared/dataSources.json';
import capabilityCallouts from '@/data/newfold-digital/quality/capabilityCallouts.json';

import DisclosureTimelineHeatmap from '@/components/newfold/quality/DisclosureTimelineHeatmap';
import RemediationActions from '@/components/newfold/quality/RemediationActions';
import RepeatContactCorrelation from '@/components/newfold/quality/RepeatContactCorrelation';

const flows = (getPersonaFlowConfigs('newfold_digital') as unknown as Record<string, PersonaManifest['flows']>).newfold_quality;

const manifest: PersonaManifest = {
  id: 'newfold_quality',
  clientId: 'newfold_digital',
  marketId: 'commercial',

  identity: { name: 'Aisha Karim', initials: 'AK', role: 'Quality & Customer Experience Analyst', greeting: 'Aisha' },
  capabilities: ['Proactive Intelligence', 'Converged Conversation', 'Anomaly Detection', 'Automated Action'],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',

  ui: {
    greetingFlowKey: 'newfold_qa_greeting',
    initialChips: [
      'Show me quality scores by team this week',
      'Which agents need coaching?',
      'What are the top 5 contact drivers today?',
      'Show me sentiment trends by brand',
      'Compare first contact resolution this month versus last month',
      'Which process steps have the lowest adherence?',
      'Show me refund and billing complaints by category',
      'Generate a quality scorecard for my leadership meeting',
    ],
    goldenPathChip: {
      newfold_qa_greeting: 'Walk me through the compliance issue',
      newfold_qa_compliance: 'Recommend a fix',
      newfold_qa_fix: 'Next signal, the repeat contacts',
      newfold_qa_repeat: 'What should we tell agents?',
    },
    flowKeyToCapabilityTrigger: {
      newfold_qa_greeting: 'home_load',
      newfold_qa_compliance: 'ask_turn_1',
      newfold_qa_remediation: 'ask_turn_1',
      newfold_qa_agent_breakdown: 'ask_turn_1',
      newfold_qa_posture: 'ask_turn_1',
      newfold_qa_lowest_adherence: 'ask_turn_1',
      newfold_qa_fix: 'ask_turn_2',
      newfold_qa_macro_revert: 'ask_turn_2',
      newfold_qa_callbacks: 'ask_turn_2',
      newfold_qa_incident_report: 'ask_turn_2',
      newfold_qa_scorecard: 'ask_turn_2',
      newfold_qa_repeat: 'ask_turn_3',
      newfold_qa_tell_agents: 'ask_turn_3',
      newfold_qa_review_impact: 'ask_turn_3',
      newfold_qa_it_fix: 'ask_turn_3',
      newfold_qa_cost: 'ask_turn_3',
      newfold_qa_at_risk: 'ask_turn_1',
      newfold_qa_scores_team: 'ask_turn_1',
      newfold_qa_coaching: 'ask_turn_1',
      newfold_qa_top_drivers: 'ask_turn_1',
      newfold_qa_sentiment_brand: 'ask_turn_1',
      newfold_qa_fcr_compare: 'ask_turn_1',
      newfold_qa_complaints_category: 'ask_turn_1',
    },
    stats: [
      { id: 'quality', label: 'Quality Score (30d)', value: '81/100', trend: '-2, cancel/refund teams', positive: false, icon: Award, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Show me quality scores by team this week' },
      { id: 'adherence', label: 'Process Adherence', value: '76%', trend: 'Disclosure skip driving it', positive: false, icon: ClipboardCheck, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Which process steps have the lowest adherence?' },
      { id: 'fcr', label: 'First Contact Resolution', value: '67%', trend: '-2 pts, refunds', positive: false, icon: CheckCircle2, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Compare first contact resolution this month versus last month' },
      { id: 'sentiment', label: 'Negative Sentiment Rate', value: '20%', trend: '+3 pts', positive: false, icon: Frown, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Show me sentiment trends by brand' },
      { id: 'repeat', label: 'Repeat Contact Rate (48h)', value: '24%', trend: 'Refund sync delay', positive: false, icon: RefreshCw, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Show me the repeat-contact data' },
      { id: 'reviews', label: 'Reviews & Complaints (MTD)', value: '612', trend: 'Customer Voice + review feed', positive: false, icon: Star, iconColor: 'text-text-muted', iconBg: 'bg-surface-2', chipText: 'Show me refund and billing complaints by category' },
    ],
    signalToChip: {
      'SIG-NEWFOLD-QA-001': 'Walk me through the compliance issue',
      'SIG-NEWFOLD-QA-002': 'Next signal, the repeat contacts',
      'SIG-NEWFOLD-QA-003': 'Which agents are at risk?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey;
    // Greeting shows the message + the compact PRIORITY SIGNALS strip only; the
    // full signal detail appears when a priority tile is clicked.
    if (k === 'newfold_qa_compliance' || k === 'newfold_qa_agent_breakdown' || k === 'newfold_qa_lowest_adherence') out.push(<DisclosureTimelineHeatmap key="disclosure" />);
    if (k === 'newfold_qa_fix' || k === 'newfold_qa_remediation' || k === 'newfold_qa_macro_revert') out.push(<RemediationActions key="remediation" />);
    if (k === 'newfold_qa_repeat' || k === 'newfold_qa_review_impact' || k === 'newfold_qa_it_fix') out.push(<RepeatContactCorrelation key="correlation" />);
    return out.length ? out : undefined;
  },
};

export default manifest;
