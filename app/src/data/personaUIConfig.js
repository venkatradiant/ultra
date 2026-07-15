/**
 * Per-persona UI configurations.
 * Each persona defines: initialChips, goldenPathChip, flowKeyToCapabilityTrigger,
 * stats (DataOverviewBar), signalToChip (TopInsightsBar).
 */

import { Users, AlertTriangle, Cpu, Database, BarChart3, ArrowLeftRight, Star, Briefcase, TrendingDown, HeartPulse, DollarSign, Target, ShieldAlert, FileWarning, Gauge, Search, Headphones, CheckCircle, TrendingUp, Award, ClipboardList, GitCompareArrows, Scale, Clock, CalendarDays, Wallet, CreditCard } from 'lucide-react';

// ─── Operations & Analytics (Maya J.) ────────────────────────────
const opsUI = {
  initialChips: [
    "Yes, walk me through them",
    "What's driving the mortgage drop-off?",
    "Which members are most at risk of leaving?",
    "Tell me about the CD complaint cluster",
    "Scan for anomalies across systems",
  ],
  goldenPathChip: {
    greeting:                  "What's driving the mortgage drop-off?",
    turn_1_mortgage_dropoff:   "Yes, show me who's affected",
    turn_2_segmentation:       "Not yet — show me more",
    turn_3_predictive:         "Scan for anomalies across systems",
    turn_5_anomaly_detection:  "Help me act on this",
  },
  flowKeyToCapabilityTrigger: {
    greeting: 'home_load',
    signal_1_mortgage: 'home_load',
    turn_1_mortgage_dropoff: 'ask_turn_1',
    turn_2_segmentation: 'ask_turn_2',
    turn_3_predictive: 'ask_turn_3',
    turn_5_anomaly_detection: 'ask_turn_4',
    turn_4_actions: 'ask_turn_5',
  },
  stats: [
    {
      id: 'members', label: 'Active Members', value: '2,304', trend: '+12%', positive: true,
      icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10',
      chipText: 'Show me active member breakdown',
    },
    {
      id: 'alerts', label: 'Alerts', value: '3', trend: '2 critical', positive: false,
      icon: AlertTriangle, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: 'Summarize active alerts',
    },
    {
      id: 'processes', label: 'Processes', value: '456K', trend: '99.2%', positive: true,
      icon: Cpu, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10',
      chipText: 'Show process health',
    },
    {
      id: 'sources', label: 'Data Sources', value: '8', trend: '7 active', positive: true,
      icon: Database, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10',
      chipText: null,
    },
  ],
  signalToChip: {
    'SIG-001': "What's driving the mortgage drop-off?",
    'SIG-002': 'Tell me about the auto loan trend',
    'SIG-003': 'Tell me about the CD complaint cluster',
  },
  greetingFlowKey: 'greeting',
};

// ─── CX Operator (Priya K.) ─────────────────────────────────────
const cxUI = {
  initialChips: [
    "Where are members hitting friction?",
    "Which journeys underperform this week?",
    "Show me channel switching patterns",
    "What's driving the IVR escalation spike?",
    "Summarize service recovery gaps",
  ],
  goldenPathChip: {
    cx_greeting:                 "Where are members hitting friction?",
    cx_turn_1_channel_friction:  "Show me which journeys underperform",
    cx_turn_2_journey_friction:  "What intervention is needed?",
  },
  flowKeyToCapabilityTrigger: {
    cx_greeting: 'home_load',
    cx_signal_1_channel_switch: 'home_load',
    cx_signal_2_journey_abandon: 'home_load',
    cx_signal_3_ivr_escalation: 'home_load',
    cx_turn_1_channel_friction: 'ask_turn_1',
    cx_ivr_escalation_detail: 'ask_turn_1',
    cx_who_are_members: 'ask_turn_1',
    cx_turn_2_journey_friction: 'ask_turn_2',
    cx_channel_patterns: 'ask_turn_2',
    cx_csat_trend: 'ask_turn_2',
    cx_service_recovery_gaps: 'ask_turn_2',
    cx_mortgage_friction_detail: 'ask_turn_2',
    cx_turn_3_intervention: 'ask_turn_3',
    cx_outreach_draft: 'ask_turn_3',
    cx_send_to_callback: 'ask_turn_3',
    cx_service_recovery_report: 'ask_turn_3',
  },
  stats: [
    {
      id: 'journeys', label: 'Active Journeys', value: '1,847', trend: '-8% completion', positive: false,
      icon: BarChart3, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10',
      chipText: 'Show me active journey performance',
    },
    {
      id: 'switches', label: 'Channel Switches', value: '312', trend: '+47%', positive: false,
      icon: ArrowLeftRight, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: 'Show me channel switching patterns',
    },
    {
      id: 'csat', label: 'CSAT Score', value: '3.6/5', trend: '-0.4 pts', positive: false,
      icon: Star, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10',
      chipText: null,
    },
    {
      id: 'cases', label: 'Open Cases', value: '89', trend: '12 escalated', positive: false,
      icon: Briefcase, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10',
      chipText: 'Show me open cases',
    },
  ],
  signalToChip: {
    'SIG-CX-001': "Show me channel switching patterns",       // Channel switch spike → channel pattern detail
    'SIG-CX-002': "Drill into mortgage journey friction",     // Mortgage abandonment → mortgage-specific friction
    'SIG-CX-003': "What's driving the IVR escalation spike?", // IVR escalation → IVR escalation detail
  },
  greetingFlowKey: 'cx_greeting',
};

