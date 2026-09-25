/**
 * USSFCU — the Oral Demo Talk Track v4, clicked through.
 *
 * The talk track (USSFCU_Oral_Demo_Talk_Track_v4.docx) is the source of truth
 * for the USSFCU demo. Each persona's CLICK lines are encoded below with the
 * turn each must land on, replayed the way the live chat resolves them (see
 * talkTrackReplay). Tim's Presentation Mode clicks ("Next", "Download PDF") are
 * deck controls, not chat chips, so his chat path ends at the full briefing.
 * If the talk track changes, change the table.
 */
import { describe, it, expect } from 'vitest';
import type { ClientManifest, PersonaManifest } from '@core/types';
import { expectTalkTrack, type TalkTrackStep } from '@/data/talkTrackReplay';
import { ussfcuClient } from '@/markets/financial-services/clients/ussfcu/client.manifest';
import { penfedClient } from '@/markets/financial-services/clients/penfed/client.manifest';
import { financialServicesClient } from '@/markets/financial-services/clients/financial-services/client.manifest';
import { USSFCU_TALK_TRACK } from '@/markets/financial-services/clients/ussfcu/talkTrack';

const TALK_TRACK: Record<string, TalkTrackStep[]> = {
  // Part 1 — James R.
  risk: [
    ['Yes, walk me through them', 'risk_signal_1_structuring'],
    ['Next signal', 'risk_signal_2_wire_anomaly'],
    ['Next signal', 'risk_signal_3_ncua_decline'],
    ['Show me our regulatory exposure', 'risk_turn_2_regulatory'],
    ['Generate a board-level risk summary', 'risk_board_summary'],
  ],
  // Part 1 — Evelyn Marsh
  ussfcu_evelyn: [
    ['Run the deep query', 'ussfcu_evelyn_turn_deepquery'],
    ['Apply the compliance tests', 'ussfcu_evelyn_turn_tests'],
    ['Build the disclosure checklist and calendar', 'ussfcu_evelyn_turn_checklist'],
    ['Which files are highest risk before the exam?', 'ussfcu_evelyn_turn_ranked_risk'],
    ['Did we lose the 33 to another lender, and why?', 'ussfcu_evelyn_turn_attrition'],
    ['Generate the exam evidence package', 'ussfcu_evelyn_turn_evidence'],
  ],
  // Part 1 — Nadia Hassan
  ussfcu_nadia: [
    ['Open file 20-4471', 'ussfcu_nadia_turn_openfile'],
    ['Compare to procedure', 'ussfcu_nadia_turn_procedure'],
    ['Build the disclosure checklist and calendar', 'ussfcu_nadia_turn_checklist'],
    ['Log the fee complaint', 'ussfcu_nadia_turn_complaint'],
  ],
  // Part 1 — Tim Anderson, Act 1 (Conversation Mode)
  ussfcu_ceo: [
    ['Walk me through the liquidity signal', 'ussfcu_ceo_turn_liquidity'],
    ['What happens if this continues?', 'ussfcu_ceo_turn_projection'],
    ['Can I trust these numbers?', 'ussfcu_ceo_turn_trust'],
    ['Draft the board briefing', 'ussfcu_ceo_turn_board_briefing'],
    ['Open the full briefing', 'ussfcu_ceo_turn_full_briefing'],
  ],
  // Part 1 — Sylvia Reyes
  ussfcu_cfo: [
    ['Show me where the numbers break', 'ussfcu_cfo_turn_show_break'],
    ['Show me the data flow that produced this', 'ussfcu_cfo_turn_data_flow'],
    ['What would full lineage do for the audit?', 'ussfcu_cfo_turn_full_lineage'],
    ['Show me the CFO and Lending parity gap', 'ussfcu_cfo_turn_parity_gap'],
    ['Generate the audit evidence package', 'ussfcu_cfo_turn_evidence_package'],
    ['Draft the data-governance remediation plan', 'ussfcu_cfo_turn_remediation_plan'],
  ],
  // Part 1 — Fiona, Finance Team (added in Talk Track v4)
  ussfcu_finance: [
    ['Show delinquency trends by segment', 'ussfcu_finance_turn_delinquency'],
    ['Which portfolios are near their board limits?', 'ussfcu_finance_turn_limits'],
    ['Model a government shutdown on the portfolio', 'ussfcu_finance_turn_shutdown'],
    ['Do we have enough capital and liquidity?', 'ussfcu_finance_turn_cushion'],
    ['What is our shutdown playbook?', 'ussfcu_finance_turn_playbook'],
    ['Show deposit activity by SEG group', 'ussfcu_finance_turn_seg_deposits'],
  ],
  // Part 2 — Maya J.
  ops: [
    ['Yes, walk me through them', 'signal_1_mortgage'],
    ['Next signal', 'signal_2_auto_loan'],
    ['Next signal', 'signal_3_cd_complaint'],
    ["I'm ready to act", 'turn_4_actions'],
  ],
  // Part 2 — Priya K.
  cx: [
    ['Yes, walk me through them', 'cx_signal_1_channel_switch'],
    ['Next signal', 'cx_signal_2_journey_abandon'],
    ['Next signal', 'cx_signal_3_ivr_escalation'],
    ['What intervention is needed?', 'cx_turn_3_intervention'],
  ],
  // Part 2 — Derek T.
  retention: [
    ['Yes, walk me through them', 'ret_signal_1_churn_surge'],
    ['Next signal', 'ret_signal_2_engagement_decay'],
    ['Next signal', 'ret_signal_3_retiree_disengage'],
    ['Model the retention impact', 'ret_turn_3_retention_action'],
  ],
};

