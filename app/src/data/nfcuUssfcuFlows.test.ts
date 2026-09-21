/**
 * NFCU + USSFCU — every persona's conversation, walked end to end.
 *
 * Table-driven form of the ultra-chat-flows template, covering all seven NFCU
 * personas and all eight USSFCU registrations (the four bespoke personas plus
 * the shared ops/cx/retention/risk personas bound to USSFCU). It pins the
 * defects a 2026-09-21 walkthrough found: golden paths that jumped storylines
 * or replayed a signal, a turn whose every chip led back to itself, and typed
 * questions that got no reply because no persona had a __default__.
 */
import { describe, it, expect } from 'vitest';
import type { PersonaManifest, PersonaModule } from '@core/types';
import { nfcuClient } from '@/markets/financial-services/clients/nfcu/client.manifest';
import { ussfcuClient } from '@/markets/financial-services/clients/ussfcu/client.manifest';

type Flow = { suggested_chips?: string[] };
const NEXT_SIGNAL = '__next_signal__';

/**
 * Where each highlighted-chip walk must finish, keyed by persona then start flow.
 * NFCU ends are where the Oral Demo Talk Track v3 ends (see nfcu/talkTrack.test.ts).
 */
const GOLDEN_PATHS: Record<string, Record<string, string>> = {
  nfcu_supervisor: {
    nfcu_sup_greeting: 'nfcu_sup_act_overtime_confirm',
    intraday_t1_greeting: 'intraday_t7_historical',
  },
  nfcu_director: {
    nfcu_dir_greeting: 'nfcu_dir_act_weekly_report',
    intraday_dir_t1_greeting: 'intraday_dir_t7_historical',
  },
  nfcu_analyst: { nfcu_ana_greeting: 'nfcu_ana_weekly_report' },
  nfcu_workforce: { nfcu_wf_greeting: 'nfcu_wf_act_compliance_report' },
  nfcu_member: { nfcu_member_greeting: 'nfcu_member_step6_fix' },
  nfcu_agent: { nfcu_agent_greeting: 'nfcu_agent_step6_execute' },
  nfcu_platform_admin: { nfcu_pa_greeting: 'nfcu_pa_agent_inventory' },
  ussfcu_evelyn: { ussfcu_evelyn_greeting: 'ussfcu_evelyn_turn_evidence' },
  ussfcu_nadia: { ussfcu_nadia_greeting: 'ussfcu_nadia_turn_complaint' },
  ussfcu_cfo: { ussfcu_cfo_greeting: 'ussfcu_cfo_turn_remediation_plan' },
  ussfcu_ceo: { ussfcu_ceo_greeting: 'ussfcu_ceo_turn_full_briefing' },
  ops: { greeting: 'turn_4_actions' },
  cx: { cx_greeting: 'cx_turn_3_intervention' },
  retention: { ret_greeting: 'ret_turn_3_retention_action' },
  risk: { risk_greeting: 'risk_board_summary' },
};

async function load(clientId: string, module: PersonaModule): Promise<PersonaManifest> {
  const mod = (await module.load()) as { default: PersonaManifest | ((c: string) => PersonaManifest) };
  return typeof mod.default === 'function' ? mod.default(clientId) : mod.default;
}

const registrations = [
  ...nfcuClient.personas.map((module) => ({ clientId: 'nfcu', id: module.id, module })),
  ...ussfcuClient.personas.map((module) => ({ clientId: 'ussfcu', id: module.id, module })),
];

describe.each(registrations)('$clientId / $id', ({ clientId, module }) => {
  const get = () => load(clientId, module);

  it('routes every initial chip and every chip a turn offers', async () => {
    const { flows, ui } = await get();
    const chatFlows = flows.chatFlows as Record<string, Flow>;
    const offered: Array<[string, string]> = ui.initialChips.map((c) => ['initialChips', c]);
    for (const [key, flow] of Object.entries(chatFlows))
      for (const chip of flow.suggested_chips ?? []) offered.push([key, chip]);
    for (const [where, chip] of offered) {
      const target = flows.chipToFlowKey[chip];
      expect(target, `"${where}" offers unrouted chip "${chip}"`).toBeDefined();
      if (target !== NEXT_SIGNAL) expect(chatFlows[target], `"${chip}" routes to missing "${target}"`).toBeDefined();
    }
  });

  it('answers unrecognised text with a __default__ whose chips all route', async () => {
    const { flows } = await get();
    const fallback = (flows.chatFlows as Record<string, Flow>).__default__;
    expect(fallback, 'add a __default__ flow').toBeDefined();
    for (const chip of fallback.suggested_chips ?? [])
      expect(flows.chipToFlowKey[chip], `__default__ offers unrouted "${chip}"`).toBeDefined();
  });

  it('never offers a turn whose every chip leads back to itself', async () => {
    const { flows } = await get();
    const stuck = Object.entries(flows.chatFlows as Record<string, Flow>)
      .filter(([, f]) => (f.suggested_chips ?? []).length > 0)
      .filter(([key, f]) => f.suggested_chips!.every((c) => flows.chipToFlowKey[c] === key))
      .map(([key]) => key);
    expect(stuck).toEqual([]);
  });

  it('walks each golden path to its end without looping or replaying a signal', async () => {
    const manifest = await get();
    const { flows, ui } = manifest;
    const ends = GOLDEN_PATHS[manifest.id];
    expect(ends, `add ${manifest.id} to GOLDEN_PATHS`).toBeDefined();
    for (const [start, end] of Object.entries(ends)) {
      const visited: string[] = [];
      let key: string | undefined = start;
      // Mirrors useManifestChat: "Yes, walk me through them" opens the first
      // signal, "Next signal" the one after the last signal visited.
      let signalIndex = 0;
      while (key && visited.length < 40) {
        const rendered: string = flows.resolveFlowKey ? flows.resolveFlowKey(key) : key;
        expect(visited, `loops back to "${rendered}": ${visited.join(' → ')}`).not.toContain(rendered);
        visited.push(rendered);
        const sig = flows.signalSequence.indexOf(rendered);
        if (sig >= 0) signalIndex = sig + 1;
        if (rendered === end) break;
        const chip: string | undefined = ui.goldenPathChip[rendered];
        if (!chip) break;
        const offered = (flows.chatFlows as Record<string, Flow>)[rendered]?.suggested_chips ?? [];
        expect(offered, `"${rendered}" highlights "${chip}" but does not offer it`).toContain(chip);
        if (chip === 'Yes, walk me through them') {
          key = flows.signalSequence[0];
        } else if (chip === 'Next signal' || flows.chipToFlowKey[chip] === NEXT_SIGNAL) {
          // Only a path that is walking the signals may highlight "Next signal":
          // on a chip-driven path the index still points at a signal already
          // covered, so it would replay it instead of advancing.
          key = flows.signalSequence[signalIndex];
          expect(key && !visited.includes(key), `"${rendered}" highlights "Next signal" but no new signal is next`).toBe(true);
        } else {
          key = flows.chipToFlowKey[chip];
        }
      }
      expect(visited.at(-1), `stalled: ${visited.join(' → ')}`).toBe(end);
    }
  });
});