// ─── Member Retention Analyst (Derek T.) ─────────────────────────
const retentionUI = {
  initialChips: [
    "Show me the churn signals",
    "Which members are most at risk of leaving?",
    "What's driving disengagement this month?",
    "Model the retention impact of outreach",
    "Generate a retention brief for leadership",
  ],
  goldenPathChip: {
    ret_greeting:              "Show me the churn signals",
    ret_turn_1_churn_signals:  "Which segments are most at risk?",
    ret_turn_2_risk_segments:  "Model the retention impact",
  },
  flowKeyToCapabilityTrigger: {
    ret_greeting: 'home_load',
    ret_signal_1_churn_surge: 'home_load',
    ret_signal_2_engagement_decay: 'home_load',
    ret_signal_3_retiree_disengage: 'home_load',
    ret_turn_1_churn_signals: 'ask_turn_1',
    ret_churn_drivers: 'ask_turn_1',
    ret_engagement_trend: 'ask_turn_1',
    ret_campaign_performance: 'ask_turn_1',
    ret_retiree_sentiment: 'ask_turn_1',
    ret_which_segments_driving: 'ask_turn_1',
    ret_turn_2_risk_segments: 'ask_turn_2',
    ret_impact_model: 'ask_turn_2',
    ret_turn_3_retention_action: 'ask_turn_3',
    ret_retention_brief: 'ask_turn_3',
  },
  stats: [
    {
      id: 'at_risk', label: 'At-Risk Members', value: '1,769', trend: '+214 this week', positive: false,
      icon: TrendingDown, iconColor: 'text-red-600', iconBg: 'bg-red-500/10',
      chipText: 'Show me at-risk members',
    },
    {
      id: 'churn', label: 'Churn Rate', value: '4.2%', trend: '+0.8% MoM', positive: false,
      icon: HeartPulse, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: 'Show me the churn rate',
    },
    {
      id: 'ltv', label: 'Avg. LTV at Risk', value: '$47K', trend: '$83M total', positive: false,
      icon: DollarSign, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10',
      chipText: null,
    },
    {
      id: 'campaigns', label: 'Retention Campaigns', value: '3', trend: '1 underperforming', positive: false,
      icon: Target, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10',
      chipText: 'Show me campaign performance',
    },
  ],
  signalToChip: {
    'SIG-RET-001': "Show me the churn signals",               // Churn surge → churn signal overview
    'SIG-RET-002': "What's driving disengagement this month?", // Engagement decay → disengagement drivers
    'SIG-RET-003': "Show me the retiree sentiment details",   // Military retiree NPS drop → retiree-specific detail
  },
  greetingFlowKey: 'ret_greeting',
};

// ─── Risk & Fraud Executive (James R.) ───────────────────────────
const riskUI = {
  initialChips: [
    "What anomalies were detected overnight?",
    "Show me our regulatory exposure",
    "Flag accounts needing escalation",
    "Generate an audit trail for compliance",
    "Summarize BSA/AML posture",
  ],
  goldenPathChip: {
    risk_greeting:            "What anomalies were detected?",
    risk_turn_1_anomalies:    "Show me the regulatory exposure",
    risk_turn_2_regulatory:   "What needs escalation?",
  },
  flowKeyToCapabilityTrigger: {
    risk_greeting: 'home_load',
    risk_signal_1_structuring: 'home_load',
    risk_signal_2_wire_anomaly: 'home_load',
    risk_signal_3_ncua_decline: 'home_load',
    risk_turn_1_anomalies: 'ask_turn_1',
    risk_structuring_details: 'ask_turn_1',
    risk_wire_timeline: 'ask_turn_1',
    risk_complaint_drivers: 'ask_turn_1',
    risk_bsa_posture: 'ask_turn_1',
    risk_escalation_status: 'ask_turn_1',
    risk_turn_2_regulatory: 'ask_turn_2',
    risk_turn_3_escalation: 'ask_turn_3',
    risk_audit_trail: 'ask_turn_3',
    risk_board_summary: 'ask_turn_3',
  },
  stats: [
    {
      id: 'anomalies', label: 'Active Anomalies', value: '14', trend: '+5 this week', positive: false,
      icon: ShieldAlert, iconColor: 'text-red-600', iconBg: 'bg-red-500/10',
      chipText: 'Show me active anomalies',
    },
    {
      id: 'sars', label: 'SARs Filed', value: '3', trend: '2 pending', positive: false,
      icon: FileWarning, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: 'Show me SAR filing status',
    },
    {
      id: 'ncua', label: 'NCUA Score', value: '78/100', trend: '-6 pts QoQ', positive: false,
      icon: Gauge, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10',
      chipText: 'Show me the NCUA score',
    },
    {
      id: 'investigations', label: 'Open Investigations', value: '5', trend: '2 escalated', positive: false,
      icon: Search, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10',
      chipText: 'Show me open investigations',
    },
  ],
  signalToChip: {
    'SIG-RISK-001': "Show me the structuring pattern details", // BSA structuring → structuring-specific detail
    'SIG-RISK-002': "Show me the wire transfer timeline",      // Wire anomaly → wire-specific timeline
    'SIG-RISK-003': "Show me our regulatory exposure",         // NCUA decline → regulatory readiness breakdown
  },
  greetingFlowKey: 'risk_greeting',
};

