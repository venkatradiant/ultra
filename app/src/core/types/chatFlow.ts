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
}
