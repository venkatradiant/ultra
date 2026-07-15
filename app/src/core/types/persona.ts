/**
 * PersonaManifest — the single source of truth for one persona's demo
 * experience. Everything the old god-screen decided with `if (personaId === …)`
 * is declared here and co-located with the persona's module.
 */

import type { ComponentType, ReactNode } from 'react';
import type { CapabilityId } from './capability';
import type { ChatFlowConfig, ChatFlow } from './chatFlow';
import type { Signal } from './signal';
import type { DataSource } from './dataSource';

/** How the persona's workspace lays out (replaces the INLINE_ONLY_PERSONAS set). */
export type PersonaLayout = 'split' | 'inline' | 'full';

/** Nav slots whose labels a persona/client may relabel. */
export type NavKey = 'ask' | 'journey' | 'risk' | 'governance' | 'dataSources';

export interface PersonaIdentity {
  name: string;
  initials: string;
  role: string;
  greeting: string;
}

export interface PersonaFeatures {
  /** Owns the Sticky Intelligence briefing panel (was PERSONAS_WITH_BRIEFING_PANEL). */
  briefingPanel?: boolean;
  /** Intraday baseline dataset key (was intradayBaselineByPersona). */
  intradayBaseline?: unknown;
  /** Top-align the initial (briefing) view instead of vertically centering it. */
  topAlignedInitial?: boolean;
  /** window event name that opens the persona's overlay (e.g. Presentation Mode). */
  overlayOpenEvent?: string;
  /**
   * "Ask the AI"-only persona (e.g. member self-service, agent-assist): the ops
   * nav pages don't apply, so the sidebar shows only Ask the AI + Data Sources.
   */
  focusedNav?: boolean;
  /**
   * Explicit ordered allow-list of sidebar nav slots for this persona (e.g. the
   * Platform Admin shows only Ask · Governance · Data Sources). When set, the
   * sidebar builds nav from exactly these keys; overrides the default slot set
   * and `focusedNav`. Labels still resolve via navLabels/client defaults.
   */
  navSlots?: NavKey[];
  /**
   * Render the AI-message capability tags as static, non-clickable info pills
   * instead of buttons that open the architecture deep-dive modal (e.g. the NFCU
   * Platform Admin's governance capabilities, which have no bespoke diagram).
   */
  staticCapabilityBadges?: boolean;
}

/** A KPI tile shown in the persona's data-overview row. */
export interface StatTile {
  id: string;
  label: string;
  value: string;
  trend?: string;
  positive?: boolean;
  /** lucide-react icon component. */
  icon?: ComponentType<Record<string, unknown>>;
  iconColor?: string;
  iconBg?: string;
  /** Chip dispatched when the tile is clicked (null = not clickable). */
  chipText?: string | null;
}

/**
 * Presentation/UI configuration for a persona's workspace. (Was the per-persona
 * object in the monolithic `personaUIConfig.js`.)
 */
export interface PersonaUiConfig {
  /** flowKey used to seed the conversation on entry. */
  greetingFlowKey: string;
  /** Chips offered on the initial (greeting) view. */
  initialChips: string[];
  /** flowKey → the "recommended" chip highlighted next (golden path). */
  goldenPathChip: Record<string, string>;
  /** flowKey → capability-callout trigger id. */
  flowKeyToCapabilityTrigger: Record<string, string>;
  /** KPI tiles for the data-overview row. */
  stats: StatTile[];
  /** signal id → chip dispatched when that signal insight is clicked. */
  signalToChip: Record<string, string>;
  /** Capability-callout definitions (opened from AI-message capability chips). */
  capabilityCallouts: Array<{ trigger?: string; [key: string]: unknown }>;
}

/** Maps a conversation turn number → the right-rail component (or 'actions'). */
export type ContextPanelMap = Record<number, ComponentType<Record<string, unknown>> | 'actions'>;

/** Produces inline components rendered within an AI message, per flow. */
export type InlineComponentFactory = (
  msg: { flowKey?: string; uiComponents?: unknown[]; [key: string]: unknown },
  signals: Signal[],
) => ReactNode[] | undefined;

export interface PersonaManifest {
  id: string;
  clientId: string;
  marketId: string;

  identity: PersonaIdentity;
  capabilities: CapabilityId[];

  // ─── data ───────────────────────────────────────────────
  flows: ChatFlowConfig;
  signals: Signal[];
  dataSources: DataSource[];

  // ─── presentation ───────────────────────────────────────
  layout: PersonaLayout;
  ui: PersonaUiConfig;
  features?: PersonaFeatures;
  navLabels?: Partial<Record<NavKey, string>>;

  // ─── the localized switchboard (was the giant registries) ──
  contextPanel?: ContextPanelMap;
  inlineComponents?: InlineComponentFactory;
  /**
   * Optional override for the KPI/stats row (e.g. PenFed capmarkets' 8-up
   * carousel). Receives `{ stats, visible, onStatClick }`. Kept in the persona's
   * own module so it code-splits; defaults to the standard DataOverviewBar.
   */
  statsComponent?: ComponentType<Record<string, unknown>>;
  /**
   * Optional override for the initial-view signals bar (e.g. USSFCU CEO's
   * CeoHomeSignals). Receives signals/visible/signalToChip + click + a
   * `onViewFullBriefing` handler that opens the overlay. Defaults to TopInsightsBar.
   */
  signalsComponent?: ComponentType<Record<string, unknown>>;
  /**
   * Optional extra component rendered in the initial (briefing) view beneath the
   * stats row — e.g. the USSFCU CEO Data Trust Strip. Receives no props.
   */
  initialExtras?: ComponentType<Record<string, unknown>>;
  /**
   * Optional full-screen overlay (e.g. USSFCU CEO Presentation Mode). Opened by
   * `features.overlayOpenEvent` (a window event) and rendered with `{ onClose }`.
   */
  overlayComponent?: ComponentType<{ onClose: () => void }>;

  /**
   * Intraday-briefing personas (NFCU supervisor/director). When present, the
   * initial view renders the briefing panel (instead of signals + stats) and the
   * workspace wires the live intraday dashboard: tier selection, per-turn snapshot
   * syncing, briefing-active coordination with the Sticky Intelligence Widget, and
   * an inline root-cause tree. All components/data live in the persona's module.
   */
  briefing?: {
    /** The intraday baseline dataset (per_step_snapshots, root_cause_tree, …). */
    baseline: { per_step_snapshots?: Record<string, { treeHighlight?: string[] }>; root_cause_tree?: unknown; [k: string]: unknown };
    /** Tier chips shown in the briefing panel (first is the default). */
    tiers: string[];
    /** The briefing panel component (e.g. BriefingPanel). */
    panelComponent: ComponentType<Record<string, unknown>>;
    /** flowKeys that render the root-cause tree inline. */
    rootCauseFlowKeys?: string[];
    /** The root-cause tree component (e.g. RootCauseTree). */
    rootCauseComponent?: ComponentType<Record<string, unknown>>;
  };
}

/**
 * A lazily-loaded persona module. The registry stores the loader; the runtime
 * imports it only when the persona becomes active → per-tenant code-splitting.
 */
export interface PersonaModule {
  id: string;
  identity: PersonaIdentity;
  load: () => Promise<{ default: PersonaManifest }>;
}

export type { ChatFlow };