// ─── NFCU: Contact Center Supervisor (Priya M.) ──────────────────
const nfcuSupervisorUI = {
  initialChips: [
    "Yes, walk me through them",
    "What caused the auto loan spike?",
    "Show me staffing for Friday",
    "Show root cause correlation",
    "What is my service level right now?",
  ],
  goldenPathChip: {
    nfcu_sup_greeting:                "Yes, walk me through them",
    nfcu_sup_signal_1_queue_spike:    "How does this compare to last rate promo?",
    nfcu_sup_rate_promo_comparison:   "What should we do?",
    nfcu_sup_turn_2_recommendations:  "Activate the cross-trained agents",
    // Intraday demo flow
    intraday_t1_greeting:             "Walk me through the SIP impact",
    intraday_t2_walkthrough:          "What about the rate promotion impact?",
    intraday_t3_correlate:            "What are my options?",
    intraday_t4_options:              "Execute Plan C",
    intraday_t5_execute:              "What should I tell leadership right now?",
    intraday_t6_brief:                "Show me historical incidents like this",
  },
  flowKeyToCapabilityTrigger: {
    nfcu_sup_greeting: 'home_load',
    nfcu_sup_signal_1_queue_spike: 'home_load',
    nfcu_sup_signal_2_staffing: 'home_load',
    nfcu_sup_signal_3_sentiment: 'home_load',
    nfcu_sup_root_cause_correlation: 'ask_turn_2',
    nfcu_sup_turn_1_queue_health: 'ask_turn_1',
    nfcu_sup_service_level_now: 'ask_turn_1',
    nfcu_sup_rate_promo_comparison: 'ask_turn_2',
    nfcu_sup_migration_status: 'ask_turn_2',
    nfcu_sup_turn_2_recommendations: 'ask_turn_3',
    nfcu_sup_overtime_agents: 'ask_turn_3',
    // Intraday capability triggers — map to existing trigger keys so the modal still fires
    intraday_t1_greeting: 'home_load',
    intraday_t2_walkthrough: 'ask_turn_1',
    intraday_t3_correlate: 'ask_turn_2',
    intraday_t4_options: 'ask_turn_3',
  },
  intradayTiers: ['supervisor', 'executive', 'agent'],
  stats: [
    {
      id: 'queue', label: 'Active Calls in Queue', value: '47', trend: '↑ spike active', positive: false,
      icon: Headphones, iconColor: 'text-red-600', iconBg: 'bg-red-500/10',
      chipText: "What is my service level right now?",
    },
    {
      id: 'sla', label: 'Service Level (80/20)', value: '71.3%', trend: 'Below 80% target', positive: false,
      icon: Gauge, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: "Show me today's queue health",
    },
    {
      id: 'aht', label: 'Avg Handle Time', value: '8:42', trend: 'Promo: 11:20 avg', positive: false,
      icon: Cpu, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10',
      chipText: "What is driving the longest handle times?",
    },
    {
      id: 'csat', label: 'CSAT (7-day)', value: '3.8/5.0', trend: '↓ Sentiment alert', positive: false,
      icon: Star, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10',
      chipText: "Show me the sentiment signal",
    },
    {
      id: 'abandon', label: 'Abandonment Rate', value: '14.2%', trend: 'D365 + Genesys blended', positive: false,
      icon: TrendingDown, iconColor: 'text-red-600', iconBg: 'bg-red-500/10',
      chipText: "Show me queue performance by channel",
    },
  ],
  signalToChip: {
    'SIG-NFCU-SUP-001': "What caused the auto loan spike?",
    'SIG-NFCU-SUP-002': "Show me staffing for Friday",
    'SIG-NFCU-SUP-003': "Show me the sentiment signal",
    // Briefing-panel live signals — each tile dispatches a chip with a
    // matching chat flow.
    'SIG-INTRA-SUP-001': "Walk me through the dual incident",
    'SIG-INTRA-SUP-002': "Show me the PinDrop auth failures",
    'SIG-INTRA-SUP-003': "Why is IVR containment dropping?",
    // Briefing-panel trend signals.
    'TREND-SUP-001': "Show the auto loans sentiment trend",
    'TREND-SUP-002': "Show the repeat-contact pattern",
    'TREND-SUP-003': "Show the agent fatigue watch list",
  },
  greetingFlowKey: 'nfcu_sup_greeting',
};

// ─── NFCU: Workforce Analyst (Derek Whitfield) ───────────────────
const nfcuAnalystUI = {
  initialChips: [
    "Walk me through the tax season risk",
    "Show me the training cohort data",
    "What is my overtime trajectory?",
    "Forecast next week's volume by 15-minute interval",
    "Show me schedule adherence by team",
  ],
  goldenPathChip: {
    nfcu_ana_greeting:          "Walk me through the tax season risk",
    nfcu_ana_turn_1_tax_season: "Run a what-if with 15 overtime shifts",
    nfcu_ana_turn_2_what_if:    "What about the new hire cohort?",
  },
  flowKeyToCapabilityTrigger: {
    nfcu_ana_greeting: 'home_load',
    nfcu_ana_signal_1_tax_season: 'home_load',
    nfcu_ana_signal_2_training: 'home_load',
    nfcu_ana_signal_3_ot_budget: 'home_load',
    nfcu_ana_turn_1_tax_season: 'ask_turn_1',
    nfcu_ana_ot_trajectory: 'ask_turn_1',
    nfcu_ana_schedule_adherence: 'ask_turn_1',
    nfcu_ana_turn_2_what_if: 'ask_turn_2',
    nfcu_ana_turn_3_cohort: 'ask_turn_3',
    nfcu_ana_weekly_report: 'ask_turn_3',
  },
  stats: [
    {
      id: 'ftl', label: 'Force-to-Load Ratio', value: '0.94', trend: 'Target: 1.0', positive: false,
      icon: Gauge, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: "Show me force-to-load ratio by queue",
    },
    {
      id: 'adherence', label: 'Schedule Adherence', value: '87.3%', trend: 'Target: 90%', positive: false,
      icon: CheckCircle, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10',
      chipText: "Show me schedule adherence by team",
    },
    {
      id: 'ot', label: 'Overtime Hours MTD', value: '342 hrs', trend: '78% of Q2 budget', positive: false,
      icon: AlertTriangle, iconColor: 'text-red-600', iconBg: 'bg-red-500/10',
      chipText: "What is my overtime trajectory?",
    },
    {
      id: 'attrition', label: 'Attrition (90-day)', value: '18%', trend: 'Above benchmark', positive: false,
      icon: TrendingDown, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10',
      chipText: "What is my agent attrition trend?",
    },
    {
      id: 'forecast', label: 'Forecast Accuracy (30d)', value: '82%', trend: 'Target: 85%', positive: false,
      icon: Target, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10',
      chipText: "Compare actual vs. forecast accuracy this month",
    },
  ],
  signalToChip: {
    'SIG-NFCU-ANA-001': "Walk me through the tax season risk",
    'SIG-NFCU-ANA-002': "Show me the training cohort data",
    'SIG-NFCU-ANA-003': "What is my overtime trajectory?",
  },
  greetingFlowKey: 'nfcu_ana_greeting',
};

