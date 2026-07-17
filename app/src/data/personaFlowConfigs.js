/**
 * Per-persona flow configurations.
 * Each persona defines: chatFlows, chipToFlowKey, askTurnSequence, signalSequence, actionTurnKey, actionConfirmMap.
 */

import opsChatFlows from './chatFlows.json';
import cxChatFlows from './cx/chatFlows.json';
import retChatFlows from './retention/chatFlows.json';
import riskChatFlows from './risk/chatFlows.json';
import penfedOpsChatFlows from './penfed/chatFlows.json';
import penfedCxChatFlows from './penfed/cx/chatFlows.json';
import penfedRetChatFlows from './penfed/retention/chatFlows.json';
import penfedCapmChatFlows from './penfed/capmarkets/chatFlows.json';
import nfcuSupChatFlows from './nfcu/supervisor/chatFlows.json';
import nfcuSupIntradayChatFlows from './nfcu/supervisor/intradayChatFlows.json';
import nfcuAnaChatFlows from './nfcu/analyst/chatFlows.json';
import nfcuWfChatFlows from './nfcu/workforce/chatFlows.json';
import nfcuDirChatFlows from './nfcu/director/chatFlows.json';
import nfcuDirIntradayChatFlows from './nfcu/director/intradayChatFlows.json';
import nfcuMemberChatFlows from './nfcu/member/chatFlows.json';
import nfcuAgentChatFlows from './nfcu/agent/chatFlows.json';
import nfcuPaChatFlows from './nfcu/platform-admin/chatFlows.json';
import ussfcuCfoChatFlows from './ussfcu/cfo/chatFlows.json';
import ussfcuCeoChatFlows from './ussfcu/ceo/chatFlows.json';

// ─── Operations & Analytics (Maya J.) ────────────────────────────
const opsConfig = {
  chatFlows: opsChatFlows,
  chipToFlowKey: {
    // Home screen flow
    'Yes, walk me through them': 'signal_1_mortgage',
    'Next signal': '__next_signal__',
    'Show me the full member journey': 'show_journey_from_home',
    'Who are these members?': 'turn_2_segmentation',
    'What should we do?': 'turn_4_actions',
    'Show me the member sentiment': 'member_sentiment',
    'Which segments?': 'turn_2_segmentation',
    'Pull the Genesys themes': 'genesys_themes',
    'How does this affect NPS?': 'nps_impact',
    "I'm ready to act": 'turn_4_actions',

    // Ask the AI flow
    "What's driving the mortgage drop-off?": 'turn_1_mortgage_dropoff',
    "Yes, show me who's affected": 'turn_2_segmentation',
    "What's the revenue impact?": 'revenue_impact',
    'Help me act on this': 'turn_4_actions',
    'Yes, create the segment': 'create_segment_confirm',
    'Not yet — show me more': 'turn_3_predictive',
    'Which members are most at risk of leaving?': 'turn_3_predictive',
    'Yes, model the impact': 'model_retention_impact',
    'Pull the Genesys themes for that segment': 'genesys_themes_segment',
    'What would you recommend?': 'turn_5_anomaly_detection',
    'Tell me about the CD complaint cluster': 'signal_3_cd_complaint',
    'Tell me about the auto loan trend': 'signal_2_auto_loan',
    'Scan for anomalies across systems': 'turn_5_anomaly_detection',
    'Escalate flagged accounts': 'escalate_flagged_accounts',
    'Show the full audit trail': 'anomaly_audit_trail',

    // Sub-flow follow-ups
    'Draft member outreach message': 'draft_outreach',
    'Send to marketing team': 'send_to_marketing',
    'Yes, notify them in Slack': 'slack_notify_confirm',
    'Not now': 'turn_5_anomaly_detection',
    'Generate a member friction brief': 'member_friction_brief',

    // Report format options
    'PowerPoint slide': 'report_powerpoint',
    'One-page PDF': 'report_pdf',
    'Email draft for my team': 'report_email',

    // Data Overview card triggers
    'Show me at-risk members': 'active_members_overview',
    'Show me active member breakdown': 'active_members_overview',
    'Summarize active alerts': 'alerts_overview',
    'Show me active alerts': 'alerts_overview',
    'Show process health': 'processes_overview',
    'Show me process health': 'processes_overview',

    // Risk screen flow
    "What's driving the transaction anomaly cluster?": 'risk_anomaly_explanation',
    'How does our NCUA posture compare to last quarter?': 'ncua_comparison',
    'Generate a board-level risk summary': 'board_risk_summary',
  },
  signalSequence: ['signal_1_mortgage', 'signal_2_auto_loan', 'signal_3_cd_complaint'],
  askTurnSequence: ['turn_1_mortgage_dropoff', 'turn_2_segmentation', 'turn_3_predictive', 'turn_5_anomaly_detection', 'turn_4_actions'],
  actionTurnKey: 'turn_4_actions',
  actionConfirmMap: {
    'ACT-001': { responseKey: 'jira', nextChips: ['Yes, notify them in Slack', 'Not now'] },
    'ACT-002': { responseKey: 'calendar', nextChips: ['Generate a member friction brief'] },
    'ACT-003': { responseKey: 'anomaly_scan', nextChips: ['Scan for anomalies across systems'] },
  },
};

// ─── CX Operator (Priya K.) ──────────────────────────────────────
const cxConfig = {
  chatFlows: cxChatFlows,
  chipToFlowKey: {
    'Yes, walk me through them': 'cx_signal_1_channel_switch',
    'Next signal': '__next_signal__',
    'Where are members hitting friction?': 'cx_turn_1_channel_friction',
    'Show me the journey drop-offs': 'cx_turn_2_journey_friction',
    'Show me which journeys underperform': 'cx_turn_2_journey_friction',
    "Which journeys underperform this week?": 'cx_turn_2_journey_friction',
    'What intervention is needed?': 'cx_turn_3_intervention',
    'Show me channel switching patterns': 'cx_channel_patterns',
    "What's driving the IVR escalation spike?": 'cx_ivr_escalation_detail',
    'Show me the escalation breakdown': 'cx_ivr_escalation_detail',
    'Summarize service recovery gaps': 'cx_service_recovery_gaps',
    'Show me open cases': 'cx_service_recovery_gaps',
    'Show me active journey performance': 'cx_turn_2_journey_friction',
    "What's the CSAT trend?": 'cx_csat_trend',
    "What's the CSAT impact?": 'cx_csat_trend',
    'Show me the CSAT trend by journey': 'cx_csat_trend',
    'Who are these members?': 'cx_who_are_members',
    'Drill into mortgage journey friction': 'cx_mortgage_friction_detail',
    'Draft proactive outreach message': 'cx_outreach_draft',
    'Yes, send to callback campaign': 'cx_send_to_callback',
    'Yes, generate the slide deck': 'cx_service_recovery_report',
  },
  signalSequence: ['cx_signal_1_channel_switch', 'cx_signal_2_journey_abandon', 'cx_signal_3_ivr_escalation'],
  askTurnSequence: ['cx_turn_1_channel_friction', 'cx_turn_2_journey_friction', 'cx_turn_3_intervention'],
  actionTurnKey: 'cx_turn_3_intervention',
  actionConfirmMap: {
    'ACT-CX-001': { responseKey: 'ACT-CX-001', nextChips: ['Summarize service recovery gaps'] },
    'ACT-CX-002': { responseKey: 'ACT-CX-002', nextChips: ['Show me the escalation breakdown'] },
    'ACT-CX-003': { responseKey: 'ACT-CX-003', nextChips: ['Yes, generate the slide deck'] },
  },
};

// ─── Member Retention Analyst (Derek T.) ─────────────────────────
const retConfig = {
  chatFlows: retChatFlows,
  chipToFlowKey: {
    'Yes, walk me through them': 'ret_signal_1_churn_surge',
    'Next signal': '__next_signal__',
    'Show me the churn signals': 'ret_turn_1_churn_signals',
    'Show me at-risk members': 'ret_turn_1_churn_signals',
    'Show me the churn rate': 'ret_turn_1_churn_signals',
    'Which segments are most at risk?': 'ret_turn_2_risk_segments',
    'Model the retention impact': 'ret_turn_3_retention_action',
    'Which members are most at risk of leaving?': 'ret_turn_1_churn_signals',
    "What's driving disengagement this month?": 'ret_churn_drivers',
    'Model the retention impact of outreach': 'ret_impact_model',
    'Generate a retention brief for leadership': 'ret_retention_brief',
    'Show me the engagement trend': 'ret_engagement_trend',
    'Show me campaign performance': 'ret_campaign_performance',
    'Show me the retiree sentiment details': 'ret_retiree_sentiment',
    'Which segments are driving this?': 'ret_which_segments_driving',
    "What's the revenue impact?": 'ret_impact_model',
  },
  signalSequence: ['ret_signal_1_churn_surge', 'ret_signal_2_engagement_decay', 'ret_signal_3_retiree_disengage'],
  askTurnSequence: ['ret_turn_1_churn_signals', 'ret_turn_2_risk_segments', 'ret_turn_3_retention_action'],
  actionTurnKey: 'ret_turn_3_retention_action',
  actionConfirmMap: {
    'ACT-RET-001': { responseKey: 'ACT-RET-001', nextChips: ['Show me campaign performance'] },
    'ACT-RET-002': { responseKey: 'ACT-RET-002', nextChips: ['Generate a retention brief for leadership'] },
    'ACT-RET-003': { responseKey: 'ACT-RET-003', nextChips: ['Show me campaign performance'] },
  },
};

