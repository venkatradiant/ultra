/**
 * Persona: VP Compliance & Public Policy (Evelyn Marsh) — USSFCU-only. The
 * Risk & Compliance story at population altitude: the deep compliance query, the
 * regulatory tests, and the member-specific disclosure checklist + calendar.
 * Inline layout (visuals compose into the chat thread), 8 KPIs via the carousel.
 */

import { ClipboardList, Scale, Clock, ShieldCheck, TrendingUp, CalendarDays, Target, Database } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/ussfcu/evelyn/signals.json';
import dataSources from '@/data/ussfcu/evelyn/dataSources.json';
import capabilityCallouts from '@/data/ussfcu/evelyn/capabilityCallouts.json';
import regulatoryTests from '@/data/ussfcu/evelyn/regulatoryTests.json';
import disclosureChecklist from '@/data/ussfcu/evelyn/disclosureChecklist.json';
import disclosureCalendar from '@/data/ussfcu/evelyn/disclosureCalendar.json';

import SignalCard from '@/components/cards/SignalCard';
import CapmKpiCarousel from '@/components/penfed/capmarkets/CapmKpiCarousel';
import ComplianceDeepQueryResult from '@/components/ussfcu/evelyn/ComplianceDeepQueryResult';
import RankedRiskList from '@/components/ussfcu/evelyn/RankedRiskList';
import AttritionBreakdown from '@/components/ussfcu/evelyn/AttritionBreakdown';
import ExamEvidencePackage from '@/components/ussfcu/evelyn/ExamEvidencePackage';
import ComplaintTrendPanel from '@/components/ussfcu/evelyn/ComplaintTrendPanel';
import BatchDisclosureNotifier from '@/components/ussfcu/evelyn/BatchDisclosureNotifier';
import RegulatoryTestPanel from '@/components/ussfcu/compliance/RegulatoryTestPanel';
import DisclosureChecklist from '@/components/ussfcu/compliance/DisclosureChecklist';
import DisclosureCalendar from '@/components/ussfcu/compliance/DisclosureCalendar';

const flows = (getPersonaFlowConfigs('ussfcu') as unknown as Record<string, PersonaManifest['flows']>).ussfcu_evelyn;