// ─── NFCU: Quality & Member Experience Analyst (Janelle Moreau) ──
const nfcuWorkforceUI = {
  initialChips: [
    "Walk me through the compliance issue",
    "Show me the repeat contact data",
    "Which agents are at risk?",
    "Show me quality scores by team this week",
    "Generate a quality scorecard",
  ],
  goldenPathChip: {
    nfcu_wf_greeting:                 "Walk me through the compliance issue",
    nfcu_wf_turn_1_compliance_detail: "Recommend a fix",
    nfcu_wf_turn_2_remediation:       "Next signal",
    nfcu_wf_signal_2_repeat_contact:  "Show me the repeat contact data",
    nfcu_wf_turn_3_repeat_contacts:   "What should we tell agents?",
  },
  flowKeyToCapabilityTrigger: {
    nfcu_wf_greeting: 'home_load',
    nfcu_wf_signal_1_compliance: 'home_load',
    nfcu_wf_signal_2_repeat_contact: 'home_load',
    nfcu_wf_signal_3_burnout: 'home_load',
    nfcu_wf_turn_1_compliance_detail: 'ask_turn_1',
    nfcu_wf_quality_scores: 'ask_turn_1',
    nfcu_wf_turn_2_remediation: 'ask_turn_2',
    nfcu_wf_turn_3_repeat_contacts: 'ask_turn_2',
    nfcu_wf_agent_coaching: 'ask_turn_3',
    nfcu_wf_quality_scorecard: 'ask_turn_3',
    nfcu_wf_cost_impact: 'ask_turn_3',
  },
  stats: [
    {
      id: 'quality', label: 'Quality Score (30-day)', value: '82/100', trend: 'Target: 85', positive: false,
      icon: Award, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10',
      chipText: 'Show me quality scores by team this week',
    },
    {
      id: 'adherence', label: 'Process Adherence', value: '77%', trend: 'BSA/AML gap active', positive: false,
      icon: ShieldAlert, iconColor: 'text-red-600', iconBg: 'bg-red-500/10',
      chipText: 'Walk me through the compliance issue',
    },
    {
      id: 'fcr', label: 'First Contact Resolution', value: '68%', trend: 'Bill pay: 54%', positive: false,
      icon: CheckCircle, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: 'Show me the repeat contact data',
    },
    {
      id: 'sentiment', label: 'Negative Sentiment', value: '18%', trend: 'Target: <15%', positive: false,
      icon: TrendingDown, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10',
      chipText: "Show me sentiment trends by queue",
    },
    {
      id: 'repeat', label: 'Repeat Contact (48hr)', value: '22%', trend: 'Target: <12%', positive: false,
      icon: AlertTriangle, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: "Show me the repeat contact data",
    },
  ],
  signalToChip: {
    'SIG-NFCU-WF-001': "Walk me through the compliance issue",
    'SIG-NFCU-WF-002': "Show me the repeat contact data",
    'SIG-NFCU-WF-003': "Which agents are at risk?",
  },
  greetingFlowKey: 'nfcu_wf_greeting',
};