// ─── Risk & Fraud Executive (James R.) ──────────────────────────
const riskConfig = {
  chatFlows: riskChatFlows,
  chipToFlowKey: {
    'Yes, walk me through them': 'risk_signal_1_structuring',
    'Next signal': '__next_signal__',
    'What anomalies were detected overnight?': 'risk_turn_1_anomalies',
    'What anomalies were detected?': 'risk_turn_1_anomalies',
    'Show me the regulatory exposure': 'risk_turn_2_regulatory',
    'Show me our regulatory exposure': 'risk_turn_2_regulatory',
    'What needs escalation?': 'risk_turn_3_escalation',
    'Flag accounts needing escalation': 'risk_turn_3_escalation',
    'Show me the structuring pattern details': 'risk_structuring_details',
    'Show me the wire transfer timeline': 'risk_wire_timeline',
    "What's driving the complaint increase?": 'risk_complaint_drivers',
    'Summarize BSA/AML posture': 'risk_bsa_posture',
    'Show me active anomalies': 'risk_turn_1_anomalies',
    'Show me SAR filing status': 'risk_bsa_posture',
    'Show me the NCUA score': 'risk_turn_2_regulatory',
    'Show me open investigations': 'risk_escalation_status',
    'Generate an audit trail for compliance': 'risk_audit_trail',
    'Generate a board-level risk summary': 'risk_board_summary',
    'Show me the escalation pipeline': 'risk_escalation_status',
    'Who are these account holders?': 'risk_wire_timeline',
  },
  signalSequence: ['risk_signal_1_structuring', 'risk_signal_2_wire_anomaly', 'risk_signal_3_ncua_decline'],
  askTurnSequence: ['risk_turn_1_anomalies', 'risk_turn_2_regulatory', 'risk_turn_3_escalation'],
  actionTurnKey: 'risk_turn_3_escalation',
  actionConfirmMap: {
    'ACT-RISK-001': { responseKey: 'ACT-RISK-001', nextChips: ['Generate an audit trail for compliance'] },
    'ACT-RISK-002': { responseKey: 'ACT-RISK-002', nextChips: ['Generate a board-level risk summary'] },
    'ACT-RISK-003': { responseKey: 'ACT-RISK-003', nextChips: ['What anomalies were detected overnight?'] },
  },
};

