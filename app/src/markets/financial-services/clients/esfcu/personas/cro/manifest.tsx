/**
 * Persona: Chief Risk Officer (Renata Alvarez) — ESFCU's second persona.
 *
 * Owns fraud, BSA/AML and enterprise risk, and reports to Girado Smith and the
 * board's supervisory committee. Together the two ESFCU personas are the
 * two-persona pilot story spec §16 says wins the funded PoC.
 *
 * IMPORTANT: unlike Girado Smith, who is ESFCU's real, named CEO, Renata is a
 * REPRESENTATIVE persona — ESFCU's actual risk leader is not public (spec §3,
 * §17). Nothing in this build attributes a quote or a decision to a real named
 * risk officer, and the Data Sources posture panel says so on screen.
 *
 * Hero issue: scam and impersonation losses rising across channels while the
 * fraud signals sit in silos — card, ACH, digital, core, and the un-scored
 * Howard University book — so real fraud is caught late and a lean team burns
 * hours on false positives.
 *
 * The shared ESFCU shell (KPI carousel, hero signals, trust strip, lineage
 * trace, exhibit chrome) is the CEO's, parameterised rather than forked; only
 * the fraud surfaces under components/esfcu/cro/ are new.
 */

import { DollarSign, ShieldAlert, ShieldCheck, Filter, Clock, FileText, Activity, UserMinus } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/esfcu/cro/signals.json';
import dataSources from '@/data/esfcu/cro/dataSources.json';
import capabilityCallouts from '@/data/esfcu/cro/capabilityCallouts.json';

import SignalCard from '@/components/cards/SignalCard';
import CroKpiCarousel from '@/components/esfcu/cro/CroKpiCarousel';
import CroHomeSignals from '@/components/esfcu/cro/CroHomeSignals';
import CroDataTrustStrip from '@/components/esfcu/cro/CroDataTrustStrip';
import ScamTrendChart from '@/components/esfcu/cro/ScamTrendChart';
import FraudLinkGraph from '@/components/esfcu/cro/FraudLinkGraph';
import FraudReconciliationPanel from '@/components/esfcu/cro/FraudReconciliationPanel';
import ExposureForecastChart from '@/components/esfcu/cro/ExposureForecastChart';
import AlertQueue from '@/components/esfcu/cro/AlertQueue';
import ResponseOptionsPanel from '@/components/esfcu/cro/ResponseOptionsPanel';
import NextStepsPanel from '@/components/esfcu/cro/NextStepsPanel';

const flows = (getPersonaFlowConfigs('esfcu') as unknown as Record<string, PersonaManifest['flows']>).esfcu_cro;