// ─── NFCU: Director, Contact Center Operations (Marcus Tillman) ──
const nfcuDirectorUI = {
  initialChips: [
    "Walk me through the service level issue",
    "Show me the migration risk",
    "What is my budget exposure?",
    "Show root cause correlation",
    "Generate my weekly leadership report",
  ],
  goldenPathChip: {
    nfcu_dir_greeting:           "Walk me through the service level issue",
    nfcu_dir_signal_1_service:   "What are my options to stabilize both teams?",
    nfcu_dir_turn_2_scenarios:   "Execute Scenario C",
    nfcu_dir_act_scenario_c:     "Draft an escalation to the SI partner",
    nfcu_dir_act_si_escalation:  "Generate my weekly leadership report",
    // Intraday demo flow (director / executive perspective)
    intraday_dir_t1_greeting:    "Walk me through the SIP impact",
    intraday_dir_t2_walkthrough: "What about the rate promotion impact?",
    intraday_dir_t3_correlate:   "What are my options?",
    intraday_dir_t4_options:     "Execute Plan C",
    intraday_dir_t5_execute:     "What should I tell the COO right now?",
    intraday_dir_t6_brief:       "Show me historical incidents like this",
  },
  flowKeyToCapabilityTrigger: {
    nfcu_dir_greeting: 'home_load',
    nfcu_dir_signal_1_service: 'home_load',
    nfcu_dir_signal_2_migration: 'home_load',
    nfcu_dir_signal_3_budget: 'home_load',
    nfcu_dir_root_cause_correlation: 'ask_turn_2',
    nfcu_dir_turn_1_team_rollup: 'ask_turn_1',
    nfcu_dir_cascade_impact: 'ask_turn_5',
    nfcu_dir_priority_call: 'ask_turn_2',
    nfcu_dir_quarter_compare: 'ask_turn_2',
    nfcu_dir_turn_2_scenarios: 'ask_turn_2',
    nfcu_dir_migration_detail: 'ask_turn_3',
    nfcu_dir_phase_2_options: 'ask_turn_2',
    nfcu_dir_deadline_impact: 'ask_turn_3',
    nfcu_dir_budget_exposure: 'ask_turn_5',
    nfcu_dir_budget_cuts: 'ask_turn_2',
    nfcu_dir_turn_3_actions: 'ask_turn_4',
    nfcu_dir_act_scenario_c: 'ask_turn_4',
    nfcu_dir_act_si_escalation: 'ask_turn_4',
    nfcu_dir_act_weekly_report: 'ask_turn_4',
    nfcu_dir_weekly_report: 'ask_turn_4',
    nfcu_dir_month_compare: 'ask_turn_2',
    nfcu_dir_attrition_detail: 'ask_turn_5',
    nfcu_dir_priority_week: 'ask_turn_2',
    // Intraday capability triggers
    intraday_dir_t1_greeting: 'home_load',
    intraday_dir_t2_walkthrough: 'ask_turn_1',
    intraday_dir_t3_correlate: 'ask_turn_2',
    intraday_dir_t4_options: 'ask_turn_3',
  },
  intradayTiers: ['executive', 'supervisor', 'agent'],
  stats: [
    {
      id: 'agg_sl', label: 'Aggregate Service Level', value: '68%', trend: 'Below 80% target', positive: false,
      icon: Gauge, iconColor: 'text-red-600', iconBg: 'bg-red-500/10',
      chipText: 'Show me service levels across all teams',
    },
    {
      id: 'cost', label: 'Cost per Contact', value: '$7.42', trend: '+7.7% MoM', positive: false,
      icon: DollarSign, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: 'Show me cost per contact trend',
    },
    {
      id: 'csat', label: 'CSAT (30-day)', value: '3.9/5.0', trend: 'Stable despite SL dip', positive: true,
      icon: Star, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10',
      chipText: "Compare to last month's report",
    },
    {
      id: 'attrition', label: 'Agent Attrition (90d)', value: '16.4%', trend: '+2.3pts QoQ', positive: false,
      icon: TrendingDown, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10',
      chipText: 'Drill into the attrition data',
    },
    {
      id: 'migration', label: 'Migration Phase 2', value: '64%', trend: '12 days behind', positive: false,
      icon: AlertTriangle, iconColor: 'text-red-600', iconBg: 'bg-red-500/10',
      chipText: 'What is my migration status?',
    },
    {
      id: 'ot', label: 'Q2 Overtime Spend', value: '$287K / $412K', trend: 'Trajectory: 138%', positive: false,
      icon: Briefcase, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: 'What is my overtime budget exposure?',
    },
  ],
  signalToChip: {
    'SIG-NFCU-DIR-001': "Walk me through the service level issue",
    'SIG-NFCU-DIR-002': "Show me the migration risk",
    'SIG-NFCU-DIR-003': "What is my budget exposure?",
    // Briefing-panel live signals.
    'SIG-INTRA-DIR-001': "Walk me through the SIP degradation",
    'SIG-INTRA-DIR-002': "Show the rate promo volume surge",
    'SIG-INTRA-DIR-003': "Show the cross-team cascade risk",
    // Briefing-panel trend signals.
    'TREND-DIR-001': "Show the member sentiment trend",
    'TREND-DIR-002': "Show the mortgage repeat-contact pattern",
    'TREND-DIR-003': "Show the staffing availability outlook",
  },
  greetingFlowKey: 'nfcu_dir_greeting',
};

// ─── NFCU: Member Self-Service (Elena Ruiz) ──────────────────────
const nfcuMemberUI = {
  initialChips: [
    "What's my balance?",
    "Why was my payment declined?",
    "Will I be charged a late fee?",
    "Fix my direct deposit",
    "Is my paycheck deposited yet?",
  ],
  goldenPathChip: {
    nfcu_member_greeting:      "What's my balance?",
    nfcu_member_step2_balance: "Now tell me about the declined payment",
    nfcu_member_step3_decline: "Why isn't my salary being applied?",
    nfcu_member_step4_salary:  "Will I be charged a late fee?",
    nfcu_member_step5_latefee: "Do the fix and retry the payment",
    nfcu_member_step6_fix:     "Anything else I should know?",
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
    {
      id: 'balance', label: 'Available Balance', value: '$1,847.20', trend: 'Checking · real-time', positive: true,
      icon: DollarSign, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10',
      chipText: "What's my balance?",
    },
    {
      id: 'pending', label: 'Pending Transactions', value: '2', trend: 'Core Banking', positive: true,
      icon: ArrowLeftRight, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10',
      chipText: 'Show my recent transactions',
    },
    {
      id: 'next_payment', label: 'Auto Loan Next Payment', value: '$412.00', trend: 'Due Jul 1', positive: true,
      icon: CalendarDays, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10',
      chipText: 'When is my next auto loan payment due?',
    },
    {
      id: 'card_balance', label: 'Credit Card Balance', value: '$1,203.55', trend: 'Core Banking', positive: true,
      icon: CreditCard, iconColor: 'text-slate-600', iconBg: 'bg-slate-500/10',
      chipText: null,
    },
    {
      id: 'declined', label: 'Declined Payments (30d)', value: '1', trend: 'Needs attention', positive: false,
      icon: AlertTriangle, iconColor: 'text-red-600', iconBg: 'bg-red-500/10',
      chipText: 'Why was my payment declined?',
    },
    {
      id: 'early_credit', label: 'Early Salary Credit Pending', value: '$3,140.00', trend: 'Held — routing missing', positive: false,
      icon: Wallet, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: 'Is my paycheck deposited yet?',
    },
  ],
  signalToChip: {
    'SIG-NFCU-MEM-001': "Tell me why it was declined",
    'SIG-NFCU-MEM-002': "Why isn't my salary being applied?",
    'SIG-NFCU-MEM-003': "Will I be charged a late fee?",
  },
  greetingFlowKey: 'nfcu_member_greeting',
};

