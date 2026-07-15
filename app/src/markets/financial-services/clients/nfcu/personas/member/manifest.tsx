/**
 * Persona: Navy Federal Member self-service (Elena Ruiz) — NFCU. Member-facing
 * assistant; inline layout, signature cards compose into the thread.
 */

import { DollarSign, ArrowLeftRight, CalendarDays, CreditCard, AlertTriangle, Wallet } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/nfcu/member/signals.json';
import dataSources from '@/data/nfcu/member/dataSources.json';
import capabilityCallouts from '@/data/nfcu/member/capabilityCallouts.json';

import MemberDeclineTrail from '@/components/nfcu/member/MemberDeclineTrail';
import MemberFixForecast from '@/components/nfcu/member/MemberFixForecast';
import MemberActionConfirm from '@/components/nfcu/member/MemberActionConfirm';

const flows = (getPersonaFlowConfigs('nfcu') as unknown as Record<string, PersonaManifest['flows']>).nfcu_member;

const manifest: PersonaManifest = {
  id: 'nfcu_member',
  clientId: 'nfcu',
  marketId: 'financial-services',

  identity: { name: 'Elena Ruiz', initials: 'ER', role: 'Navy Federal Member (Self-Service)', greeting: 'Elena' },
  capabilities: [
    'Proactive Intelligence',
    'Converged Conversation',
    'Friction Observability',
    'Anomaly Detection',
    'Predictive Intelligence',
    'Automated Action',
  ],

  flows,
  signals: signals as PersonaManifest['signals'],
  dataSources: dataSources as PersonaManifest['dataSources'],

  layout: 'inline',
  features: { focusedNav: true },

  ui: {
    greetingFlowKey: 'nfcu_member_greeting',
    initialChips: [
      "What's my balance?",
      'Why was my payment declined?',
      'Will I be charged a late fee?',
      'Fix my direct deposit',
      'Is my paycheck deposited yet?',
    ],
    goldenPathChip: {
      nfcu_member_greeting: "What's my balance?",
      nfcu_member_step2_balance: 'Now tell me about the declined payment',
      nfcu_member_step3_decline: "Why isn't my salary being applied?",
      nfcu_member_step4_salary: 'Will I be charged a late fee?',
      nfcu_member_step5_latefee: 'Do the fix and retry the payment',
      nfcu_member_step6_fix: 'Anything else I should know?',
    },
    flowKeyToCapabilityTrigger: {
      nfcu_member_greeting: 'home_load',
      nfcu_member_step2_balance: 'ask_turn_1',
      nfcu_member_step3_decline: 'ask_turn_2',
      nfcu_member_step4_salary: 'ask_turn_3',
      nfcu_member_step5_latefee: 'ask_turn_4',
      nfcu_member_step6_fix: 'ask_turn_5',
      nfcu_member_step7_anything_else: 'ask_turn_6',
    },
    stats: [
      { id: 'balance', label: 'Available Balance', value: '$1,847.20', trend: 'Checking · real-time', positive: true, icon: DollarSign, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10', chipText: "What's my balance?" },
      { id: 'pending', label: 'Pending Transactions', value: '2', trend: 'Core Banking', positive: true, icon: ArrowLeftRight, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10', chipText: 'Show my recent transactions' },
      { id: 'next_payment', label: 'Auto Loan Next Payment', value: '$412.00', trend: 'Due Jul 1', positive: true, icon: CalendarDays, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', chipText: 'When is my next auto loan payment due?' },
      { id: 'card_balance', label: 'Credit Card Balance', value: '$1,203.55', trend: 'Core Banking', positive: true, icon: CreditCard, iconColor: 'text-slate-600', iconBg: 'bg-slate-500/10', chipText: null },
      { id: 'declined', label: 'Declined Payments (30d)', value: '1', trend: 'Needs attention', positive: false, icon: AlertTriangle, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Why was my payment declined?' },
      { id: 'early_credit', label: 'Early Salary Credit Pending', value: '$3,140.00', trend: 'Held — routing missing', positive: false, icon: Wallet, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'Is my paycheck deposited yet?' },
    ],
    signalToChip: {
      'SIG-NFCU-MEM-001': 'Tell me why it was declined',
      'SIG-NFCU-MEM-002': "Why isn't my salary being applied?",
      'SIG-NFCU-MEM-003': 'Will I be charged a late fee?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey;
    if (k === 'nfcu_member_step3_decline') out.push(<MemberDeclineTrail key="mem-decline-trail" variant="trail" />);
    if (k === 'nfcu_member_step4_salary') out.push(<MemberDeclineTrail key="mem-exception" variant="exception" />);
    if (k === 'nfcu_member_step5_latefee') out.push(<MemberFixForecast key="mem-fix-forecast" />);
    if (k === 'nfcu_member_step6_fix') out.push(<MemberActionConfirm key="mem-action-confirm" />);
    return out.length ? out : undefined;
  },
};

export default manifest;
