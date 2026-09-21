/**
 * USSFCU — the Oral Demo Talk Track v3, applied to the shared personas.
 *
 * Maya, Priya K., Derek T. and James are the generic ops/cx/retention/risk
 * personas, shared with PenFed and the Financial Services client. USSFCU's talk
 * track walks each of them through their signals ("Yes, walk me through them",
 * "Next signal" twice, then the action), which is not the storyline the shared
 * manifests highlight. So the talk track is applied here, on the USSFCU
 * registration only: the shared manifests and flow files are not touched, and
 * the other tenants keep their own golden paths.
 *
 * The talk track is the source of truth. Each goldenPathChip value is the chip
 * it says to click on that turn, and the path ends where the talk track ends.
 */
import type { PersonaManifest, PersonaModule } from '@core/types';

interface TalkTrackOverride {
  /** Replaces the shared manifest's golden path. */
  goldenPathChip: Record<string, string>;
  /** flowKey → fields merged over that shared flow, for USSFCU only. */
  chatFlowPatches?: Record<string, Record<string, unknown>>;
}

export const USSFCU_TALK_TRACK: Record<'ops' | 'cx' | 'retention' | 'risk', TalkTrackOverride> = {
  // Part 2, Persona 1 — Maya J.
  ops: {
    goldenPathChip: {
      greeting: 'Yes, walk me through them',
      signal_1_mortgage: 'Next signal',
      signal_2_auto_loan: 'Next signal',
      signal_3_cd_complaint: "I'm ready to act",
    },
    // The third action card is the anomaly scan, and the talk track says so;
    // the shared text still described a friction brief.
    chatFlowPatches: {
      turn_4_actions: {
        ai_response:
          "Based on everything we've covered, here are three actions I can execute right now. I'll confirm each one before I proceed:\n\n[1] Create a JIRA ticket — 'Mortgage Step 4 UiPath Exception' — assigned to Data Engineering.\n[2] Schedule a 45-minute friction review with your team with agenda drafted from today's signals.\n[3] Run a cross-system anomaly scan across transactions, the contact center, and workflows.",
      },
    },
  },
  // Part 2, Persona 2 — Priya K.
  cx: {
    goldenPathChip: {
      cx_greeting: 'Yes, walk me through them',
      cx_signal_1_channel_switch: 'Next signal',
      cx_signal_2_journey_abandon: 'Next signal',
      cx_signal_3_ivr_escalation: 'What intervention is needed?',
    },
  },
  // Part 2, Persona 3 — Derek T.
  retention: {
    goldenPathChip: {
      ret_greeting: 'Yes, walk me through them',
      ret_signal_1_churn_surge: 'Next signal',
      ret_signal_2_engagement_decay: 'Next signal',
      ret_signal_3_retiree_disengage: 'Model the retention impact',
    },
  },
  // Part 1 — James R.
  risk: {
    goldenPathChip: {
      risk_greeting: 'Yes, walk me through them',
      risk_signal_1_structuring: 'Next signal',
      risk_signal_2_wire_anomaly: 'Next signal',
      risk_signal_3_ncua_decline: 'Show me our regulatory exposure',
      risk_turn_2_regulatory: 'Generate a board-level risk summary',
    },
  },
};

/** Wraps a shared persona so its USSFCU registration follows the talk track. */
export function withTalkTrack(module: PersonaModule, override: TalkTrackOverride): PersonaModule {
  return {
    ...module,
    load: async () => {
      const { default: manifest } = await module.load();
      const patches = override.chatFlowPatches ?? {};
      // New objects all the way down: the shared flow data is imported by the
      // other tenants too, and must not change underneath them.
      const chatFlows = { ...manifest.flows.chatFlows };
      for (const [key, patch] of Object.entries(patches)) {
        chatFlows[key] = { ...chatFlows[key], ...patch } as (typeof chatFlows)[string];
      }
      const patched: PersonaManifest = {
        ...manifest,
        flows: { ...manifest.flows, chatFlows },
        ui: { ...manifest.ui, goldenPathChip: override.goldenPathChip },
      };
      return { default: patched };
    },
  };
}