// ─── NFCU: Agent-Assist (David Torres) ───────────────────────────
const nfcuAgentUI = {
  initialChips: [
    "Why was this member's payment declined?",
    "Correlate the decline across her accounts",
    "How do I explain this in plain language?",
    "What's the compliant resolution?",
    "Prompt the identity verification step",
  ],
  goldenPathChip: {
    nfcu_agent_greeting:         "Give me the full breakdown",
    nfcu_agent_step2_breakdown:  "How do I explain this simply?",
    nfcu_agent_step3_explain:    "Verify her identity first",
    nfcu_agent_step4_verify:     "Identity confirmed",
    nfcu_agent_step5_identity:   "Do the routing fix and retry",
    nfcu_agent_step6_execute:    "Wrap up the call",
    nfcu_agent_step7_wrapup:     "Save and close",
  },
  flowKeyToCapabilityTrigger: {
    nfcu_agent_greeting: 'home_load',
    nfcu_agent_step2_breakdown: 'ask_turn_1',
    nfcu_agent_step3_explain: 'ask_turn_2',
    nfcu_agent_step4_verify: 'ask_turn_3',
    nfcu_agent_step5_identity: 'ask_turn_4',
    nfcu_agent_step6_execute: 'ask_turn_5',
    nfcu_agent_step7_wrapup: 'ask_turn_6',
  },
  stats: [
    {
      id: 'aht', label: 'Avg Handle Time (Today)', value: '7:48', trend: 'Dynamics 365', positive: true,
      icon: Clock, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10',
      chipText: null,
    },
    {
      id: 'fcr', label: 'First Contact Resolution', value: '74%', trend: 'Dynamics 365 + CRM', positive: true,
      icon: CheckCircle, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10',
      chipText: null,
    },
    {
      id: 'quality', label: 'Quality Score (30d)', value: '91/100', trend: 'Quality Management', positive: true,
      icon: Award, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10',
      chipText: null,
    },
    {
      id: 'calls', label: 'Calls Handled (Today)', value: '23', trend: 'Dynamics 365', positive: true,
      icon: Headphones, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10',
      chipText: null,
    },
    {
      id: 'sentiment', label: 'Live Sentiment (Current Call)', value: 'Negative', trend: 'Rising — 90s window', positive: false,
      icon: TrendingDown, iconColor: 'text-red-600', iconBg: 'bg-red-500/10',
      chipText: 'How do I explain this in plain language?',
    },
    {
      id: 'adherence', label: 'Schedule Adherence', value: '93%', trend: 'Dynamics 365 WFM', positive: true,
      icon: Gauge, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10',
      chipText: null,
    },
  ],
  signalToChip: {
    'SIG-NFCU-AGT-001': "Give me the full breakdown",
    'SIG-NFCU-AGT-002': "How do I explain this in plain language?",
    'SIG-NFCU-AGT-003': "Prompt the identity verification step",
  },
  greetingFlowKey: 'nfcu_agent_greeting',
};

// ─── PenFed-only: Capital Markets Risk (Sowmya Ha) ───────────────
// Visible only when clientId === 'penfed' (gated in PersonaContext).
const capmarketsUI = {
  initialChips: [
    "Yes, walk me through them",
    "What is driving the delinquency spike?",
    "Show me hedge positions",
  ],
  goldenPathChip: {
    greeting:                  "Yes, walk me through them",
    // signal_1_abs is now the talk-track Converged Conversation moment;
    // the next golden-path beat is the dealer breakdown (Friction Observability).
    signal_1_abs:              "Show me the dealer-level breakdown",
    turn_1_walkthrough:        "Show me the dealer-level breakdown",
    turn_2_dealer_breakdown:   "What happens if we breach the trigger?",
    turn_3_trigger_scenarios:  "Show me the hedge effectiveness signal",
    turn_4_hedge_anomaly:      "What does this mean for our capital ratio?",
    turn_5_capital_impact:     "Execute the remediation path",
  },
  flowKeyToCapabilityTrigger: {
    greeting: 'home_load',
    signal_1_abs: 'home_load',
    signal_2_hedge: 'home_load',
    signal_3_dealer: 'home_load',
    turn_1_walkthrough: 'ask_turn_1',
    turn_2_dealer_breakdown: 'ask_turn_2',
    turn_3_trigger_scenarios: 'ask_turn_3',
    turn_4_hedge_anomaly: 'ask_turn_4',
    turn_5_capital_impact: 'ask_turn_5',
    turn_6_actions: 'ask_turn_6',
  },
  stats: [
    {
      id: 'abs_outstanding', label: 'ABS Outstanding', value: '$1.3B', trend: '3 active trusts', positive: true,
      icon: DollarSign, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10',
      chipText: 'Show me ABS portfolio outstanding',
    },
    {
      id: 'dq_60plus', label: '60+ Delinquency', value: '1.62%', trend: '2024-A near trigger', positive: false,
      icon: AlertTriangle, iconColor: 'text-red-600', iconBg: 'bg-red-500/10',
      chipText: 'Show me ABS collateral performance across all trusts',
    },
    {
      id: 'cpr', label: 'Prepayment (CPR)', value: '14.8%', trend: 'In line w/ deal', positive: true,
      icon: TrendingDown, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10',
      chipText: 'Compare prepayment speeds: 2024-A vs. 2025-A',
    },
    {
      id: 'nim', label: 'Net Interest Margin', value: '2.41%', trend: 'Stable', positive: true,
      icon: TrendingUp, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10',
      chipText: 'What is our current interest rate exposure?',
    },
    {
      id: 'hedge', label: 'Hedge Effectiveness', value: '89.7%', trend: '-6.5 pts (90d)', positive: false,
      icon: Gauge, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: 'Show me the hedge effectiveness signal',
    },
    {
      id: 'capital_ratio', label: 'Regulatory Capital', value: '10.32%', trend: 'Well-capitalized', positive: true,
      icon: ShieldAlert, iconColor: 'text-blue-700', iconBg: 'bg-blue-500/10',
      chipText: 'What is our capital ratio sensitivity to credit losses?',
    },
    {
      id: 'rating_review', label: 'Next Rating Review', value: 'Q3 2026', trend: 'S&P / Fitch', positive: true,
      icon: Star, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10',
      chipText: 'Show me the rating agency timeline and open items',
    },
    {
      id: 'sources', label: 'Data Sources', value: '7', trend: 'All connected', positive: true,
      icon: Database, iconColor: 'text-slate-600', iconBg: 'bg-slate-500/10',
      chipText: 'Show me connected data sources',
    },
  ],
  signalToChip: {
    // Clicking the PNFED 2024-A signal card lands the full Converged
    // Conversation synthesis (trigger numbers + dealer concentration +
    // Bloomberg spread context) — routed through signalSequence so the
    // enriched signal_1_abs flow fires.
    'SIG-CAPM-001': 'Yes, walk me through them',
    'SIG-CAPM-002': 'Show me the hedge effectiveness signal',
    'SIG-CAPM-003': 'Show me the dealer-level breakdown',
  },
  greetingFlowKey: 'greeting',
};