const manifest: PersonaManifest = {
  id: 'ussfcu_evelyn',
  clientId: 'ussfcu',
  marketId: 'financial-services',

  identity: { name: 'Evelyn Marsh', initials: 'EM', role: 'VP, Compliance & Public Policy', greeting: 'Evelyn' },
  capabilities: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Anomaly Detection',
    'Automated Action',
    'Predictive Intelligence',
    'Friction Observability',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',
  statsComponent: CapmKpiCarousel as unknown as PersonaManifest['statsComponent'],
  // Reframe the ops nav pages as the compliance story.
  navLabels: { journey: 'Compliance Query', risk: 'Disclosure Calendar' },

  ui: {
    greetingFlowKey: 'ussfcu_evelyn_greeting',
    initialChips: [
      'How many members match a set of characteristics?',
      'Apply the compliance tests to this population',
      'What is on the disclosure clock this week?',
      "Build a member's disclosure checklist and calendar",
      'Show me fair-lending disparities by product',
      'Which interactions may be unlogged complaints?',
      'Did we lose these members to another lender?',
      'Generate the exam evidence package',
    ],
    goldenPathChip: {
      ussfcu_evelyn_greeting: 'Run the deep query',
      ussfcu_evelyn_turn_deepquery: 'Apply the compliance tests',
      ussfcu_evelyn_turn_tests: 'Build the disclosure checklist and calendar',
      ussfcu_evelyn_turn_checklist: 'Which files are highest risk before the exam?',
      ussfcu_evelyn_turn_ranked_risk: 'Did we lose the 33 to another lender, and why?',
      ussfcu_evelyn_turn_attrition: 'Generate the exam evidence package',
      ussfcu_evelyn_turn_evidence: 'Route to the risk committee',
      ussfcu_evelyn_signal_1_fairlending: 'Run the deep query',
      ussfcu_evelyn_signal_2_trid: "Build a member's disclosure checklist and calendar",
      ussfcu_evelyn_signal_3_complaints: 'Log the 7 complaints',
    },
    flowKeyToCapabilityTrigger: {
      ussfcu_evelyn_greeting: 'home_load',
      ussfcu_evelyn_signal_1_fairlending: 'ask_turn_2',
      ussfcu_evelyn_signal_2_trid: 'home_load',
      ussfcu_evelyn_signal_3_complaints: 'ask_turn_2',
      ussfcu_evelyn_turn_deepquery: 'ask_turn_1',
      ussfcu_evelyn_turn_tests: 'ask_turn_2',
      ussfcu_evelyn_esign_check: 'ask_turn_2',
      ussfcu_evelyn_turn_checklist: 'ask_turn_3',
      ussfcu_evelyn_generate_population: 'ask_turn_3',
      ussfcu_evelyn_turn_ranked_risk: 'ask_turn_4',
      ussfcu_evelyn_turn_attrition: 'ask_turn_5',
      ussfcu_evelyn_competitor_mentions: 'ask_turn_5',
      ussfcu_evelyn_turn_evidence: 'ask_turn_6',
      ussfcu_evelyn_route_committee: 'ask_turn_6',
    },
    stats: [
      { id: 'findings', label: 'Open Compliance Findings', value: '23', trend: 'Compliance / GRC System', positive: false, icon: ClipboardList, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Which files are highest risk before the exam?' },
      { id: 'disparity', label: 'Fair-Lending Disparity Index', value: 'Elevated', trend: '2 products · MeridianLink + Core', positive: false, icon: Scale, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Show me fair-lending disparities by product' },
      { id: 'trid', label: 'TRID On-Time Disclosure Rate', value: '94.2%', trend: 'MeridianLink', positive: false, icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'What is on the disclosure clock this week?' },
      { id: 'esign', label: 'ESIGN Consent Coverage', value: '88%', trend: 'SharePoint', positive: false, icon: ShieldCheck, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Apply the compliance tests to this population' },
      { id: 'complaints', label: 'Complaint Trend, QoQ (normalized)', value: '+6%', trend: '34 unlogged · Medallia + Comms', positive: false, icon: TrendingUp, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Which interactions may be unlogged complaints?' },
      { id: 'days', label: 'Avg Days, Application to Closing', value: '41', trend: 'MeridianLink', positive: false, icon: CalendarDays, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: null },
      { id: 'exam', label: 'NCUA Exam Readiness', value: '82 / 100', trend: 'Compliance / GRC System', positive: false, icon: Target, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Generate the exam evidence package' },
      { id: 'sources', label: 'Data Sources Connected', value: '6', trend: 'Radiant Intelligence Layer', positive: true, icon: Database, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10', chipText: null },
    ],
    signalToChip: {
      'SIG-USSFCU-EVELYN-001': 'Show me fair-lending disparities by product',
      'SIG-USSFCU-EVELYN-002': 'What is on the disclosure clock this week?',
      'SIG-USSFCU-EVELYN-003': 'Which interactions may be unlogged complaints?',
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

    if (k === 'ussfcu_evelyn_signal_1_fairlending') pushSignal('SIG-USSFCU-EVELYN-001', 'evsig1');
    if (k === 'ussfcu_evelyn_signal_2_trid') pushSignal('SIG-USSFCU-EVELYN-002', 'evsig2');
    if (k === 'ussfcu_evelyn_signal_3_complaints') { pushSignal('SIG-USSFCU-EVELYN-003', 'evsig3'); out.push(<ComplaintTrendPanel key={`ev-trend-${k}`} />); }
    if (k === 'ussfcu_evelyn_complaint_trend') out.push(<ComplaintTrendPanel key={`ev-trend-${k}`} />);
    if (k === 'ussfcu_evelyn_turn_deepquery') out.push(<ComplianceDeepQueryResult key={`ev-dq-${k}`} />);
    if (k === 'ussfcu_evelyn_turn_tests' || k === 'ussfcu_evelyn_esign_check') out.push(<RegulatoryTestPanel key={`ev-tests-${k}`} data={regulatoryTests} />);
    if (k === 'ussfcu_evelyn_turn_checklist') {
      out.push(<DisclosureChecklist key={`ev-chk-${k}`} data={disclosureChecklist} />);
      out.push(<DisclosureCalendar key={`ev-cal-${k}`} data={disclosureCalendar} />);
    }
    if (k === 'ussfcu_evelyn_generate_population') out.push(<BatchDisclosureNotifier key={`ev-batch-${k}`} />);
    if (k === 'ussfcu_evelyn_turn_ranked_risk' || k === 'ussfcu_evelyn_assign_files' || k === 'ussfcu_evelyn_hand_to_nadia') out.push(<RankedRiskList key={`ev-risk-${k}`} />);
    if (k === 'ussfcu_evelyn_turn_attrition' || k === 'ussfcu_evelyn_competitor_mentions') out.push(<AttritionBreakdown key={`ev-attr-${k}`} />);
    if (k === 'ussfcu_evelyn_turn_evidence' || k === 'ussfcu_evelyn_route_committee' || k === 'ussfcu_evelyn_export_examiner') out.push(<ExamEvidencePackage key={`ev-ev-${k}`} />);

    return out.length ? out : undefined;
  },
};

export default manifest;