const manifest: PersonaManifest = {
  id: 'esfcu_cro',
  clientId: 'esfcu',
  marketId: 'financial-services',

  identity: { name: 'Renata Alvarez', initials: 'RA', role: 'Chief Risk Officer', greeting: 'Renata' },
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
  statsComponent: CroKpiCarousel as unknown as PersonaManifest['statsComponent'],
  signalsComponent: CroHomeSignals as unknown as PersonaManifest['signalsComponent'],
  initialExtras: CroDataTrustStrip as unknown as PersonaManifest['initialExtras'],
  features: {
    topAlignedInitial: true,
    // The link graph, the alert queue and the reconciliation panel all want more
    // measure than a chat bubble allows.
    wideInlineComponents: true,
    // Spec §12's routes, plus Risk Signals so all five §6 signal cards are
    // reachable. Explicit rather than inherited: the CEO's default set includes
    // Business Performance, which is not this persona's page.
    navSlots: ['ask', 'fraudOperations', 'risk', 'dataSources'],
  },
  // Overrides the client-level labels, which are the CEO's. Duplicated in
  // TopHeader's personaNavLabels — both must agree.
  navLabels: { fraudOperations: 'Fraud Operations', risk: 'Risk Signals' },

  ui: {
    greetingFlowKey: 'esfcu_cro_greeting',
    // Spec §11, verbatim.
    initialChips: [
      'Where does our fraud risk stand this morning?',
      'Walk me through the scam surge',
      'Can I trust this picture, and is the Howard University book covered?',
      'If this scam campaign continues, what is our exposure?',
      'What is unusual right now?',
      'Re-rank my alert queue by real-fraud likelihood',
      'Draft the SAR and the member alert',
      'Open the full risk briefing',
    ],
    // Walks spec §10's seven turns in order. Every value must appear in that
    // turn's suggested_chips — manifests.test.ts asserts it.
    goldenPathChip: {
      esfcu_cro_greeting: 'Walk me through the scam surge',
      esfcu_cro_where_stands: 'Walk me through the scam surge',
      esfcu_cro_turn_surge: 'Can I trust this picture?',
      esfcu_cro_turn_trust: 'If this continues, what is our exposure?',
      esfcu_cro_bring_into_scope: 'If this continues, what is our exposure?',
      esfcu_cro_turn_exposure: 'What is unusual right now?',
      esfcu_cro_show_options: 'Draft the response',
      esfcu_cro_turn_unusual: 'Draft the response',
      esfcu_cro_rerank_queue: 'Draft the response',
      esfcu_cro_turn_response: 'Open the full risk briefing',
    },
    flowKeyToCapabilityTrigger: {
      esfcu_cro_greeting: 'home_load',
      esfcu_cro_signal_1_surge: 'home_load',
      esfcu_cro_signal_2_coverage: 'home_load',
      esfcu_cro_signal_3_mule: 'home_load',
      esfcu_cro_where_stands: 'home_load',
      esfcu_cro_turn_surge: 'ask_turn_1',
      esfcu_cro_turn_trust: 'ask_turn_2',
      esfcu_cro_bring_into_scope: 'ask_turn_2',
      esfcu_cro_turn_exposure: 'ask_turn_3',
      esfcu_cro_show_options: 'ask_turn_3',
      esfcu_cro_turn_unusual: 'ask_turn_4',
      esfcu_cro_rerank_queue: 'ask_turn_4',
      esfcu_cro_turn_response: 'ask_turn_5',
      esfcu_cro_adjust_response: 'ask_turn_5',
      esfcu_cro_assign_owners: 'ask_turn_5',
      esfcu_cro_turn_full_briefing: 'ask_turn_5',
    },
    // Spec §7. Provenance, target and calculation live in data/esfcu/cro/kpis.json,
    // keyed by these ids.
    stats: [
      { id: 'net_fraud_loss', label: 'Net Fraud Loss, YTD', value: '$612K', trend: 'Up on prior year', positive: false, icon: DollarSign, iconColor: 'text-amber-700', iconBg: 'bg-amber-500/10', chipText: 'Where does our fraud risk stand this morning?' },
      { id: 'scam_cases', label: 'Scam Cases, 30 Days', value: '148', trend: 'Up from 94', positive: false, icon: ShieldAlert, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Walk me through the scam surge' },
      { id: 'caught_before_loss', label: 'Caught Before Loss', value: '71%', trend: 'Improving · target 85%', positive: false, icon: ShieldCheck, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: null },
      { id: 'false_positive_rate', label: 'False-Positive Rate', value: '62%', trend: 'Improving · target 40%', positive: false, icon: Filter, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: 'Re-rank my alert queue by real-fraud likelihood' },
      { id: 'time_to_detect', label: 'Avg Time to Detect', value: '2.4 days', trend: 'Down · target under 1 day', positive: false, icon: Clock, iconColor: 'text-cyan-700', iconBg: 'bg-cyan-500/10', chipText: null },
      { id: 'open_sars', label: 'Open SAR Cases', value: '9', trend: '96% on-time · 2 due ≤7 days', positive: false, icon: FileText, iconColor: 'text-slate-600', iconBg: 'bg-slate-500/10', chipText: null },
      { id: 'model_coverage', label: 'Fraud-Model Coverage', value: '88%', trend: 'Howard Univ. pending', positive: false, icon: Activity, iconColor: 'text-amber-700', iconBg: 'bg-amber-500/10', chipText: 'Can I trust this picture, and is the Howard University book covered?' },
      { id: 'attrition_after_fraud', label: 'Attrition After Fraud', value: '≈31%', trend: 'Real · industry benchmark', positive: false, icon: UserMinus, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: 'If this scam campaign continues, what is our exposure?' },
    ],
    signalToChip: {
      'SIG-ESFCU-CRO-001': 'Walk me through the scam surge',
      'SIG-ESFCU-CRO-002': 'Can I trust this picture, and is the Howard University book covered?',
      'SIG-ESFCU-CRO-003': 'What is unusual right now?',
      'SIG-ESFCU-CRO-004': 'Re-rank my alert queue by real-fraud likelihood',
      'SIG-ESFCU-CRO-005': 'Draft the SAR and the member alert',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  // Spec §13's response-appropriate rendering table. Each answer generates the
  // visualization that fits it, not one fixed layout.
  inlineComponents: (msg, sigs) => {
    const out = [];
    const k = msg.flowKey;
    const pushSignal = (id: string, key: string) => {
      const s = sigs.find((x) => x.id === id);
      if (s) out.push(<SignalCard key={key} signal={s} showAction />);
    };
    const noop = () => {};

    // Home signal drill-downs — the card, then the exhibit behind it.
    if (k === 'esfcu_cro_signal_1_surge') { pushSignal('SIG-ESFCU-CRO-001', 'sig1'); out.push(<ScamTrendChart key="sig1-trend" />); }
    if (k === 'esfcu_cro_signal_2_coverage') { pushSignal('SIG-ESFCU-CRO-002', 'sig2'); out.push(<FraudReconciliationPanel key="sig2-recon" />); }
    if (k === 'esfcu_cro_signal_3_mule') { pushSignal('SIG-ESFCU-CRO-003', 'sig3'); out.push(<FraudLinkGraph key="sig3-graph" />); }

    // Step 1 — "text briefing card plus the trust strip, no inline chart".
    if (k === 'esfcu_cro_where_stands') out.push(<CroDataTrustStrip key="stands-trust" compact onTrace={noop} />);

    // Step 2 — "trend chart with channel breakdown plus a receiving-account
    // link graph". Both, in that order: the trend says how big, the graph says
    // what to pull on.
    if (k === 'esfcu_cro_turn_surge') {
      out.push(<ScamTrendChart key="surge-trend" />);
      out.push(<FraudLinkGraph key="surge-graph" compact />);
    }

    // Step 3 — "reconciliation panel with lineage and the coverage gap
    // highlighted", plus the trust strip's visible flip to pending.
    if (k === 'esfcu_cro_turn_trust') {
      out.push(<FraudReconciliationPanel key="trust-recon" />);
      out.push(<CroDataTrustStrip key="trust-strip" expanded highlight onTrace={noop} />);
    }
    if (k === 'esfcu_cro_bring_into_scope') out.push(<FraudReconciliationPanel key="scope-recon" />);

    // Step 4 — "forecast chart, baseline vs with-response, attrition risk
    // called out".
    if (k === 'esfcu_cro_turn_exposure') out.push(<ExposureForecastChart key="exposure-forecast" />);
    if (k === 'esfcu_cro_show_options') out.push(<ResponseOptionsPanel key="options" />);

    // Step 5 — "anomaly cluster (link graph) plus a re-ranked alert queue".
    if (k === 'esfcu_cro_turn_unusual') {
      out.push(<FraudLinkGraph key="unusual-graph" />);
      out.push(<AlertQueue key="unusual-queue" />);
    }
    if (k === 'esfcu_cro_rerank_queue') out.push(<AlertQueue key="rerank-queue" />);

    // Step 6 — the action set is rendered by the chat engine from
    // chatFlows.json's action_cards; what it does not carry is who owns each
    // one, which is the half of the answer a committee asks about.
    if (
      k === 'esfcu_cro_turn_response'
      || k === 'esfcu_cro_adjust_response'
      || k === 'esfcu_cro_assign_owners'
    ) {
      out.push(<NextStepsPanel key={`steps-${k}`} />);
    }

    return out.length ? out : undefined;
  },
};

export default manifest;