/** The talk track's persona order, which the persona switcher follows. */
const DEMO_ORDER = Object.keys(TALK_TRACK);

async function load(client: ClientManifest, id: string): Promise<PersonaManifest> {
  return (await client.personas.find((p) => p.id === id)!.load()).default;
}

describe('USSFCU talk track v4', () => {
  it('lists the personas in the order the talk track presents them, opening on James', () => {
    expect(ussfcuClient.personas.map((p) => p.id)).toEqual(DEMO_ORDER);
    expect(ussfcuClient.defaultPersonaId).toBe('risk');
  });

  it.each(DEMO_ORDER)('%s: every CLICK is offered, highlighted, and lands where the script says', async (id) => {
    expectTalkTrack(await load(ussfcuClient, id), TALK_TRACK[id]);
  });

  it("describes Maya's third action as the anomaly scan its card runs", async () => {
    const flow = (await load(ussfcuClient, 'ops')).flows.chatFlows.turn_4_actions as { ai_response: string };
    expect(flow.ai_response).toMatch(/\[3\] Run a cross-system anomaly scan/);
  });

  // The talk track is applied to USSFCU's registration of the shared personas
  // only. PenFed and the Financial Services client load the same shared
  // manifests and must keep their own golden paths and wording.
  it.each([
    ['penfed', penfedClient],
    ['financial-services', financialServicesClient],
  ] as const)('leaves %s on its own golden paths', async (_name, client) => {
    await load(ussfcuClient, 'ops'); // loaded first, so a leak would show below
    for (const id of ['ops', 'cx', 'retention', 'risk'] as const) {
      if (!client.personas.some((p) => p.id === id)) continue;
      const m = await load(client, id);
      expect(m.ui.goldenPathChip).not.toEqual(USSFCU_TALK_TRACK[id].goldenPathChip);
    }
    if (client.personas.some((p) => p.id === 'ops')) {
      const ops = (await load(client, 'ops')).flows.chatFlows.turn_4_actions as { ai_response?: string };
      expect(ops.ai_response ?? '').not.toMatch(/\[3\] Run a cross-system anomaly scan/);
    }
  });
});