// ─── NFCU: Contact Center Supervisor (Priya M.) ───────────────────
const nfcuSupConfig = {
  // Cross-spread director explainers so Priya's cross-tier (Executive)
  // preview also resolves "Ask AI" chip clicks against real flows.
  chatFlows: { ...nfcuSupChatFlows, ...nfcuSupIntradayChatFlows, ...nfcuDirIntradayChatFlows },
  chipToFlowKey: {
    // Intraday demo flow (SIP fiber cut + unplanned rate promo)
    'Show me the live intraday status': 'intraday_t1_greeting',
    'Walk me through the SIP impact': 'intraday_t2_walkthrough',
    'What about the rate promotion impact?': 'intraday_t3_correlate',
    'Show me the combined impact': 'intraday_t3_correlate',
    'Can we update the IVR for rate queries?': 'intraday_t4_options',
    'Execute Plan C': 'intraday_t5_execute',
    'What should I tell leadership right now?': 'intraday_t6_brief',
    'Show me historical incidents like this': 'intraday_t7_historical',
    // Intraday — per-KPI Ask-AI explainers (one per supervisor tile)
    'Why is the queue so deep right now?': 'intraday_sup_explain_queue',
    'Why is service level at 54%?': 'intraday_sup_explain_service_level',
    "What's driving the 12:47 wait time?": 'intraday_sup_explain_wait_time',
    "What's inflating average handle time?": 'intraday_sup_explain_handle_time',
    'Why is abandonment at 18.4%?': 'intraday_sup_explain_abandonment',
    'Why is agent occupancy near ceiling?': 'intraday_sup_explain_occupancy',
    'Why did IVR containment drop to 22%?': 'intraday_sup_explain_ivr_containment',
    'Why is rate comparison the top intent today?': 'intraday_sup_explain_top_intent',
    // Intraday — Agent-tier KPI explainers (Priya's individual agent view)
    'What is the agent on auto loans working on?': 'intraday_sup_explain_agent_state',
    'Why is agent AHT at 11.3 min today?': 'intraday_sup_explain_agent_aht_today',
    'Why is the agent behind on calls handled?': 'intraday_sup_explain_agent_calls_handled',
    "What is the agent's schedule adherence telling us?": 'intraday_sup_explain_agent_adherence',
    "What's driving the agent's quality score uptick?": 'intraday_sup_explain_agent_quality',
    'Why is agent wrap-up time longer today?': 'intraday_sup_explain_agent_wrap_up',
    // Director's Agent-tier KPI explainers (executive cross-tier preview)
    'Why are 142 agents on call right now?': 'intraday_dir_explain_agent_pool_oncall',
    'Why are 12 agents idle on routing failure?': 'intraday_dir_explain_agent_pool_idle_routing',
    'Why is floor AHT at 10.8 minutes?': 'intraday_dir_explain_agent_pool_aht',
    'Why is floor adherence slipping to 91%?': 'intraday_dir_explain_agent_pool_adherence',
    'How many cross-trained agents do I still have available?': 'intraday_dir_explain_agent_pool_cross_trained',
    'How much overtime have we burned today?': 'intraday_dir_explain_agent_pool_overtime',
    // Intraday — per-KPI Ask-AI explainers for the executive cross-tier preview
    'Why is aggregate service level at 68%?': 'intraday_dir_explain_agg_sl',
    'Walk me through both active incidents': 'intraday_dir_explain_active_incidents',
    'Which lines of business are impacted and why?': 'intraday_dir_explain_lobs_impacted',
    'Why is total queue volume up 180%?': 'intraday_dir_explain_queue_total',
    'Why is member impact rated HIGH?': 'intraday_dir_explain_member_impact',
    'Explain the dual root cause': 'intraday_dir_explain_root_cause',
    'How confident is the 45–90 min recovery ETA?': 'intraday_dir_explain_eta_recovery',
    'What WFM response actions are running?': 'intraday_dir_explain_wfm_response',
    // Common follow-up chips that the explainers reference
    'Show me which agents are idle right now': 'nfcu_sup_overtime_agents',
    'Can we reroute the idle agents?': 'nfcu_sup_turn_2_recommendations',
    'Reroute the 12 idle agents now': 'intraday_t5_execute',
    'Can we enable callback mode?': 'intraday_t5_execute',
    'Deploy the IVR rate-comparison template': 'intraday_t5_execute',
    'Show me the cross-team cascade risk': 'intraday_t2_walkthrough',
    // Signal walkthrough
    'Yes, walk me through them': 'nfcu_sup_signal_1_queue_spike',
    'Next signal': '__next_signal__',
    'What caused the auto loan spike?': 'nfcu_sup_signal_1_queue_spike',
    'Show me staffing for Friday': 'nfcu_sup_signal_2_staffing',
    // Root cause correlation (right panel renders RootCauseTree)
    'Show root cause correlation': 'nfcu_sup_root_cause_correlation',
    'Show the root cause correlation': 'nfcu_sup_root_cause_correlation',
    // Briefing tile clicks — live signals
    'Walk me through the dual incident': 'nfcu_sup_brief_dual_incident',
    'Show me the PinDrop auth failures': 'nfcu_sup_brief_pindrop_failures',
    'Why is IVR containment dropping?': 'nfcu_sup_brief_ivr_containment',
    // Briefing tile clicks — trend signals
    'Show the auto loans sentiment trend': 'nfcu_sup_brief_sentiment_trend',
    'Show the repeat-contact pattern': 'nfcu_sup_brief_repeat_contact',
    'Show the agent fatigue watch list': 'nfcu_sup_brief_agent_fatigue',
    // Friction observability
    'How does this compare to last rate promo?': 'nfcu_sup_rate_promo_comparison',
    'Can we reroute?': 'nfcu_sup_turn_2_recommendations',
    'Show me agent utilization right now': 'nfcu_sup_turn_1_queue_health',
    // Queue health
    "Show me today's queue health": 'nfcu_sup_turn_1_queue_health',
    'What is my service level right now?': 'nfcu_sup_service_level_now',
    'Which agents are idle?': 'nfcu_sup_turn_1_queue_health',
    'Show me queue performance by channel': 'nfcu_sup_turn_1_queue_health',
    // Recommendations
    'What should we do?': 'nfcu_sup_turn_2_recommendations',
    'What are my options?': 'nfcu_sup_turn_2_recommendations',
    // Action confirmations
    'Activate the cross-trained agents': 'nfcu_sup_act_agents_confirm',
    'Enable callback now': 'nfcu_sup_act_callback_confirm',
    'Yes, enable callback too': 'nfcu_sup_act_callback_confirm',
    'Draft the Marketing notification rule': 'nfcu_sup_act_marketing_rule',
    // Overtime
    'Who is available for overtime?': 'nfcu_sup_overtime_agents',
    'Which agents have mortgage certification?': 'nfcu_sup_overtime_agents',
    'Send overtime offers to top 3': 'nfcu_sup_act_overtime_confirm',
    'What if nobody accepts?': 'nfcu_sup_no_accept_plan',
    // Failure & Recovery (marquee scripted demo path)
    'Show me the after-hours sibling recommendation': 'nfcu_sup_recovery_t1_initial_rec',
    'Approve extension': 'nfcu_sup_recovery_t2_telemetry',
    'See the re-evaluation': 'nfcu_sup_recovery_t3_drop',
    "Wait for Marcus's call": 'nfcu_sup_recovery_t4_human_override',
    'Override and continue': 'nfcu_sup_recovery_t4_human_override',
    'Show the corrected recommendation': 'nfcu_sup_recovery_t5_corrected',
    'Approve the corrected plan': 'nfcu_sup_recovery_t6_audit_link',
    'Send flexible-slot offers to secondary agents': 'nfcu_sup_act_overtime_confirm',
    'What is the mandatory coverage threshold?': 'nfcu_sup_no_accept_plan',
    // Caller profile
    'Who are these callers?': 'nfcu_sup_caller_profile',
    // Recovery timeline
    'Yes, add the recovery timeline': 'nfcu_sup_recovery_timeline',
    // Misc / suggested queries from spec
    'Show me the Genesys-to-Dynamics migration status': 'nfcu_sup_migration_status',
    'Generate my daily ops report': 'nfcu_sup_daily_report',
    'Forecast tomorrow\'s staffing needs': 'nfcu_sup_signal_2_staffing',
    'Compare today\'s volume to last Tuesday': 'nfcu_sup_rate_promo_comparison',
    'Monitor and report back in 30 min': 'nfcu_sup_daily_report',
    'Show me the second signal': 'nfcu_sup_signal_2_staffing',
    'Show me the sentiment signal': 'nfcu_sup_signal_3_sentiment',
    'Show me the third signal': 'nfcu_sup_signal_3_sentiment',
    'What is driving the longest handle times?': 'nfcu_sup_turn_1_queue_health',
    // ─── Dangling-chip cleanup — map every offered chip ──────────────
    // Drill-downs that route to existing flows
    "What's driving the sentiment dip?": 'nfcu_sup_brief_sentiment_trend',
    'Show me sentiment by team': 'nfcu_sup_brief_sentiment_trend',
    'Schedule a CX review': 'nfcu_sup_brief_sentiment_trend',
    'Compare to last month\'s report': 'nfcu_sup_brief_sentiment_trend',
    'Show me adherence by team this shift': 'nfcu_sup_brief_agent_fatigue',
    'Show me overtime by agent': 'nfcu_sup_overtime_agents',
    'Show me overtime by team': 'nfcu_sup_overtime_agents',
    'Show me which agents are idle right now': 'nfcu_sup_overtime_agents',
    'Show me the cross-trained agents': 'nfcu_sup_overtime_agents',
    'Show me agent utilization right now': 'nfcu_sup_turn_1_queue_health',
    'Show me quality scores by team this week': 'nfcu_sup_brief_sentiment_trend',
    'Show me the IVR containment data': 'nfcu_sup_brief_ivr_containment',
    'Show me the rate promo comparison data': 'nfcu_sup_rate_promo_comparison',
    'Show me handle-time detail by intent': 'intraday_sup_explain_handle_time',
    'Show me the caller profile': 'nfcu_sup_caller_profile',
    'Show me the team-level breakdown': 'nfcu_shared_general_banking_impact',
    "Show me today's queue health": 'nfcu_sup_turn_1_queue_health',
    'Show me the general banking impact': 'nfcu_shared_general_banking_impact',
    'Show me the general banking risk in detail': 'nfcu_shared_general_banking_impact',
    'Show me member impact': 'nfcu_shared_member_impact',
    'What is the member experience impact?': 'nfcu_shared_member_impact',
    'Draft a member-impact briefing': 'nfcu_shared_member_impact_brief',
    'What is the cross-team cascade risk?': 'nfcu_shared_general_banking_impact',
    'What are my options to stabilize both teams?': 'nfcu_sup_turn_2_recommendations',
    'What is my budget exposure?': 'nfcu_shared_ot_cost_projection',
    // Round 2: chips offered by shared follow-up flows
    'Approve the rule': 'nfcu_shared_action_confirmed',
    'Approve the schedule': 'nfcu_shared_action_confirmed',
    'Draft a Marketing coordination rule': 'nfcu_shared_marketing_rule',
    'Model the combined impact': 'nfcu_shared_aht_options',
    'Open the file': 'nfcu_shared_action_confirmed',
    'Queue a journey audit': 'nfcu_shared_journey_audit',
    'Send the escalation now': 'nfcu_shared_action_confirmed',
    'Send the escalation to Sarah': 'nfcu_shared_action_confirmed',
    'Send the invite now': 'nfcu_shared_action_confirmed',
    'Send the note': 'nfcu_shared_action_confirmed',
    'Send to leadership': 'nfcu_shared_send_to_coo',
    'Send to the CMO': 'nfcu_shared_send_to_coo',
    'Set priority to P1': 'nfcu_shared_action_confirmed',
    'Share with the team': 'nfcu_shared_action_confirmed',
    'Show me escrow statement complaints': 'nfcu_shared_escrow_complaints',
    'Show me the Jul 22 AAR': 'nfcu_shared_historical_compare',
    'Show me the current snapshot': 'nfcu_shared_member_impact',
    'Show me the impact measurement': 'nfcu_shared_member_impact',
    'Show me the migration risk': 'nfcu_sup_migration_status',
    'Show me the mortgage repeat-contact pattern': 'nfcu_sup_brief_repeat_contact',
    'Show the repeat-contact pattern': 'nfcu_sup_brief_repeat_contact',
    'Show me the pre-staged exec line': 'intraday_t6_brief',
    'Show staffing by week': 'nfcu_sup_signal_2_staffing',
    'What did we learn from Jul 22?': 'nfcu_shared_what_we_learned',
    'What if we miss May 15?': 'nfcu_shared_escalation_si',
    'What should I monitor?': 'nfcu_shared_monitor_20min',
    "What's next?": 'nfcu_sup_turn_2_recommendations',
    "What's the deflection assumption?": 'nfcu_shared_ivr_enhancement_cost',
    'Approve Plan C': 'intraday_t5_execute',
    'What if SIP recovers in 30 minutes?': 'nfcu_shared_what_if_sip_30min',
    'What if we enable callback?': 'nfcu_shared_what_if_callback',
    'What is the geographic constraint?': 'nfcu_shared_geographic_constraint',
    'Approve the manual reroute': 'nfcu_shared_action_confirmed',
    'Deploy 4 of the remaining 8': 'nfcu_shared_action_confirmed',
    'Can we reroute agents from the down paths?': 'nfcu_sup_turn_2_recommendations',
    'Model the impact on general banking': 'nfcu_shared_general_banking_impact',
    'What should I tell the COO right now?': 'intraday_dir_t6_brief',
    'Show me OT cost projection': 'nfcu_shared_ot_cost_projection',
    'Compare to last quarter\'s OT-heavy events': 'nfcu_shared_historical_compare',
    'Show me the historical incident comparison': 'nfcu_shared_historical_compare',
    'Show me PinDrop recovery status': 'nfcu_shared_pindrop_status',
    'Why is the PinDrop fallback being triggered?': 'nfcu_shared_pindrop_fallback',
    'What is PinDrop fallback doing to handle time?': 'nfcu_shared_pindrop_fallback',
    'Why is the floor adherence slipping?': 'intraday_dir_explain_agent_pool_adherence',
    'Show me the SIP path health map': 'nfcu_shared_sip_path_map',
    'Show me the IVR funnel': 'nfcu_shared_ivr_funnel',
    'Show me the volume breakdown': 'nfcu_shared_volume_breakdown',
    'What are my options to reduce AHT impact?': 'nfcu_shared_aht_options',
    'What can we do to reduce AHT impact?': 'nfcu_shared_aht_options',
    'What would the IVR enhancement cost?': 'nfcu_shared_ivr_enhancement_cost',
    'Add to next sprint backlog': 'nfcu_shared_sprint_backlog',
    'Adjust their schedules next week': 'nfcu_shared_schedule_adjust',
    'Schedule a 1:1 with the team lead': 'nfcu_shared_schedule_1on1',
    'Schedule a recognition note': 'nfcu_shared_recognition_note',
    // Action confirms & drafts
    'Draft an after-action report': 'nfcu_shared_after_action',
    'Draft an after-action report when this resolves': 'nfcu_shared_after_action',
    'Generate the full after-action report': 'nfcu_shared_after_action',
    'Draft an escalation to the SI partner': 'nfcu_shared_escalation_si',
    'Draft the escalation to the CMO': 'nfcu_shared_escalation_cmo',
    'Escalate the Marketing pre-notification gap': 'nfcu_shared_escalation_cmo',
    'Who should I escalate the pre-notification gap to?': 'nfcu_shared_who_to_escalate',
    'Show me the Marketing pre-notification gap': 'nfcu_shared_marketing_gap_show',
    'How do we prevent the Marketing notification gap?': 'nfcu_shared_marketing_gap_explain',
    'How do we prevent the marketing notification gap?': 'nfcu_shared_marketing_gap_explain',
    'Model a fourth scenario': 'nfcu_shared_action_confirmed',
    'Monitor and report back in 20 min': 'nfcu_shared_monitor_20min',
    'Open Model Governance': 'nfcu_sup_recovery_t6_audit_link',
    'Send this to Marcus': 'nfcu_shared_send_to_marcus',
    'Send this to the COO': 'nfcu_shared_send_to_coo',
    'Export this analysis': 'nfcu_shared_export_analysis',
    'Generate an ROI estimate': 'nfcu_shared_ivr_enhancement_cost',
    'What did we learn?': 'nfcu_shared_what_we_learned',
    'What did we learn for next time?': 'nfcu_shared_what_we_learned',
    'What would have happened today without cross-source correlation?': 'nfcu_shared_what_without_correlation',
  },
  signalSequence: ['nfcu_sup_signal_1_queue_spike', 'nfcu_sup_signal_2_staffing', 'nfcu_sup_signal_3_sentiment'],
  askTurnSequence: ['nfcu_sup_turn_1_queue_health', 'nfcu_sup_rate_promo_comparison', 'nfcu_sup_turn_2_recommendations'],
  intradaySequence: [
    'intraday_t1_greeting',
    'intraday_t2_walkthrough',
    'intraday_t3_correlate',
    'intraday_t4_options',
    'intraday_t5_execute',
    'intraday_t6_brief',
    'intraday_t7_historical',
  ],
  actionTurnKey: 'nfcu_sup_turn_2_recommendations',
  actionConfirmMap: {
    'ACT-NFCU-SUP-001': { responseKey: 'ACT-NFCU-SUP-001', nextChips: ['Yes, enable callback too', 'Show me the after-hours sibling recommendation', 'Show me the second signal'] },
    'ACT-NFCU-SUP-002': { responseKey: 'ACT-NFCU-SUP-002', nextChips: ['Show me the second signal', 'Generate my daily ops report'] },
    'ACT-NFCU-SUP-003': { responseKey: 'ACT-NFCU-SUP-003', nextChips: ["Show me today's queue health", 'Generate my daily ops report'] },
  },
};

