/**
 * Persona: Compliance Analyst (Nadia Hassan) — USSFCU-only. The operator version
 * of the compliance story at file altitude: open a member file, build its
 * timeline, compare to procedure, generate the checklist + calendar, log the
 * complaint. Inline layout, 6 KPIs via the carousel.
 */

import { FileText, AlertTriangle, ListChecks, Clock, MessageSquare, FileWarning } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/ussfcu/nadia/signals.json';
import dataSources from '@/data/ussfcu/nadia/dataSources.json';
import capabilityCallouts from '@/data/ussfcu/nadia/capabilityCallouts.json';
import fileTests from '@/data/ussfcu/nadia/fileTests.json';
import fileChecklist from '@/data/ussfcu/nadia/fileChecklist.json';
import fileCalendar from '@/data/ussfcu/nadia/fileCalendar.json';

import SignalCard from '@/components/cards/SignalCard';
import CapmKpiCarousel from '@/components/penfed/capmarkets/CapmKpiCarousel';
import FileTimeline from '@/components/ussfcu/nadia/FileTimeline';
import ProcedureAdherenceView from '@/components/ussfcu/nadia/ProcedureAdherenceView';
import ComplaintRecord from '@/components/ussfcu/nadia/ComplaintRecord';
import RegulatoryTestPanel from '@/components/ussfcu/compliance/RegulatoryTestPanel';
import DisclosureChecklist from '@/components/ussfcu/compliance/DisclosureChecklist';
import DisclosureCalendar from '@/components/ussfcu/compliance/DisclosureCalendar';

const flows = (getPersonaFlowConfigs('ussfcu') as unknown as Record<string, PersonaManifest['flows']>).ussfcu_nadia;

const manifest: PersonaManifest = {
  id: 'ussfcu_nadia',
  clientId: 'ussfcu',
  marketId: 'financial-services',

  identity: { name: 'Nadia Hassan', initials: 'NH', role: 'Compliance Analyst', greeting: 'Nadia' },
  capabilities: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Anomaly Detection',
    'Friction Observability',
    'Automated Action',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',
  statsComponent: CapmKpiCarousel as unknown as PersonaManifest['statsComponent'],
  navLabels: { journey: 'Compliance Query', risk: 'Disclosure Calendar' },

  ui: {
    greetingFlowKey: 'ussfcu_nadia_greeting',
    initialChips: [
      "Show me today's file exceptions",
      'Open a member file and build its timeline',
      'Run the compliance tests on this file',
      'Compare this file to procedure',
      'Build the disclosure checklist and calendar',
      'Log this interaction as a complaint',
      'Generate the daily exception report',
    ],
    goldenPathChip: {
      ussfcu_nadia_greeting: 'Open file 20-4471',
      ussfcu_nadia_turn_openfile: 'Compare to procedure',
      ussfcu_nadia_turn_procedure: 'Build the disclosure checklist and calendar',
      ussfcu_nadia_turn_checklist: 'Log the fee complaint',
      ussfcu_nadia_turn_complaint: 'Generate the daily exception report',
      ussfcu_nadia_signal_1_lateloan: 'Open file 20-4471',
      ussfcu_nadia_signal_2_esign: 'Show me the ESIGN gap',
      ussfcu_nadia_signal_3_dissatisfaction: 'Log the fee complaint',
      ussfcu_nadia_today_exceptions: 'Open file 20-4471',
    },
    flowKeyToCapabilityTrigger: {
      ussfcu_nadia_greeting: 'home_load',
      ussfcu_nadia_today_exceptions: 'home_load',
      ussfcu_nadia_signal_1_lateloan: 'home_load',
      ussfcu_nadia_signal_2_esign: 'home_load',
      ussfcu_nadia_signal_3_dissatisfaction: 'home_load',
      ussfcu_nadia_turn_openfile: 'ask_turn_1',
      ussfcu_nadia_turn_procedure: 'ask_turn_2',
      ussfcu_nadia_turn_checklist: 'ask_turn_3',
      ussfcu_nadia_turn_complaint: 'ask_turn_4',
    },
    stats: [
      { id: 'reviewed', label: 'Files Reviewed (MTD)', value: '312', trend: 'MeridianLink', positive: true, icon: FileText, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10', chipText: null },
      { id: 'exceptions', label: 'Open Exceptions', value: '19', trend: 'Compliance / GRC System', positive: false, icon: AlertTriangle, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: "Show me today's file exceptions" },
      { id: 'checklists', label: 'Disclosure Checklists Complete', value: '87%', trend: 'Regulatory Rules Engine', positive: false, icon: ListChecks, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: 'Build the disclosure checklist and calendar' },
      { id: 'review_time', label: 'Avg File Review Time', value: '26 → 4 min', trend: 'Time Logs + Radiant', positive: true, icon: Clock, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: null },
      { id: 'complaints', label: 'Complaints Logged (MTD)', value: '41', trend: 'Compliance / GRC System', positive: true, icon: MessageSquare, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Log the fee complaint' },
      { id: 'esign_gaps', label: 'ESIGN Consent Gaps', value: '11', trend: 'SharePoint', positive: false, icon: FileWarning, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Show me the ESIGN gap' },
    ],
    signalToChip: {
      'SIG-USSFCU-NADIA-001': 'Open file 20-4471',
      'SIG-USSFCU-NADIA-002': 'Show me the ESIGN gap',
      'SIG-USSFCU-NADIA-003': 'Log the fee complaint',
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

    if (k === 'ussfcu_nadia_signal_1_lateloan') pushSignal('SIG-USSFCU-NADIA-001', 'nasig1');
    if (k === 'ussfcu_nadia_signal_2_esign') pushSignal('SIG-USSFCU-NADIA-002', 'nasig2');
    if (k === 'ussfcu_nadia_signal_3_dissatisfaction') pushSignal('SIG-USSFCU-NADIA-003', 'nasig3');
    if (k === 'ussfcu_nadia_turn_openfile') out.push(<FileTimeline key={`na-file-${k}`} />);
    if (k === 'ussfcu_nadia_turn_procedure' || k === 'ussfcu_nadia_flag_branch') out.push(<ProcedureAdherenceView key={`na-proc-${k}`} />);
    if (k === 'ussfcu_nadia_run_tests') out.push(<RegulatoryTestPanel key={`na-tests-${k}`} data={fileTests} />);
    if (k === 'ussfcu_nadia_turn_checklist' || k === 'ussfcu_nadia_document_cure') {
      out.push(<DisclosureChecklist key={`na-chk-${k}`} data={fileChecklist} />);
      out.push(<DisclosureCalendar key={`na-cal-${k}`} data={fileCalendar} />);
    }
    if (k === 'ussfcu_nadia_turn_complaint') out.push(<ComplaintRecord key={`na-cmp-${k}`} />);

    return out.length ? out : undefined;
  },
};

export default manifest;
