/**
 * NFCU — the Oral Demo Talk Track v3, clicked through.
 *
 * The talk track (NFCU_Oral_Demo_Talk_Track_v3.docx, July 2026) is the source
 * of truth for the NFCU demo. Each persona's CLICK lines are encoded below with
 * the turn each must land on. At every step the chip must be OFFERED on the
 * turn on screen, must be the HIGHLIGHTED one (the presenter only ever clicks
 * the highlight), and must land where the talk track says. The highlight must
 * also stop where the talk track stops. If the talk track changes, change the
 * table — this file is the contract between the script and the prototype.
 */
import { describe, it, expect } from 'vitest';
import type { PersonaManifest } from '@core/types';
import { expectTalkTrack, type TalkTrackStep } from '@/data/talkTrackReplay';
import { nfcuClient } from '@/markets/financial-services/clients/nfcu/client.manifest';

type Flow = { suggested_chips?: string[]; ui_components_to_render?: Array<{ type: string; actions?: Array<{ id: string }> }> };

const TALK_TRACK: Record<string, TalkTrackStep[]> = {
  // Persona 1 — Priya Kapoor
  nfcu_supervisor: [
    ['Yes, walk me through them', 'nfcu_sup_signal_1_queue_spike'],
    ['What should we do?', 'nfcu_sup_turn_2_recommendations'],
    ['Activate the cross-trained agents', 'nfcu_sup_act_agents_confirm'],
    ['Show me the second signal', 'nfcu_sup_signal_2_staffing'],
    ['Who is available for overtime?', 'nfcu_sup_overtime_agents'],
    ['Send overtime offers to top 3', 'nfcu_sup_act_overtime_confirm'],
  ],
  // Persona 2 — Daniel Okonkwo
  nfcu_platform_admin: [
    ['Review the auto loan spike', 'nfcu_pa_spike_review'],
    ['Show me where every field went', 'nfcu_pa_field_sovereignty'],
    ['Why did the rate stay local?', 'nfcu_pa_kag_provenance'],
    ['Show me the routing logic', 'nfcu_pa_routing_logic'],
    ['What happens at the budget cap?', 'nfcu_pa_budget_guardrail'],
    ['Run the cost report', 'nfcu_pa_cost_usage'],
    ['Where did we reuse an answer?', 'nfcu_pa_cache_reuse'],
    ['Show agent activity across the enterprise', 'nfcu_pa_observability'],
    ['Show me every agent and what it is built on', 'nfcu_pa_agent_inventory'],
  ],
  // Persona 3 — Derek Whitfield
  nfcu_analyst: [
    ['Walk me through the tax season risk', 'nfcu_ana_turn_1_tax_season'],
    ['What are my options to close the gap?', 'nfcu_ana_turn_2_what_if'],
    ['Go with the hybrid option', 'nfcu_ana_act_hybrid_confirm'],
    ['Generate the weekly workforce report', 'nfcu_ana_weekly_report'],
  ],
  // Persona 4 — Janelle Moreau
  nfcu_workforce: [
    ['Walk me through the compliance issue', 'nfcu_wf_turn_1_compliance_detail'],
    ['Which accounts need remediation?', 'nfcu_wf_turn_2_remediation'],
    ['Approve the script revert', 'nfcu_wf_act_script_revert'],
    ['Show me the 8 accounts needing callbacks', 'nfcu_wf_act_remediation'],
    ['Generate a compliance incident report', 'nfcu_wf_act_compliance_report'],
  ],
  // Persona 5 — Marcus Tillman
  nfcu_director: [
    ['Walk me through the service level issue', 'nfcu_dir_signal_1_service'],
    ['What are my options to stabilize both teams?', 'nfcu_dir_turn_2_scenarios'],
    ['Execute Scenario C', 'nfcu_dir_act_scenario_c'],
    ['Generate my weekly leadership report', 'nfcu_dir_act_weekly_report'],
  ],
  // Persona 6 — Elena Ruiz
  nfcu_member: [
    ["What's my balance?", 'nfcu_member_step2_balance'],
    ['Why was my auto loan payment declined?', 'nfcu_member_step3_decline'],
    ["Why isn't my salary being applied?", 'nfcu_member_step4_salary'],
    ['Do the fix and retry the payment', 'nfcu_member_step6_fix'],
  ],
  // Persona 7 — David Torres
  nfcu_agent: [
    ['Give me the full breakdown', 'nfcu_agent_step2_breakdown'],
    ['Verify her identity first', 'nfcu_agent_step4_verify'],
    ['Do the routing fix and retry', 'nfcu_agent_step6_execute'],
  ],
};

/** The talk track's persona order, which the persona switcher follows. */
const DEMO_ORDER = Object.keys(TALK_TRACK);

async function manifests(): Promise<PersonaManifest[]> {
  return Promise.all(nfcuClient.personas.map(async (p) => (await p.load()).default as PersonaManifest));
}

describe('NFCU talk track v3', () => {
  it('lists the personas in the order the talk track presents them', () => {
    expect(nfcuClient.personas.map((p) => p.id)).toEqual(DEMO_ORDER);
  });

  it.each(DEMO_ORDER)('%s: every CLICK is offered, highlighted, and lands where the script says', async (id) => {
    expectTalkTrack((await manifests()).find((x) => x.id === id)!, TALK_TRACK[id]);
  });

  it.each(DEMO_ORDER)("%s: an action confirmed from its card keeps the golden path lit", async (id) => {
    const m = (await manifests()).find((x) => x.id === id)!;
    const chatFlows = m.flows.chatFlows as Record<string, Flow>;
    const actions = (chatFlows[m.flows.actionTurnKey ?? '']?.ui_components_to_render ?? []).flatMap((c) => c.actions ?? []);
    for (const [key, chip] of Object.entries(m.ui.goldenPathChip)) {
      if (!key.startsWith('action_confirm_')) continue;
      const actionId = key.slice('action_confirm_'.length);
      // The card exists on the action turn, and its Confirm offers the chip the
      // talk track clicks next — the chip that is then highlighted.
      expect(actions.map((a) => a.id), `no card "${actionId}"`).toContain(actionId);
      expect(m.flows.actionConfirmMap?.[actionId]?.nextChips, `${actionId} confirm does not offer "${chip}"`).toContain(chip);
      expect(TALK_TRACK[id].map(([click]) => click)).toContain(chip);
    }
  });
});