// ─── NFCU: Workforce Analyst (Derek Whitfield) ───────────────────
const nfcuAnaConfig = {
  chatFlows: nfcuAnaChatFlows,
  chipToFlowKey: {
    // Signal walkthrough
    'Walk me through the tax season risk': 'nfcu_ana_turn_1_tax_season',
    'Show me the training cohort data': 'nfcu_ana_turn_3_cohort',
    'Next signal': '__next_signal__',
    // Tax season
    'What are my options to close the gap?': 'nfcu_ana_turn_2_what_if',
    'Run a what-if with 15 overtime shifts': 'nfcu_ana_turn_2_what_if',
    'Show me which queues are most impacted': 'nfcu_ana_turn_1_tax_season',
    'How did we handle it last year?': 'nfcu_ana_turn_1_tax_season',
    // Scenarios
    'Go with the hybrid option': 'nfcu_ana_act_hybrid_confirm',
    'Show me cross-trainable agents': 'nfcu_ana_cross_trainable_agents',
    'What about the new hire cohort?': 'nfcu_ana_turn_3_cohort',
    'Model a fourth scenario': 'nfcu_ana_fourth_scenario',
    'Add an agency-rate constraint and re-model': 'nfcu_ana_fourth_scenario_resolved',
    // Cohort
    'Which agents are furthest behind?': 'nfcu_ana_turn_3_cohort',
    'Schedule targeted coaching': 'nfcu_ana_turn_3_cohort',
    'Can any of them handle tax season volume?': 'nfcu_ana_turn_3_cohort',
    // Budget & reporting
    'What is my overtime trajectory?': 'nfcu_ana_ot_trajectory',
    'Forecast next week\'s volume by 15-minute interval': 'nfcu_ana_turn_1_tax_season',
    'Show me force-to-load ratio by queue': 'nfcu_ana_turn_1_tax_season',
    'Compare actual vs. forecast accuracy this month': 'nfcu_ana_schedule_adherence',
    'Which shifts are understaffed this week?': 'nfcu_ana_turn_2_what_if',
    'What is my agent attrition trend?': 'nfcu_ana_ot_trajectory',
    'Show me schedule adherence by team': 'nfcu_ana_schedule_adherence',
    'Generate the weekly workforce report': 'nfcu_ana_weekly_report',
    'Model staffing for a 20% volume increase': 'nfcu_ana_turn_2_what_if',
  },
  signalSequence: ['nfcu_ana_signal_1_tax_season', 'nfcu_ana_signal_2_training', 'nfcu_ana_signal_3_ot_budget'],
  askTurnSequence: ['nfcu_ana_turn_1_tax_season', 'nfcu_ana_turn_2_what_if', 'nfcu_ana_turn_3_cohort'],
  actionTurnKey: 'nfcu_ana_turn_2_what_if',
  actionConfirmMap: {
    'ACT-NFCU-ANA-001': { responseKey: 'ACT-NFCU-ANA-001', nextChips: ['Generate the weekly workforce report', 'Show me cross-trainable agents', 'Show me the training cohort data'] },
  },
};

// ─── NFCU: Quality & Member Experience (Janelle Moreau) ──────────
const nfcuWfConfig = {
  chatFlows: nfcuWfChatFlows,
  chipToFlowKey: {
    // Signal walkthrough
    'Walk me through the compliance issue': 'nfcu_wf_turn_1_compliance_detail',
    'Show me the repeat contact data': 'nfcu_wf_turn_3_repeat_contacts',
    'Which agents are at risk?': 'nfcu_wf_signal_3_burnout',
    'Next signal': '__next_signal__',
    // Compliance detail
    'Which accounts need remediation?': 'nfcu_wf_turn_2_remediation',
    'Recommend a fix': 'nfcu_wf_turn_2_remediation',
    'Show me the agent breakdown': 'nfcu_wf_turn_1_compliance_detail',
    'How does this affect our compliance posture?': 'nfcu_wf_turn_1_compliance_detail',
    // Remediation actions
    'Approve the script revert': 'nfcu_wf_act_script_revert',
    'Show me the 8 accounts needing callbacks': 'nfcu_wf_act_remediation',
    'Generate a compliance incident report': 'nfcu_wf_act_compliance_report',
    // Repeat contacts
    'What should we tell agents?': 'nfcu_wf_agent_coaching',
    'Show me the member impact': 'nfcu_wf_turn_3_repeat_contacts',
    'When is the IT fix expected?': 'nfcu_wf_turn_3_repeat_contacts',
    'How much is this costing us?': 'nfcu_wf_cost_impact',
    'Have Finance refresh the Q1 cost model': 'nfcu_wf_cost_impact_resolved',
    'Push the script note to agents': 'nfcu_wf_agent_coaching',
    // Quality
    'Show me interaction quality scores': 'nfcu_wf_quality_scores',
    'Show me quality scores by team this week': 'nfcu_wf_quality_scores',
    'Which agents need coaching?': 'nfcu_wf_quality_scores',
    'Show me sentiment trends by queue': 'nfcu_wf_quality_scores',
    'What are the top 5 call drivers today?': 'nfcu_wf_quality_scores',
    'Show me member complaints by category': 'nfcu_wf_quality_scores',
    'Which process steps have the lowest adherence?': 'nfcu_wf_turn_1_compliance_detail',
    'Generate a quality scorecard': 'nfcu_wf_quality_scorecard',
    'Generate a quality scorecard for my team': 'nfcu_wf_quality_scorecard',
    'Generate a quality scorecard for my leadership meeting': 'nfcu_wf_quality_scorecard',
    'Compare FCR this month vs. last month': 'nfcu_wf_turn_3_repeat_contacts',
  },
  signalSequence: ['nfcu_wf_signal_1_compliance', 'nfcu_wf_signal_2_repeat_contact', 'nfcu_wf_signal_3_burnout'],
  askTurnSequence: ['nfcu_wf_turn_1_compliance_detail', 'nfcu_wf_turn_2_remediation', 'nfcu_wf_turn_3_repeat_contacts'],
  actionTurnKey: 'nfcu_wf_turn_2_remediation',
  actionConfirmMap: {
    'ACT-NFCU-WF-001': { responseKey: 'ACT-NFCU-WF-001', nextChips: ['Show me the 8 accounts needing callbacks', 'Generate a compliance incident report'] },
    'ACT-NFCU-WF-002': { responseKey: 'ACT-NFCU-WF-002', nextChips: ['Generate a compliance incident report', 'Next signal'] },
    'ACT-NFCU-WF-003': { responseKey: 'ACT-NFCU-WF-003', nextChips: ['Next signal', 'Show me interaction quality scores'] },
  },
};