// ─── USSFCU-only: Chief Financial Officer (Sylvia Reyes) ─────────
// Visible only when clientId === 'ussfcu' (gated in PersonaContext).
// Enterprise financial data-governance / audit story. 8 KPIs render via the
// paginated KPI carousel (4-up), same as the PenFed capmarkets executive.
const ussfcuCfoUI = {
  initialChips: [
    "Why doesn't my loan-loss number match Lending?",
    "Show me the data flow from the core to Tableau",
    "Which board figures have no lineage?",
    "Reconcile the portfolio balance to one governed number",
    "How long until the audit closes?",
    "How many hours are we spending on manual reconciliation?",
    "Generate the audit evidence package",
    "Draft the data-governance remediation plan",
  ],
  goldenPathChip: {
    ussfcu_cfo_greeting:               "Show me where the numbers break",
    ussfcu_cfo_turn_show_break:        "Show me the data flow that produced this",
    ussfcu_cfo_turn_data_flow:         "What would full lineage do for the audit?",
    ussfcu_cfo_turn_full_lineage:      "Show me the CFO and Lending parity gap",
    ussfcu_cfo_turn_parity_gap:        "Generate the audit evidence package",
    ussfcu_cfo_turn_evidence_package:  "Draft the data-governance remediation plan",
    ussfcu_cfo_turn_remediation_plan:  "Export for the leadership event",
  },
  flowKeyToCapabilityTrigger: {
    ussfcu_cfo_greeting: 'home_load',
    ussfcu_cfo_signal_1_loanloss: 'ask_turn_1',
    ussfcu_cfo_signal_2_parity: 'ask_turn_4',
    ussfcu_cfo_signal_3_lineage: 'ask_turn_2',
    ussfcu_cfo_turn_show_break: 'ask_turn_1',
    ussfcu_cfo_systems_out_of_sync: 'ask_turn_1',
    ussfcu_cfo_time_cost: 'ask_turn_2',
    ussfcu_cfo_turn_data_flow: 'ask_turn_2',
    ussfcu_cfo_highest_risk_figures: 'ask_turn_2',
    ussfcu_cfo_fix_worst_gap: 'ask_turn_2',
    ussfcu_cfo_turn_full_lineage: 'ask_turn_3',
    ussfcu_cfo_audit_timeline: 'ask_turn_3',
    ussfcu_cfo_remediation_requires: 'ask_turn_3',
    ussfcu_cfo_reconcile_now: 'ask_turn_5',
    ussfcu_cfo_turn_parity_gap: 'ask_turn_4',
    ussfcu_cfo_reconcile_parity: 'ask_turn_5',
    ussfcu_cfo_who_sees_what: 'ask_turn_4',
    ussfcu_cfo_turn_evidence_package: 'ask_turn_5',
    ussfcu_cfo_route_and_notify: 'ask_turn_5',
    ussfcu_cfo_whats_open: 'ask_turn_5',
    ussfcu_cfo_turn_remediation_plan: 'ask_turn_3',
    ussfcu_cfo_export_leadership: 'ask_turn_5',
    ussfcu_cfo_budget_estimate: 'ask_turn_3',
    ussfcu_cfo_access_routing: 'ask_turn_5',
    ussfcu_cfo_peer_benchmarks: 'ask_turn_3',
  },
  stats: [
    {
      id: 'audit_items', label: 'Audit Items Open', value: '38 of 64', trend: 'Audit / GRC System', positive: false,
      icon: ClipboardList, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: "How long until the audit closes?",
    },
    {
      id: 'recon_breaks', label: 'Reconciliation Breaks', value: '19', trend: 'GL + Ledger, unresolved', positive: false,
      icon: GitCompareArrows, iconColor: 'text-red-600', iconBg: 'bg-red-500/10',
      chipText: "Show me where the numbers break",
    },
    {
      id: 'parity', label: 'CFO-to-Lending Parity', value: '82%', trend: 'GL vs. Origination', positive: false,
      icon: Scale, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: "Show me the CFO and Lending parity gap",
    },
    {
      id: 'lineage_gap', label: 'Figures Lacking Lineage', value: '47', trend: 'Tableau dashboards', positive: false,
      icon: FileWarning, iconColor: 'text-red-600', iconBg: 'bg-red-500/10',
      chipText: "Which board figures have no lineage?",
    },
    {
      id: 'recon_hours', label: 'Manual Recon Hours (MTD)', value: '164 hrs', trend: 'Finance time logs', positive: false,
      icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: "How many hours are we spending on manual reconciliation?",
    },
    {
      id: 'close_cycle', label: 'Month-End Close Cycle', value: '9.5 days', trend: 'Finance Close Tracker', positive: false,
      icon: CalendarDays, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10',
      chipText: null,
    },
    {
      id: 'audit_days', label: 'Days to Audit Completion', value: '31 days', trend: 'Projected', positive: false,
      icon: Target, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: "How long until the audit closes?",
    },
    {
      id: 'sources', label: 'Data Sources Connected', value: '6', trend: '1 partial (Tableau)', positive: true,
      icon: Database, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10',
      chipText: null,
    },
  ],
  signalToChip: {
    'SIG-USSFCU-CFO-001': "Show me where the numbers break",
    'SIG-USSFCU-CFO-002': "Show me the CFO and Lending parity gap",
    'SIG-USSFCU-CFO-003': "Show me the data flow that produced this",
  },
  greetingFlowKey: 'ussfcu_cfo_greeting',
};

