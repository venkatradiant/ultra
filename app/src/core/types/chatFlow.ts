/**
 * The scripted-conversation contract. Each persona ships a set of flows keyed
 * by `flowKey`; the chat engine walks them deterministically in response to
 * chip clicks / typed queries. This is the heart of the demo runtime.
 */

import type { CapabilityId } from './capability';

/** A UI element the AI attaches to a message (action cards, tables, etc.). */
export interface UiComponentSpec {
  type: string;
  [key: string]: unknown;
}

/** One scripted turn. */
export interface ChatFlow {
  /** The user utterance that leads here (used by the free-text fallback matcher). */
  user_query?: string;
  /** Primary AI response text (either field is used across demos). */
  ai_message?: string;
  ai_response?: string;
  /** Data sources cited under the message. */
  data_sources_used?: string[];
  /** Suggested follow-up chips offered after this turn. */
  suggested_chips?: string[];
  /** Structured UI to render with this message. */
  ui_components_to_render?: UiComponentSpec[];
  confidence?: number;
  capability?: CapabilityId | string;
  /** For action turns: keyed responses after the user confirms an action. */
  post_confirm_response?: Record<string, string>;
  [key: string]: unknown;
}

/** Post-confirm wiring for a single action button. */
export interface ActionConfirmConfig {
  responseKey: string;
  nextChips?: string[];
}

/**
 * The full scripted config for one persona — everything `useChatFlow` needs.
 * (Was the per-persona object inside the monolithic `personaFlowConfigs.js`.)
 */
export interface ChatFlowConfig {
  chatFlows: Record<string, ChatFlow>;
  /** Chip label → flowKey (or the special `__next_signal__` token). */
  chipToFlowKey: Record<string, string>;
  /** Ordered flowKeys that advance the "turn" counter (drives context panel). */
  askTurnSequence: string[];
  /** Ordered flowKeys walked by the "Next signal" progression. */
  signalSequence: string[];
  /** flowKey of the action turn whose confirmations are wired below. */
  actionTurnKey?: string;
  actionConfirmMap?: Record<string, ActionConfirmConfig>;

  // ─── Optional, opt-in hooks. Absent on every persona that does not need
  // them, so the engine behaves exactly as before for those. Added for the
  // Maryland DoIT tenant, whose briefing has to know which of the day's
  // action items the user already finished. ────────────────────────────

  /**
   * Rewrite a flowKey the instant before it is rendered.
   *
   * The chip map and the `greetingFlowKey` are both static, so a persona whose
   * briefing changes as the session progresses cannot express that with data
   * alone. This is the one seam where a manifest can say "when they come back
   * to the briefing, give them the variant that matches what is still open".
   *
   * Must be pure enough to call during a render-adjacent timeout: read a module
   * store, return a flowKey. An unknown key falls back to the original.
   */
  resolveFlowKey?: (flowKey: string) => string;

  /**
   * Fired once the message for `flowKey` has been committed to the thread.
   *
   * Progress tracking belongs here rather than in a card's click handler: every
   * modal's confirm label is ALSO offered as a chip on the same turn, so a user
   * who clicks the chip instead of the dialog would otherwise advance the
   * conversation without ever recording that the work was done.
   */
  onFlowEnter?: (flowKey: string) => void;

  /**
   * Tighten the free-text matching ladder (rungs 3 and 4 of `resolveFlowKey`).
   *
   * The default rungs fail open by design — a short or unfamiliar utterance
   * lands on whatever node happens to share a word with it, which reads as the
   * assistant repeating itself rather than admitting it did not understand.
   * Personas that would rather fall through to `__default__` set this.
   */
  strictMatch?: boolean;
}