// ─── NFCU: Director, Contact Center Operations (Marcus Tillman) ───
const nfcuDirConfig = {
  // Cross-spread supervisor explainers so Marcus's Supervisor preview
  // also resolves Ask-AI chip clicks against real flows.
  chatFlows: { ...nfcuDirChatFlows, ...nfcuDirIntradayChatFlows, ...nfcuSupIntradayChatFlows },
  chipToFlowKey: {
    // Root cause correlation (right panel renders RootCauseTree)
    'Show root cause correlation': 'nfcu_dir_root_cause_correlation',
    'Show the root cause correlation': 'nfcu_dir_root_cause_correlation',
    // Briefing tile clicks — live signals
    'Walk me through the SIP degradation': 'nfcu_dir_brief_sip_degradation',
    'Show the rate promo volume surge': 'nfcu_dir_brief_promo_surge',
    'Show the cross-team cascade risk': 'nfcu_dir_brief_cascade_risk',
    // Briefing tile clicks — trend signals
    'Show the member sentiment trend': 'nfcu_dir_brief_sentiment_trend',
    'Show the mortgage repeat-contact pattern': 'nfcu_dir_brief_mortgage_repeat',
    'Show the staffing availability outlook': 'nfcu_dir_brief_staffing_outlook',
    // Intraday demo flow (executive perspective)
    'Show me the live intraday status': 'intraday_dir_t1_greeting',
    'Walk me through the SIP impact': 'intraday_dir_t2_walkthrough',
    'What is the cross-team cascade risk?': 'intraday_dir_t2_walkthrough',
    'What about the rate promotion impact?': 'intraday_dir_t3_correlate',
    'Show me the combined impact': 'intraday_dir_t3_correlate',
    'What are my options?': 'intraday_dir_t4_options',
    'Execute Plan C': 'intraday_dir_t5_execute',
    'Approve Plan C': 'intraday_dir_t5_execute',
    'What should I tell the COO right now?': 'intraday_dir_t6_brief',
    'Show me historical incidents like this': 'intraday_dir_t7_historical',
    // Intraday — per-KPI Ask-AI explainers (one per executive tile)
    'Why is aggregate service level at 68%?': 'intraday_dir_explain_agg_sl',
    'Walk me through both active incidents': 'intraday_dir_explain_active_incidents',
    'Which lines of business are impacted and why?': 'intraday_dir_explain_lobs_impacted',
    'Why is total queue volume up 180%?': 'intraday_dir_explain_queue_total',
    'Why is member impact rated HIGH?': 'intraday_dir_explain_member_impact',
    'Explain the dual root cause': 'intraday_dir_explain_root_cause',
    'How confident is the 45–90 min recovery ETA?': 'intraday_dir_explain_eta_recovery',
    'What WFM response actions are running?': 'intraday_dir_explain_wfm_response',
    // Intraday — per-KPI Ask-AI explainers for the supervisor cross-tier preview
    'Why is the queue so deep right now?': 'intraday_sup_explain_queue',
    'Why is service level at 54%?': 'intraday_sup_explain_service_level',
    "What's driving the 12:47 wait time?": 'intraday_sup_explain_wait_time',
    "What's inflating average handle time?": 'intraday_sup_explain_handle_time',
    'Why is abandonment at 18.4%?': 'intraday_sup_explain_abandonment',
    'Why is agent occupancy near ceiling?': 'intraday_sup_explain_occupancy',
    'Why did IVR containment drop to 22%?': 'intraday_sup_explain_ivr_containment',
    'Why is rate comparison the top intent today?': 'intraday_sup_explain_top_intent',
    // Agent-tier KPI explainers (director's agent-floor view)
    'Why are 142 agents on call right now?': 'intraday_dir_explain_agent_pool_oncall',
    'Why are 12 agents idle on routing failure?': 'intraday_dir_explain_agent_pool_idle_routing',
    'Why is floor AHT at 10.8 minutes?': 'intraday_dir_explain_agent_pool_aht',
    'Why is floor adherence slipping to 91%?': 'intraday_dir_explain_agent_pool_adherence',
    'How many cross-trained agents do I still have available?': 'intraday_dir_explain_agent_pool_cross_trained',
    'How much overtime have we burned today?': 'intraday_dir_explain_agent_pool_overtime',
    // Agent-tier KPI explainers (Priya's individual agent cross-tier preview)
    'What is the agent on auto loans working on?': 'intraday_sup_explain_agent_state',
    'Why is agent AHT at 11.3 min today?': 'intraday_sup_explain_agent_aht_today',
    'Why is the agent behind on calls handled?': 'intraday_sup_explain_agent_calls_handled',
    "What is the agent's schedule adherence telling us?": 'intraday_sup_explain_agent_adherence',
    "What's driving the agent's quality score uptick?": 'intraday_sup_explain_agent_quality',
    'Why is agent wrap-up time longer today?': 'intraday_sup_explain_agent_wrap_up',
    // Common follow-up chips that the explainers reference
    'Show me the cross-team cascade risk': 'intraday_dir_t2_walkthrough',
    'Show me the general banking risk in detail': 'intraday_dir_explain_lobs_impacted',
    'What if SIP recovers in 30 minutes?': 'intraday_dir_explain_eta_recovery',
    'Show me the historical incident comparison': 'intraday_dir_t7_historical',
    'Draft a member-impact briefing': 'intraday_dir_t6_brief',
    // Greeting walkthrough
    'Yes, walk me through them': 'nfcu_dir_signal_1_service',
    'Walk me through the service level issue': 'nfcu_dir_signal_1_service',
    'Show me the migration risk': 'nfcu_dir_signal_2_migration',
    'What is my budget exposure?': 'nfcu_dir_signal_3_budget',
    'Next signal': '__next_signal__',
    // Cross-team service signal follow-ups
    'What are my options to stabilize both teams?': 'nfcu_dir_turn_2_scenarios',
    'Show me the cascade impact': 'nfcu_dir_cascade_impact',
    'Which team should I prioritize?': 'nfcu_dir_priority_call',
    'How does this compare to last quarter?': 'nfcu_dir_quarter_compare',
    'Compare to last quarter': 'nfcu_dir_quarter_compare',
    'Show me service levels across all teams': 'nfcu_dir_turn_1_team_rollup',
    "Which manager's team needs attention?": 'nfcu_dir_turn_1_team_rollup',
    'Compare team performance this week vs. last week': 'nfcu_dir_quarter_compare',
    // Migration follow-ups
    'What are my options to accelerate Phase 2?': 'nfcu_dir_phase_2_options',
    'Show me the 3 failing IVR flows': 'nfcu_dir_migration_detail',
    'What happens if we miss the May 15 deadline?': 'nfcu_dir_deadline_impact',
    "Confirm SI partner's revised May 15 ETA": 'nfcu_dir_deadline_impact_resolved',
    'What about the migration risk?': 'nfcu_dir_signal_2_migration',
    'What is my migration status?': 'nfcu_dir_signal_2_migration',
    // Budget follow-ups
    'Show me the overtime budget exposure': 'nfcu_dir_budget_exposure',
    'What can I cut to stay in budget?': 'nfcu_dir_budget_cuts',
    'Show me cost per contact trend': 'nfcu_dir_quarter_compare',
    'What is my overtime budget exposure?': 'nfcu_dir_budget_exposure',
    // Scenario execution
    'Execute Scenario C': 'nfcu_dir_act_scenario_c',
    'Execute Scenario A': 'nfcu_dir_act_scenario_c',
    "Show me the digital banking team's capacity": 'nfcu_dir_turn_1_team_rollup',
    'Model a fourth scenario': 'nfcu_dir_turn_2_scenarios',
    // Action drafting
    'Draft an escalation to the SI partner': 'nfcu_dir_act_si_escalation',
    'Hold for my review': 'nfcu_dir_act_si_escalation',
    'Send to SI partner contact': 'nfcu_dir_act_si_escalation',
    // Reporting
    'Generate my weekly leadership report': 'nfcu_dir_act_weekly_report',
    'Add a recommendation section': 'nfcu_dir_act_recommendation_added',
    'Export as PDF': 'nfcu_dir_act_pdf_export',
    'Compare to last month\'s report': 'nfcu_dir_month_compare',
    'Drill into the attrition data': 'nfcu_dir_attrition_detail',
    'Show me the attrition detail': 'nfcu_dir_attrition_detail',
    'Show me the FCR improvement driver': 'nfcu_dir_month_compare',
    'Export the comparison': 'nfcu_dir_act_pdf_export',
    'What should I prioritize this week?': 'nfcu_dir_priority_week',
    'Which teams are at risk for the rest of this week?': 'nfcu_dir_priority_week',
    // ─── Dangling-chip cleanup ───────────────────────────────────────
    // Drill-downs routed to existing or shared flows
    'Approve the manual reroute': 'nfcu_shared_action_confirmed',
    'Can we enable callback mode?': 'intraday_t5_execute',
    'Can we reroute agents from the down paths?': 'nfcu_dir_turn_2_scenarios',
    'Can we reroute the idle agents?': 'nfcu_dir_turn_2_scenarios',
    'Can we update the IVR for rate queries?': 'intraday_dir_t4_options',
    "Compare to last month's report": 'nfcu_dir_month_compare',
    "Compare to last quarter's OT-heavy events": 'nfcu_shared_historical_compare',
    "Compare to last quarter's cascade events": 'nfcu_shared_historical_compare',
    'Deploy 4 of the remaining 8': 'nfcu_shared_action_confirmed',
    'Deploy the IVR rate-comparison template': 'nfcu_shared_action_confirmed',
    'Draft a Marketing coordination rule': 'nfcu_shared_marketing_rule',
    'Draft an after-action report': 'nfcu_shared_after_action',
    'Draft an after-action report when this resolves': 'nfcu_shared_after_action',
    'Generate the full after-action report': 'nfcu_shared_after_action',
    'Draft the escalation to the CMO': 'nfcu_shared_escalation_cmo',
    'Escalate the Marketing pre-notification gap': 'nfcu_shared_escalation_cmo',
    'Export this analysis': 'nfcu_shared_export_analysis',
    'Generate an ROI estimate': 'nfcu_shared_ivr_enhancement_cost',
    'How do we prevent the Marketing notification gap?': 'nfcu_shared_marketing_gap_explain',
    'How do we prevent the marketing notification gap?': 'nfcu_shared_marketing_gap_explain',
    'Model the impact on general banking': 'nfcu_shared_general_banking_impact',
    'Monitor and report back in 20 min': 'nfcu_shared_monitor_20min',
    'Plan hiring backfill': 'nfcu_dir_brief_staffing_outlook',
    'Queue a journey audit': 'nfcu_shared_journey_audit',
    'Reroute the 12 idle agents now': 'nfcu_shared_action_confirmed',
    'Schedule a CX review': 'nfcu_dir_brief_sentiment_trend',
    'Schedule a recognition note': 'nfcu_shared_recognition_note',
    'Send this to Marcus': 'nfcu_shared_send_to_marcus',
    'Send this to the COO': 'nfcu_shared_send_to_coo',
    'Show me OT cost projection': 'nfcu_shared_ot_cost_projection',
    'Show me PinDrop recovery status': 'nfcu_shared_pindrop_status',
    'Show me adherence by team this shift': 'nfcu_dir_turn_1_team_rollup',
    'Show me agent utilization right now': 'nfcu_dir_turn_1_team_rollup',
    'Show me escrow statement complaints': 'nfcu_shared_escrow_complaints',
    'Show me handle-time detail by intent': 'intraday_sup_explain_handle_time',
    'Show me member impact': 'nfcu_shared_member_impact',
    'Show me overtime by agent': 'nfcu_dir_budget_exposure',
    'Show me overtime by team': 'nfcu_dir_budget_exposure',
    'Show me quality scores by team this week': 'nfcu_dir_brief_sentiment_trend',
    'Show me sentiment by team': 'nfcu_dir_brief_sentiment_trend',
    'Show me the IVR funnel': 'nfcu_shared_ivr_funnel',
    'Show me the Marketing pre-notification gap': 'nfcu_shared_marketing_gap_show',
    'Show me the SIP path health map': 'nfcu_shared_sip_path_map',
    'Show me the budget exposure': 'nfcu_dir_signal_3_budget',
    'Show me the caller profile': 'nfcu_shared_volume_breakdown',
    'Show me the cross-trained agents': 'intraday_dir_explain_agent_pool_cross_trained',
    // Round 2: chips offered by shared follow-up flows (director)
    'Add to next sprint backlog': 'nfcu_shared_sprint_backlog',
    'Approve the rule': 'nfcu_shared_action_confirmed',
    'Approve the schedule': 'nfcu_shared_action_confirmed',
    'Enable callback now': 'intraday_t5_execute',
    'Model the combined impact': 'nfcu_shared_aht_options',
    'Open the file': 'nfcu_shared_action_confirmed',
    'Schedule a 1:1 with the team lead': 'nfcu_shared_schedule_1on1',
    'Send the escalation now': 'nfcu_shared_action_confirmed',
    'Send the escalation to Sarah': 'nfcu_shared_action_confirmed',
    'Send the invite now': 'nfcu_shared_action_confirmed',
    'Send the note': 'nfcu_shared_action_confirmed',
    'Send to leadership': 'nfcu_shared_send_to_coo',
    'Send to the CMO': 'nfcu_shared_send_to_coo',
    'Set priority to P1': 'nfcu_shared_action_confirmed',
    'Share with the team': 'nfcu_shared_action_confirmed',
    'Show me the Jul 22 AAR': 'nfcu_shared_historical_compare',
    'Show me the current snapshot': 'nfcu_shared_member_impact',
    'Show me the impact measurement': 'nfcu_shared_member_impact',
    'Show me the mortgage repeat-contact pattern': 'nfcu_dir_brief_mortgage_repeat',
    'Show the repeat-contact pattern': 'nfcu_dir_brief_mortgage_repeat',
    'Show me the pre-staged exec line': 'intraday_dir_t6_brief',
    'Show me the rate promo comparison data': 'nfcu_shared_volume_breakdown',
    'What did we learn from Jul 22?': 'nfcu_shared_what_we_learned',
    'What if we miss May 15?': 'nfcu_shared_escalation_si',
    'What should I monitor?': 'nfcu_shared_monitor_20min',
    'What would the IVR enhancement cost?': 'nfcu_shared_ivr_enhancement_cost',
    "What's next?": 'nfcu_dir_turn_3_actions',
    "What's the deflection assumption?": 'nfcu_shared_ivr_enhancement_cost',
    'Show me the digital banking team\'s capacity': 'nfcu_dir_turn_1_team_rollup',
    'Show me the general banking impact': 'nfcu_shared_general_banking_impact',
    'Show me the team-level breakdown': 'nfcu_dir_turn_1_team_rollup',
    'Show me the volume breakdown': 'nfcu_shared_volume_breakdown',
    'Show me which agents are idle right now': 'intraday_dir_explain_agent_pool_idle_routing',
    'Show staffing by week': 'nfcu_dir_brief_staffing_outlook',
    'What are my options to reduce AHT impact?': 'nfcu_shared_aht_options',
    'What can we do to reduce AHT impact?': 'nfcu_shared_aht_options',
    'What did we learn for next time?': 'nfcu_shared_what_we_learned',
    'What did we learn?': 'nfcu_shared_what_we_learned',
    'What if we enable callback?': 'nfcu_shared_what_if_callback',
    'What is PinDrop fallback doing to handle time?': 'nfcu_shared_pindrop_fallback',
    'What is my overtime exposure?': 'nfcu_dir_brief_staffing_outlook',
    'What is the geographic constraint?': 'nfcu_shared_geographic_constraint',
    'What is the member experience impact?': 'nfcu_shared_member_impact',
    'What should I tell leadership right now?': 'intraday_dir_t6_brief',
    'What would have happened today without cross-source correlation?': 'nfcu_shared_what_without_correlation',
    "What's the volume impact?": 'nfcu_shared_volume_breakdown',
    'Who should I escalate the pre-notification gap to?': 'nfcu_shared_who_to_escalate',
    'Why is the PinDrop fallback being triggered?': 'nfcu_shared_pindrop_fallback',
    'Why is the floor adherence slipping?': 'intraday_dir_explain_agent_pool_adherence',
  },
  signalSequence: ['nfcu_dir_signal_1_service', 'nfcu_dir_signal_2_migration', 'nfcu_dir_signal_3_budget'],
  askTurnSequence: ['nfcu_dir_turn_1_team_rollup', 'nfcu_dir_turn_2_scenarios', 'nfcu_dir_turn_3_actions'],
  intradaySequence: [
    'intraday_dir_t1_greeting',
    'intraday_dir_t2_walkthrough',
    'intraday_dir_t3_correlate',
    'intraday_dir_t4_options',
    'intraday_dir_t5_execute',
    'intraday_dir_t6_brief',
    'intraday_dir_t7_historical',
  ],
  actionTurnKey: 'nfcu_dir_turn_3_actions',
  actionConfirmMap: {
    'ACT-NFCU-DIR-001': { responseKey: 'ACT-NFCU-DIR-001', nextChips: ['Draft an escalation to the SI partner', 'Generate my weekly leadership report'] },
    'ACT-NFCU-DIR-002': { responseKey: 'ACT-NFCU-DIR-002', nextChips: ['Hold for my review', 'Generate my weekly leadership report'] },
    'ACT-NFCU-DIR-003': { responseKey: 'ACT-NFCU-DIR-003', nextChips: ['Add a recommendation section', 'Export as PDF', "Compare to last month's report"] },
  },
};