// ─── USSFCU-only: President & CEO (Timothy L. Anderson) ──────────
// Visible only when clientId === 'ussfcu' (gated in PersonaContext). Pure
// executive altitude: state-of-the-business roll-up with a first-class data
// trust strip. 8 KPIs render via the paginated KPI carousel (4-up), same as
// the USSFCU CFO and PenFed capmarkets executives.
const ussfcuCeoUI = {
  initialChips: [
    "Where does the business stand this morning?",
    "Walk me through the liquidity signal",
    "Can I trust these numbers?",
    "What happens to liquidity if this continues?",
    "Show me membership and growth",
    "Trace net income back to source",
    "Draft the board briefing",
    "Open the full briefing",
  ],
  goldenPathChip: {
    ussfcu_ceo_greeting:            "Walk me through the liquidity signal",
    ussfcu_ceo_turn_liquidity:      "What happens to liquidity if this continues?",
    ussfcu_ceo_turn_projection:     "Can I trust these numbers this morning?",
    ussfcu_ceo_turn_trust:          "Trace net income back to source",
    // trace_net_income's follow-up chips are trust / draft-briefing / full-briefing
    // (not membership), so highlight "Draft the board briefing" as the active
    // proceed step — it leads on to "Open the full briefing".
    ussfcu_ceo_trace_net_income:    "Draft the board briefing",
    ussfcu_ceo_turn_membership:     "Draft the board briefing",
    ussfcu_ceo_turn_board_briefing: "Open the full briefing",
  },
  flowKeyToCapabilityTrigger: {
    ussfcu_ceo_greeting: 'home_load',
    ussfcu_ceo_signal_1_liquidity: 'home_load',
    ussfcu_ceo_signal_2_membership: 'home_load',
    ussfcu_ceo_signal_3_trust: 'home_load',
    ussfcu_ceo_where_stands: 'home_load',
    ussfcu_ceo_turn_liquidity: 'ask_turn_1',
    ussfcu_ceo_turn_membership: 'ask_turn_1',
    ussfcu_ceo_turn_projection: 'ask_turn_2',
    ussfcu_ceo_national_opportunity: 'ask_turn_2',
    ussfcu_ceo_turn_trust: 'ask_turn_3',
    ussfcu_ceo_trace_net_income: 'ask_turn_4',
    ussfcu_ceo_turn_board_briefing: 'ask_turn_5',
    ussfcu_ceo_export_document: 'ask_turn_5',
    ussfcu_ceo_add_recommendation: 'ask_turn_5',
    ussfcu_ceo_turn_full_briefing: 'ask_turn_5',
  },
  stats: [
    {
      id: 'assets', label: 'Total Assets', value: '$1.53B', trend: '+8.2% YoY', positive: true,
      icon: DollarSign, iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10',
      chipText: "Where does the business stand this morning?",
    },
    {
      id: 'members', label: 'Members', value: '52,488', trend: '+3.1% YTD', positive: true,
      icon: Users, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-500/10',
      chipText: "Show me membership and growth",
    },
    {
      id: 'net_worth', label: 'Net Worth Ratio', value: '7.50%', trend: 'Well capitalized', positive: true,
      icon: ShieldAlert, iconColor: 'text-blue-700', iconBg: 'bg-blue-500/10',
      chipText: null,
    },
    {
      id: 'loan_to_share', label: 'Loan-to-Share Ratio', value: '84%', trend: '+6 pts · 5-yr high', positive: false,
      icon: Scale, iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10',
      chipText: "Walk me through the liquidity signal",
    },
    {
      id: 'net_income', label: 'Net Income, YTD', value: '$9.4M', trend: '+6.8% vs plan', positive: true,
      icon: TrendingUp, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10',
      chipText: null,
    },
    {
      id: 'nps', label: 'Member NPS', value: '71', trend: 'Voice of Member', positive: true,
      icon: Star, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10',
      chipText: null,
    },
    {
      id: 'data_trust', label: 'Data Trust Score', value: '98%', trend: 'Validated 6:00 AM ET', positive: true,
      icon: CheckCircle, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10',
      chipText: "Can I trust these numbers?",
    },
    {
      id: 'sources', label: 'Data Sources Connected', value: '6', trend: '1 in migration', positive: true,
      icon: Database, iconColor: 'text-slate-600', iconBg: 'bg-slate-500/10',
      chipText: null,
    },
  ],
  signalToChip: {
    'SIG-USSFCU-CEO-001': "Walk me through the liquidity signal",
    'SIG-USSFCU-CEO-002': "Show me membership and growth",
    'SIG-USSFCU-CEO-003': "Can I trust these numbers this morning?",
  },
  greetingFlowKey: 'ussfcu_ceo_greeting',
};

// ─── Export registry ─────────────────────────────────────────────
const personaUIConfigs = {
  ops: opsUI,
  cx: cxUI,
  retention: retentionUI,
  risk: riskUI,
  capmarkets: capmarketsUI,
  nfcu_supervisor: nfcuSupervisorUI,
  nfcu_analyst: nfcuAnalystUI,
  nfcu_workforce: nfcuWorkforceUI,
  nfcu_director: nfcuDirectorUI,
  nfcu_member: nfcuMemberUI,
  nfcu_agent: nfcuAgentUI,
  ussfcu_cfo: ussfcuCfoUI,
  ussfcu_ceo: ussfcuCeoUI,
};

export default personaUIConfigs;
