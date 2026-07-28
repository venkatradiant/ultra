/**
 * Persona: Small Business Customer, Self-Service (Grace Bello) — Newfold Digital.
 *
 * The customer end of the site-down thread. A 6-year Bluehost customer whose site,
 * store, and email are down after a failed hosting renewal. The assistant answers
 * the simple questions instantly and reasons through the complex ones the way a
 * well-informed agent would — account status, the failure trail, the dunning
 * exception, the fix-vs-wait forecast, and a one-tap restore.
 */
import { Server, Globe, Mail, ShoppingCart, Calendar, DollarSign } from 'lucide-react';
import type { PersonaManifest } from '@core/types';

import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import signals from '@/data/newfold-digital/member/signals.json';
import dataSources from '@/data/newfold-digital/_shared/dataSources.json';
import capabilityCallouts from '@/data/newfold-digital/member/capabilityCallouts.json';

import AccountStatusCard from '@/components/newfold/member/AccountStatusCard';
import FailureTrail from '@/components/newfold/member/FailureTrail';
import DunningExplainer from '@/components/newfold/member/DunningExplainer';
import FixVsWaitForecast from '@/components/newfold/member/FixVsWaitForecast';
import RestoreConfirmation from '@/components/newfold/member/RestoreConfirmation';
import WrapUpCard from '@/components/newfold/member/WrapUpCard';

const flows = (getPersonaFlowConfigs('newfold_digital') as unknown as Record<string, PersonaManifest['flows']>).newfold_member;

const manifest: PersonaManifest = {
  id: 'newfold_member',
  clientId: 'newfold_digital',
  marketId: 'commercial',

  identity: { name: 'Grace Bello', initials: 'GB', role: 'Small Business Customer (Self-Service)', greeting: 'Grace' },
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

  ui: {
    greetingFlowKey: 'newfold_member_greeting',
    initialChips: [
      'Why is my site down?',
      'What do I owe to restore my account?',
      'Is my store data still there?',
      'Will I be charged a reactivation fee?',
      'Fix my payment method',
      'When does my domain renew?',
      'Restore my site now',
      'Turn on alerts for failed payments',
    ],
    goldenPathChip: {
      newfold_member_greeting: 'Tell me why my site is down',
      newfold_member_why_down: "Why didn't I know the card expired?",
      newfold_member_dunning: 'Restore my site now',
      newfold_member_reactivation: 'Do the fix and restore my site',
      newfold_member_fix: 'Anything else I should know?',
      newfold_member_wrap: 'Turn on alerts for failed payments',
    },
    flowKeyToCapabilityTrigger: {
      newfold_member_greeting: 'home_load',
      newfold_member_status: 'ask_turn_1',
      newfold_member_owe: 'ask_turn_1',
      newfold_member_store_data: 'ask_turn_1',
      newfold_member_domain_renew: 'ask_turn_1',
      newfold_member_activity: 'ask_turn_1',
      newfold_member_why_down: 'ask_turn_2',
      newfold_member_dunning: 'ask_turn_3',
      newfold_member_reactivation: 'ask_turn_4',
      newfold_member_remind: 'ask_turn_4',
      newfold_member_fix: 'ask_turn_5',
      newfold_member_fix_now: 'ask_turn_5',
      newfold_member_loyalty: 'ask_turn_5',
      newfold_member_backup: 'ask_turn_5',
      newfold_member_confirm_back: 'ask_turn_5',
      newfold_member_alerts: 'ask_turn_5',
      newfold_member_thanks: 'ask_turn_5',
    },
    stats: [
      { id: 'hosting', label: 'Hosting Plan', value: 'Suspended', trend: 'Failed renewal', positive: false, icon: Server, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Why is my site down?' },
      { id: 'domain', label: 'Domain', value: 'Active', trend: 'Renews in 22 days', positive: true, icon: Globe, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10', chipText: 'When does my domain renew?' },
      { id: 'email', label: 'Business Email', value: 'Down', trend: 'Tied to hosting', positive: false, icon: Mail, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Why is my site down?' },
      { id: 'store', label: 'Store Orders', value: 'Blocked', trend: 'Offline', positive: false, icon: ShoppingCart, iconColor: 'text-red-600', iconBg: 'bg-red-500/10', chipText: 'Is my store data still there?' },
      { id: 'last_pay', label: 'Last Payment', value: '1 yr ago', trend: 'Annual plan', positive: false, icon: Calendar, iconColor: 'text-text-muted', iconBg: 'bg-surface-2', chipText: 'What do I owe to restore my account?' },
      { id: 'due', label: 'Amount Due to Restore', value: '$203.88', trend: 'Loyalty credit available', positive: false, icon: DollarSign, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10', chipText: 'What do I owe to restore my account?' },
    ],
    signalToChip: {
      'SIG-NEWFOLD-MEM-001': 'Tell me why my site is down',
      'SIG-NEWFOLD-MEM-002': 'What do I owe?',
      'SIG-NEWFOLD-MEM-003': 'Will I be charged a reactivation fee?',
    },
    capabilityCallouts: capabilityCallouts as PersonaManifest['ui']['capabilityCallouts'],
  },

  inlineComponents: (msg) => {
    const out = [];
    const k = msg.flowKey;
    // Greeting shows the message + the compact priority strip only; the full
    // detail appears when the customer taps a priority card.
    if (k === 'newfold_member_status') out.push(<AccountStatusCard key="status" />);
    if (k === 'newfold_member_why_down') out.push(<FailureTrail key="trail" />);
    if (k === 'newfold_member_dunning') out.push(<DunningExplainer key="dunning" />);
    if (k === 'newfold_member_reactivation' || k === 'newfold_member_fix_now') out.push(<FixVsWaitForecast key="forecast" />);
    if (k === 'newfold_member_fix') out.push(<RestoreConfirmation key="restore" />);
    if (k === 'newfold_member_wrap') out.push(<WrapUpCard key="wrap" />);
    return out.length ? out : undefined;
  },
};

export default manifest;