// ─── NFCU: Member Self-Service (Elena Ruiz) ──────────────────────
const nfcuMemberConfig = {
  chatFlows: nfcuMemberChatFlows,
  chipToFlowKey: {
    // Greeting follow-ups
    'Tell me why it was declined': 'nfcu_member_step3_decline',
    "What's my balance?": 'nfcu_member_step2_balance',
    'Will I be charged a late fee?': 'nfcu_member_step5_latefee',
    // Balance follow-ups
    'Now tell me about the declined payment': 'nfcu_member_step3_decline',
    'Show my pending transactions': 'nfcu_member_transactions',
    "What's my auto loan balance?": 'nfcu_member_autoloan_balance',
    // Decline follow-ups
    "Why isn't my salary being applied?": 'nfcu_member_step4_salary',
    'Can you fix the direct deposit?': 'nfcu_member_step6_fix',
    'Will this happen again next month?': 'nfcu_member_recurrence',
    // Salary / exception follow-ups
    'Fix the direct deposit now': 'nfcu_member_step6_fix',
    'What happens to the held funds?': 'nfcu_member_held_funds',
    'Retry my auto loan payment': 'nfcu_member_step6_fix',
    // Late-fee / predictive follow-ups
    'Do the fix and retry the payment': 'nfcu_member_step6_fix',
    'Just retry with my current balance': 'nfcu_member_retry_only',
    'Remind me tomorrow instead': 'nfcu_member_remind_tomorrow',
    // Action confirmation follow-ups
    'Great, confirm when it posts': 'nfcu_member_confirm_posts',
    'Set this up for my credit card too': 'nfcu_member_creditcard',
    'Anything else I should know?': 'nfcu_member_step7_anything_else',
    // Wrap-up follow-ups
    "Thanks, that's all": 'nfcu_member_thanks',
    'Show my full activity': 'nfcu_member_transactions',
    'Turn on alerts for declined payments': 'nfcu_member_alerts',
    // Suggested query bar (8)
    'Why was my payment declined?': 'nfcu_member_step3_decline',
    'Is my paycheck deposited yet?': 'nfcu_member_step4_salary',
    'Fix my direct deposit': 'nfcu_member_step6_fix',
    'When is my next auto loan payment due?': 'nfcu_member_next_payment',
    'Retry my declined payment': 'nfcu_member_step6_fix',
    'Show my recent transactions': 'nfcu_member_transactions',
  },
  signalSequence: ['nfcu_member_step3_decline', 'nfcu_member_step4_salary', 'nfcu_member_step5_latefee'],
  askTurnSequence: [
    'nfcu_member_step2_balance',
    'nfcu_member_step3_decline',
    'nfcu_member_step4_salary',
    'nfcu_member_step5_latefee',
    'nfcu_member_step6_fix',
    'nfcu_member_step7_anything_else',
  ],
  actionTurnKey: 'nfcu_member_step6_fix',
  actionConfirmMap: {},
};

// ─── NFCU: Agent-Assist (David Torres) ───────────────────────────
const nfcuAgentConfig = {
  chatFlows: nfcuAgentChatFlows,
  chipToFlowKey: {
    // Greeting follow-ups
    'Give me the full breakdown': 'nfcu_agent_step2_breakdown',
    'What do I tell her first?': 'nfcu_agent_what_first',
    'Show her account summary': 'nfcu_agent_account_summary',
    // Breakdown follow-ups
    'How do I explain this simply?': 'nfcu_agent_step3_explain',
    'Is there a late fee risk?': 'nfcu_agent_late_fee_risk',
    'Walk me through the fix': 'nfcu_agent_step5_identity',
    // Explain follow-ups
    "Good, I'll say that": 'nfcu_agent_step4_verify',
    'Now walk me through the fix': 'nfcu_agent_step5_identity',
    'Verify her identity first': 'nfcu_agent_step4_verify',
    // Verification follow-ups
    'Identity confirmed': 'nfcu_agent_step5_identity',
    'Why is this required here?': 'nfcu_agent_why_required',
    'Continue to the fix': 'nfcu_agent_step5_identity',
    // Resolution-outlook follow-ups
    'Do the routing fix and retry': 'nfcu_agent_step6_execute',
    'Just retry for now': 'nfcu_agent_retry_only',
    'Show me the callback risk detail': 'nfcu_agent_callback_risk',
    // Execution follow-ups
    'Confirm to the member': 'nfcu_agent_confirm_member',
    'Add a note to her CRM record': 'nfcu_agent_crm_note',
    'Wrap up the call': 'nfcu_agent_step7_wrapup',
    // Wrap-up follow-ups
    'Save and close': 'nfcu_agent_save_close',
    'Edit the note': 'nfcu_agent_edit_note',
    'Next call': 'nfcu_agent_next_call',
    // Suggested query bar (8)
    "Why was this member's payment declined?": 'nfcu_agent_step2_breakdown',
    'Correlate the decline across her accounts': 'nfcu_agent_step2_breakdown',
    'How do I explain this in plain language?': 'nfcu_agent_step3_explain',
    "What's the compliant resolution?": 'nfcu_agent_compliant_resolution',
    'Prompt the identity verification step': 'nfcu_agent_step4_verify',
    'Retry the payment after the fix': 'nfcu_agent_step6_execute',
    'Log AI vs. human actions for this call': 'nfcu_agent_action_log',
    'Draft my after-call summary': 'nfcu_agent_step7_wrapup',
  },
  signalSequence: ['nfcu_agent_step2_breakdown', 'nfcu_agent_step4_verify', 'nfcu_agent_step7_wrapup'],
  askTurnSequence: [
    'nfcu_agent_step2_breakdown',
    'nfcu_agent_step3_explain',
    'nfcu_agent_step4_verify',
    'nfcu_agent_step5_identity',
    'nfcu_agent_step6_execute',
    'nfcu_agent_step7_wrapup',
  ],
  actionTurnKey: 'nfcu_agent_step6_execute',
  actionConfirmMap: {},
};

// ─── NFCU: Platform Administrator, AI Governance & LLMOps (Daniel Okonkwo) ──
// Six-turn assurance journey per NFCU_CCaaS_Prototype_Spec.docx. Every chip the
// spec offers maps to a flow — no dead ends.
const nfcuPaConfig = {
  chatFlows: nfcuPaChatFlows,
  chipToFlowKey: {
    // Turn 1 — Assurance Briefing
    'Review the auto loan spike': 'nfcu_pa_field_sovereignty',
    'Show me contact center spend': 'nfcu_pa_spend_on_track',
    'What did the graph catch?': 'nfcu_pa_kag_provenance',
    // Turn 2 — Field Sovereignty
    'Why did the auto loan rate stay local?': 'nfcu_pa_kag_provenance',
    'Show me the routing logic': 'nfcu_pa_routing_logic',
    'What did the frontier model do?': 'nfcu_pa_frontier_task',
    // Turn 3 — Sensitivity Provenance (KAG)
    'Show all fields flagged sensitive': 'nfcu_pa_field_sovereignty',
    // Turn 4 — Routing Logic (three gates)
    'Show me the budget guardrail': 'nfcu_pa_budget_guardrail',
    'Run the cost report': 'nfcu_pa_cost_usage',
    'Show me the field ledger again': 'nfcu_pa_field_sovereignty',
    'Which tasks used the frontier model?': 'nfcu_pa_frontier_task',
    // Turn 5 — Budget Guardrail
    'Show me who is near their budget': 'nfcu_pa_near_budget',
    'Show the routing logic': 'nfcu_pa_routing_logic',
    // Turn 6 — LLM Cost and Usage
    'Show me the highest-cost tasks': 'nfcu_pa_highest_cost',
    'Break it down by persona': 'nfcu_pa_by_persona',
    'Show frontier usage this month': 'nfcu_pa_observability',
    // Turn 7 — Semantic Cache Reuse
    'Show cache hit rate this month': 'nfcu_pa_cache_hit_rate',
    'Which answers are cached?': 'nfcu_pa_cache_hit_rate',
    // Turn 8 — Enterprise Agent Observability
    'Expand a flagged action': 'nfcu_pa_expand_action',
    'Show the spend trend': 'nfcu_pa_spend_trend',
    // Spec v2 Step 8 words it without the "me"; keep both so either lands.
    'Show the enterprise agent inventory': 'nfcu_pa_agent_inventory',
    'Show me the enterprise agent inventory': 'nfcu_pa_agent_inventory',
    'Compare governance across initiatives': 'nfcu_pa_by_foundry',
    'Generate a governance summary': 'nfcu_pa_gov_summary',
    'Generate an enterprise governance summary': 'nfcu_pa_gov_summary',
    // Turn 9 — Enterprise Agent Inventory
    'Group these by foundry': 'nfcu_pa_by_foundry',
    'Show anything not yet under governance': 'nfcu_pa_ungoverned',
    'Onboard an agent to governance': 'nfcu_pa_onboard_agent',
    // Suggested query bar (12, verbatim from spec v2)
    'Show me where every field in this response went': 'nfcu_pa_field_sovereignty',
    'Did any PII reach the frontier model?': 'nfcu_pa_pii_check',
    'Why was this field classified sensitive?': 'nfcu_pa_kag_provenance',
    'Show me the routing logic as a diagram': 'nfcu_pa_routing_logic',
    'Which tasks used the frontier model, and why?': 'nfcu_pa_frontier_task',
    'Run the LLM cost report for this session': 'nfcu_pa_cost_usage',
    'How much did routing save versus all-frontier?': 'nfcu_pa_savings',
    'Show me agent activity and frontier usage across the enterprise': 'nfcu_pa_observability',
    'What happens when someone hits their budget cap?': 'nfcu_pa_budget_guardrail',
    'Show me where we reused an answer instead of calling a model': 'nfcu_pa_cache_reuse',
    'Show me every AI agent and foundry in the enterprise': 'nfcu_pa_agent_inventory',
    'Show me every AI agent running across the enterprise and what it is built on': 'nfcu_pa_agent_inventory',
  },
  signalSequence: ['nfcu_pa_field_sovereignty', 'nfcu_pa_spend_on_track', 'nfcu_pa_kag_provenance'],
  // Spec v2's nine turns. Turn 1 is the greeting, which is seeded rather than
  // sequenced, so this holds turns 2–9.
  askTurnSequence: [
    'nfcu_pa_field_sovereignty',
    'nfcu_pa_kag_provenance',
    'nfcu_pa_routing_logic',
    'nfcu_pa_budget_guardrail',
    'nfcu_pa_cost_usage',
    'nfcu_pa_cache_reuse',
    'nfcu_pa_observability',
    'nfcu_pa_agent_inventory',
  ],
};

// ─── PenFed-only: Capital Markets Risk (Sowmya Ha) ───────────────
// This config is added ONLY to penfedPersonaFlowConfigs below — never to the
// base registry — so the capmarkets persona has no chat flows outside PenFed.
const capmarketsConfig = {
  chatFlows: penfedCapmChatFlows,
  chipToFlowKey: {
    // Step 1 → Step 2 walkthrough
    'Yes, walk me through them': 'turn_1_walkthrough',
    'Next signal': '__next_signal__',

    // Signal-detail chips
    'What is driving the delinquency spike?': 'delinquency_drivers',
    'Show me hedge positions': 'turn_4_hedge_anomaly',
    'Show me the hedge effectiveness signal': 'turn_4_hedge_anomaly',
    'Show me the dealer concentration signal': 'signal_3_dealer',
    'Show me the dealer-level breakdown': 'turn_2_dealer_breakdown',

    // Trigger scenarios
    'What happens if we breach the trigger?': 'turn_3_trigger_scenarios',
    'How do our other trusts compare?': 'trust_compare',
    'What should we do about these dealers?': 'dealer_remediation_action',
    'Are these dealers in our pipeline for 2025-B?': 'dealers_in_2025b',
    'Execute Scenario B': 'execute_scenario_b',
    'Draft a trustee notification for Scenario C': 'trustee_notification_draft',
    'Show me the action set': 'turn_6_actions',

    // Capital + remediation
    'What does this mean for our capital ratio?': 'turn_5_capital_impact',
    'Execute the remediation path': 'turn_6_actions',
    'Generate a board risk summary': 'board_risk_summary',
    'Add the capital impact analysis to the board package': 'board_risk_summary',
    'Add the capital impact analysis': 'board_risk_summary',
    'Prepare the S&P surveillance package': 'sp_surveillance_package',
    'Model additional rate scenarios': 'additional_rate_scenarios',
    'Show me the +50 bps detail': 'q_rate_scenario_50bps',
    'Show me the +100 bps detail': 'additional_rate_scenarios',

    // Hedge follow-ups
    'What are my options to fix the hedge?': 'hedge_fix_options',
    'Model the P&L impact if we lose hedge accounting': 'pnl_no_hedge_accounting',

    // Post-action chips
    'Confirm all three': 'confirm_all_three',
    'Review the dealer brief first': 'review_dealer_brief',
    'Show me the full portfolio summary': 'full_portfolio_summary',

    // Suggested query bar (8)
    'Show me ABS collateral performance across all trusts': 'q_abs_collateral_overview',
    'What is our current interest rate exposure?': 'q_interest_rate_exposure',
    'Compare prepayment speeds: 2024-A vs. 2025-A': 'q_cpr_compare',
    'Which dealer partners are underperforming?': 'q_underperforming_dealers',
    'Model a 50 bps rate increase on the investment portfolio': 'q_rate_scenario_50bps',
    'What is our capital ratio sensitivity to credit losses?': 'q_capital_sensitivity',
    'Prepare the monthly capital markets risk report': 'q_monthly_report',
    'Show me the rating agency timeline and open items': 'q_rating_agency_timeline',

    // KPI tile triggers
    'Show me ABS portfolio outstanding': 'kpi_abs_outstanding',
    'Show me connected data sources': 'kpi_data_sources_overview',
    'Drill into PNFED 2024-A': 'signal_1_abs',

    // Terminal action chips — every chip surfaces a meaningful mock response
    // so the chat thread never dead-ends on an unmapped chip.
    'Edit dealer brief': 'edit_dealer_brief',
    'Save changes': 'save_changes',
    'Draft 2025-B pipeline change memo': 'draft_2025b_pipeline_memo',
    'Draft 2025-B timing memo': 'draft_2025b_timing_memo',
    'Send to legal for review': 'send_to_legal',
    'Send to board secretary': 'send_to_board_secretary',
    'Submit to S&P': 'submit_to_sp',
    'Submit to Fitch': 'submit_to_fitch',
    'Also prepare Fitch package': 'also_prepare_fitch',
    'Send to SVP Treasury': 'send_to_svp_treasury',
    'Export as PDF': 'export_as_pdf',
  },
  signalSequence: ['signal_1_abs', 'signal_2_hedge', 'signal_3_dealer'],
  askTurnSequence: [
    'turn_1_walkthrough',
    'turn_2_dealer_breakdown',
    'turn_3_trigger_scenarios',
    'turn_4_hedge_anomaly',
    'turn_5_capital_impact',
    'turn_6_actions',
  ],
  actionTurnKey: 'turn_6_actions',
  actionConfirmMap: {
    'ACT-CAPM-001': { responseKey: 'ACT-CAPM-001', nextChips: ['Confirm all three', 'Review the dealer brief first'] },
    'ACT-CAPM-002': { responseKey: 'ACT-CAPM-002', nextChips: ['Confirm all three', 'Show me the full portfolio summary'] },
    'ACT-CAPM-003': { responseKey: 'ACT-CAPM-003', nextChips: ['Confirm all three', 'Generate a board risk summary'] },
  },
};

// ─── USSFCU-only: Chief Financial Officer (Sylvia Reyes) ─────────
// Data-governance / audit story. Gated to clientId === 'ussfcu' in PersonaContext,
// so this config is safe to keep in the base registry (cannot be selected elsewhere).
const ussfcuCfoConfig = {
  chatFlows: ussfcuCfoChatFlows,
  chipToFlowKey: {
    'Next signal': '__next_signal__',

    // Suggested query bar + greeting drill chips
    "Why doesn't my loan-loss number match Lending?": 'ussfcu_cfo_turn_show_break',
    'Show me where the numbers break': 'ussfcu_cfo_turn_show_break',
    'Show me the data flow from the core to Tableau': 'ussfcu_cfo_turn_data_flow',
    'Show me the data flow that produced this': 'ussfcu_cfo_turn_data_flow',
    'Which board figures have no lineage?': 'ussfcu_cfo_highest_risk_figures',
    'Which figures are highest risk?': 'ussfcu_cfo_highest_risk_figures',
    'Reconcile the portfolio balance to one governed number': 'ussfcu_cfo_reconcile_parity',
    'Reconcile this to one governed number': 'ussfcu_cfo_reconcile_parity',
    'How long until the audit closes?': 'ussfcu_cfo_audit_timeline',
    'How many hours are we spending on manual reconciliation?': 'ussfcu_cfo_time_cost',
    'How much time is this costing us?': 'ussfcu_cfo_time_cost',
    'Generate the audit evidence package': 'ussfcu_cfo_turn_evidence_package',
    'Draft the data-governance remediation plan': 'ussfcu_cfo_turn_remediation_plan',

    // Parity
    "Why don't the CFO and Lending figures match?": 'ussfcu_cfo_turn_parity_gap',
    'Show me the CFO and Lending parity gap': 'ussfcu_cfo_turn_parity_gap',
    'Show me the CFO-Lending parity gap': 'ussfcu_cfo_turn_parity_gap', // legacy alias
    'Who has been seeing which figure?': 'ussfcu_cfo_who_sees_what',

    // Reconciliation drill
    'Why are these systems out of sync?': 'ussfcu_cfo_systems_out_of_sync',
    'Reconcile the loan-loss figure now': 'ussfcu_cfo_reconcile_now',

    // Lineage drill
    'What would full lineage do for the audit?': 'ussfcu_cfo_turn_full_lineage',
    'Fix the worst gap first': 'ussfcu_cfo_fix_worst_gap',
    'What does remediation require?': 'ussfcu_cfo_remediation_requires',

    // Evidence package
    'Route it and notify Lending': 'ussfcu_cfo_route_and_notify',
    'Show me what is still open': 'ussfcu_cfo_whats_open',

    // Remediation plan branches
    'Export for the leadership event': 'ussfcu_cfo_export_leadership',
    'Add a budget estimate': 'ussfcu_cfo_budget_estimate',
    'Show me the access-routing detail': 'ussfcu_cfo_access_routing',
    'Compare to peer audit benchmarks': 'ussfcu_cfo_peer_benchmarks',
  },
  signalSequence: ['ussfcu_cfo_signal_1_loanloss', 'ussfcu_cfo_signal_2_parity', 'ussfcu_cfo_signal_3_lineage'],
  askTurnSequence: [
    'ussfcu_cfo_turn_show_break',
    'ussfcu_cfo_turn_data_flow',
    'ussfcu_cfo_turn_full_lineage',
    'ussfcu_cfo_turn_parity_gap',
    'ussfcu_cfo_turn_evidence_package',
    'ussfcu_cfo_turn_remediation_plan',
  ],
  actionTurnKey: 'ussfcu_cfo_turn_evidence_package',
  actionConfirmMap: {
    'ACT-USSFCU-CFO-001': { responseKey: 'ACT-USSFCU-CFO-001', nextChips: ['Draft the data-governance remediation plan', 'Show me what is still open'] },
    'ACT-USSFCU-CFO-002': { responseKey: 'ACT-USSFCU-CFO-002', nextChips: ['Draft the data-governance remediation plan', 'Show me what is still open'] },
  },
};

// USSFCU CEO — pure-executive state-of-the-business flow. Gated to
// clientId === 'ussfcu' in PersonaContext, so this config is safe to keep in
// the base registry (cannot be selected elsewhere).
const ussfcuCeoConfig = {
  chatFlows: ussfcuCeoChatFlows,
  chipToFlowKey: {
    'Next signal': '__next_signal__',

    // Suggested query bar + greeting drill chips
    'Where does the business stand this morning?': 'ussfcu_ceo_where_stands',
    'Walk me through the liquidity signal': 'ussfcu_ceo_turn_liquidity',
    'What happens to liquidity if this continues?': 'ussfcu_ceo_turn_projection',
    'Can I trust these numbers?': 'ussfcu_ceo_turn_trust',
    'Can I trust these numbers this morning?': 'ussfcu_ceo_turn_trust',
    'Trace net income back to source': 'ussfcu_ceo_trace_net_income',
    'Show me membership and growth': 'ussfcu_ceo_turn_membership',
    'What is the national membership opportunity?': 'ussfcu_ceo_national_opportunity',
    'Draft the board briefing': 'ussfcu_ceo_turn_board_briefing',

    // Briefing / Presentation Mode (Presentation Mode is a later build phase)
    'Open the full briefing': 'ussfcu_ceo_turn_full_briefing',
    'Export as document': 'ussfcu_ceo_export_document',
    'Add a recommendation slide': 'ussfcu_ceo_add_recommendation',
  },
  signalSequence: ['ussfcu_ceo_signal_1_liquidity', 'ussfcu_ceo_signal_2_membership', 'ussfcu_ceo_signal_3_trust'],
  askTurnSequence: [
    'ussfcu_ceo_turn_liquidity',
    'ussfcu_ceo_turn_projection',
    'ussfcu_ceo_turn_trust',
    'ussfcu_ceo_trace_net_income',
    'ussfcu_ceo_turn_membership',
    'ussfcu_ceo_turn_board_briefing',
  ],
  actionTurnKey: 'ussfcu_ceo_turn_board_briefing',
  actionConfirmMap: {
    'ACT-USSFCU-CEO-001': { responseKey: 'ACT-USSFCU-CEO-001', nextChips: ['Open the full briefing', 'Export as document', 'Add a recommendation slide'] },
    'ACT-USSFCU-CEO-002': { responseKey: 'ACT-USSFCU-CEO-002', nextChips: ['Open the full briefing', 'Export as document', 'Add a recommendation slide'] },
  },
};

// ─── Export registry ─────────────────────────────────────────────
const personaFlowConfigs = {
  ops: opsConfig,
  cx: cxConfig,
  retention: retConfig,
  risk: riskConfig,
  nfcu_supervisor: nfcuSupConfig,
  nfcu_analyst: nfcuAnaConfig,
  nfcu_workforce: nfcuWfConfig,
  nfcu_director: nfcuDirConfig,
  nfcu_member: nfcuMemberConfig,
  nfcu_agent: nfcuAgentConfig,
  nfcu_platform_admin: nfcuPaConfig,
  ussfcu_cfo: ussfcuCfoConfig,
  ussfcu_ceo: ussfcuCeoConfig,
};

// PenFed gets its own chatFlows for the generic personas (ops/cx/retention),
// plus the PenFed-only capmarkets persona that does not exist in the base registry.
// Risk + all NFCU personas have no PenFed-specific data so they share the defaults.
const penfedPersonaFlowConfigs = {
  ...personaFlowConfigs,
  ops: { ...opsConfig, chatFlows: penfedOpsChatFlows },
  cx: { ...cxConfig, chatFlows: penfedCxChatFlows },
  retention: { ...retConfig, chatFlows: penfedRetChatFlows },
  capmarkets: capmarketsConfig,
};

export function getPersonaFlowConfigs(clientId) {
  return clientId === 'penfed' ? penfedPersonaFlowConfigs : personaFlowConfigs;
}

export default personaFlowConfigs;
