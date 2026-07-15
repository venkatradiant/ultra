/**
 * PersonaWorkspace — the GENERIC persona screen. It renders any persona purely
 * from its manifest: identity, UI config, signals, per-turn context panel, and
 * inline components. There are no tenant/persona names in this file — that is
 * the whole point of the North Star architecture.
 *
 * This currently covers the `split` layout (chat + right context panel), which
 * serves the generic ops/cx/retention/risk personas. The `inline`/`full`
 * layouts and the briefing/intraday/presentation features are folded in as
 * their personas migrate (plan Phase 4).
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import useManifestChat from '@core/engine/useManifestChat';
import ChatThread from '../../components/chat/ChatThread';
import ChatInput from '../../components/chat/ChatInput';
import TopInsightsBar from '../../components/chat/TopInsightsBar';
import DataOverviewBar from '../../components/cards/DataOverviewBar';
import ActionCard from '../../components/cards/ActionCard';
import CapabilityCalloutModal from '../../components/modals/CapabilityCalloutModal';
import { useIntraday } from '../../context/IntradayContext';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function PersonaWorkspace({ manifest }) {
  const { identity, ui, signals, contextPanel, inlineComponents, flows, features, briefing } = manifest;
  const StatsComponent = manifest.statsComponent || DataOverviewBar;
  const SignalsComponent = manifest.signalsComponent || TopInsightsBar;
  const InitialExtras = manifest.initialExtras || null;
  const OverlayComponent = manifest.overlayComponent || null;
  const BriefingPanel = briefing?.panelComponent || null;
  const RootCauseTree = briefing?.rootCauseComponent || null;

  // Always within IntradayProvider (AppShell); intraday wiring is a no-op unless
  // the persona declares a `briefing`.
  const intraday = useIntraday();

  const {
    messages,
    isTyping,
    currentChips,
    currentTurn,
    currentFlowKey,
    handleChipClick,
    handleActionConfirm,
    initializeFlow,
  } = useManifestChat(flows);

  const [confirmedActions, setConfirmedActions] = useState(new Set());
  const [capabilityModal, setCapabilityModal] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const initializedPersona = useRef(null);

  // Persona-declared overlay (e.g. CEO Presentation Mode) opens on a window event
  // dispatched by inline cards; reset when switching away from this persona.
  useEffect(() => {
    const evt = features?.overlayOpenEvent;
    if (!evt || !OverlayComponent) return undefined;
    const open = () => setOverlayOpen(true);
    window.addEventListener(evt, open);
    return () => window.removeEventListener(evt, open);
  }, [features?.overlayOpenEvent, OverlayComponent]);

  // (Re)seed the conversation whenever the active persona changes.
  useEffect(() => {
    if (initializedPersona.current === manifest.id) return;
    initializedPersona.current = manifest.id;
    setConfirmedActions(new Set());
    initializeFlow(ui.greetingFlowKey);
  }, [manifest.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Intraday briefing wiring (NFCU supervisor/director) ──────────
  // Set the default tier + honor ?intraday=1 on entry.
  useEffect(() => {
    if (!briefing) {
      intraday.setIntradayMode(false);
      return;
    }
    intraday.setTier(briefing.tiers[0]);
    const params = new URLSearchParams(window.location.search);
    if (params.get('intraday') === '1') intraday.setIntradayMode(true);
  }, [manifest.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync the dashboard snapshot to the current intraday turn.
  useEffect(() => {
    if (!briefing || !currentFlowKey || !currentFlowKey.startsWith('intraday_')) return;
    const snap = briefing.baseline.per_step_snapshots?.[currentFlowKey];
    if (snap) intraday.setSnapshot(snap);
  }, [currentFlowKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tell the Sticky Intelligence Widget when the welcome briefing is on screen.
  const isInitialViewNow = messages.length <= 1 && !isTyping;
  useEffect(() => {
    if (!briefing) return undefined;
    intraday.setBriefingActive(isInitialViewNow);
    return () => intraday.setBriefingActive(false);
  }, [isInitialViewNow, briefing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bridge the Sticky Intelligence Widget's "ask about this metric" to the chat.
  useEffect(() => {
    if (!briefing) return undefined;
    intraday.registerAskHandler((chipText) => { if (chipText) handleChipClick(chipText); });
    const pending = intraday.consumePendingChip?.();
    if (pending) handleChipClick(pending);
    return () => intraday.registerAskHandler(null);
  }, [briefing, intraday.registerAskHandler]); // eslint-disable-line react-hooks/exhaustive-deps

  const getCapabilityForMessage = (msg) => {
    if (msg.role !== 'ai' || !msg.flowKey) return undefined;
    const trigger = ui.flowKeyToCapabilityTrigger[msg.flowKey];
    if (!trigger) return undefined;
    return ui.capabilityCallouts.find((c) => c.trigger === trigger) || undefined;
  };

  const handleConfirmAction = (actionId) => {
    setConfirmedActions((prev) => new Set([...prev, actionId]));
    handleActionConfirm(actionId);
  };

  const renderInlineComponents = (msg) => {
    if (msg.role !== 'ai' || !msg.flowKey) return undefined;
    const out = [];

    // Inline-layout personas have no right context panel, so their recommended
    // actions compose into the chat thread at the action turn.
    if (manifest.layout === 'inline' && msg.flowKey === flows.actionTurnKey) {
      const actions = flows.chatFlows[flows.actionTurnKey]?.ui_components_to_render?.[0]?.actions || [];
      if (actions.length) {
        out.push(
          <div key="actions-inline" className="mt-3 space-y-3">
            <h4 className="text-sm font-semibold text-text">Recommended Actions</h4>
            {actions.map((action) => (
              <ActionCard key={action.id} action={action} onConfirm={handleConfirmAction} isConfirmed={confirmedActions.has(action.id)} />
            ))}
          </div>,
        );
      }
    }

    // Root-cause correlation tree — rendered alongside the AI message that owns a
    // root-cause flow, using that step's snapshot highlight.
    if (briefing && RootCauseTree && briefing.rootCauseFlowKeys?.includes(msg.flowKey) && briefing.baseline.root_cause_tree) {
      const snap = briefing.baseline.per_step_snapshots?.[msg.flowKey];
      out.push(
        <div key="root-cause-inline" className="mt-3 rounded-xl border border-border bg-gradient-to-b from-[#F8F9FB] to-white p-4">
          <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-3">Root-Cause Correlation</h4>
          <RootCauseTree tree={briefing.baseline.root_cause_tree} highlight={snap?.treeHighlight || []} />
        </div>,
      );
    }

    if (inlineComponents) {
      const produced = inlineComponents(msg, signals);
      if (produced?.length) out.push(...produced);
    }
    return out.length ? out : undefined;
  };

  const renderContextPanel = () => {
    if (!contextPanel) return null;
    const turns = Object.keys(contextPanel).map(Number);
    const maxTurn = Math.max(...turns);
    let Component = null;
    for (const [turnStr, comp] of Object.entries(contextPanel)) {
      const turn = Number(turnStr);
      if (currentTurn >= turn && (currentTurn < turn + 1 || turn === maxTurn)) Component = comp;
    }
    if (!Component) return null;

    if (Component === 'actions') {
      const actionsFlow = flows.chatFlows[flows.actionTurnKey];
      const actions = actionsFlow?.ui_components_to_render?.[0]?.actions || [];
      return (
        <motion.div key="actions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-3">
          <h3 className="text-sm font-semibold text-text mb-3">Recommended Actions</h3>
          {actions.map((action) => (
            <ActionCard key={action.id} action={action} onConfirm={handleConfirmAction} isConfirmed={confirmedActions.has(action.id)} />
          ))}
        </motion.div>
      );
    }

    return (
      <motion.div key={`turn${currentTurn}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <Component />
      </motion.div>
    );
  };

  const contextContent = renderContextPanel();
  const hasContextPanel = contextContent !== null;
  const chipsToShow = messages.length === 0 ? ui.initialChips : currentChips;
  const recommendedChip = currentFlowKey
    ? ui.goldenPathChip[currentFlowKey] || null
    : ui.goldenPathChip[ui.greetingFlowKey];
  const isInitialView = messages.length <= 1 && !isTyping;

  return (
    <div className="flex-1 flex h-full min-w-0">
      <div
        className={`flex flex-col overflow-hidden h-full min-h-0 min-w-0 w-full ${hasContextPanel ? 'lg:w-[60%] lg:border-r border-gray-200/60' : ''}`}
      >
        <div
          className={`flex-1 overflow-y-auto scrollbar-sleek ${
            isInitialView
              ? // Personas with tall initial content (briefing dashboards, top-aligned
                // executives) always top-align so the greeting is never centered off
                // the top of the scroll area. Everyone else top-aligns on mobile (short
                // viewports crop centered content) and centers only on desktop.
                briefing || features?.topAlignedInitial
                ? 'flex flex-col justify-start pt-2'
                : 'flex flex-col justify-start lg:justify-center'
              : ''
          }`}
          style={{
            background: isInitialView
              ? 'linear-gradient(180deg, color-mix(in srgb, var(--color-brand) 3%, var(--color-surface)) 0%, color-mix(in srgb, var(--color-brand) 1%, var(--color-surface)) 40%, var(--color-surface) 100%)'
              : 'var(--color-surface)',
          }}
        >
          <div className={`w-full min-w-0 ${!hasContextPanel ? 'max-w-3xl mx-auto' : ''} px-4 sm:px-6`}>
            <AnimatePresence>
              {isInitialView && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }} transition={{ duration: 0.4 }} className="pt-4 pb-4">
                  <h2 className="text-xl font-bold text-text tracking-tight">
                    {getTimeGreeting()}, <span className="text-brand">{identity.greeting}</span>
                  </h2>
                  <p className="text-[13px] text-text-muted mt-1 leading-relaxed">
                    Your AI intelligence brief is ready. Here's what needs your attention today.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {briefing && BriefingPanel ? (
              /* Briefing personas (NFCU supervisor/director) replace the signals +
                 stats row with a single briefing panel in the initial view. */
              <AnimatePresence>
                {isInitialView && (
                  <motion.div key="briefing-panel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }} transition={{ duration: 0.35, ease: 'easeOut' }} className="mb-4">
                    <BriefingPanel baseline={briefing.baseline} intradayTiers={briefing.tiers} onSignalClick={handleChipClick} signalToChip={ui.signalToChip} />
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <>
                <SignalsComponent
                  signals={signals}
                  onInsightClick={handleChipClick}
                  onSignalClick={handleChipClick}
                  onViewFullBriefing={() => setOverlayOpen(true)}
                  visible={isInitialView}
                  signalToChip={ui.signalToChip}
                />
                <StatsComponent visible={isInitialView} onStatClick={handleChipClick} stats={ui.stats} />

                {InitialExtras && isInitialView && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }} transition={{ duration: 0.3 }} className="mb-3">
                      <InitialExtras />
                    </motion.div>
                  </AnimatePresence>
                )}
              </>
            )}

            <AnimatePresence>
              {isInitialView && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                  <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-2 border border-border-subtle">
                    <Sparkles className="w-3 h-3 text-brand/50" />
                    <span className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider">AI Conversation</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </motion.div>
              )}
            </AnimatePresence>

            <ChatThread
              messages={messages}
              isTyping={isTyping}
              chips={[]}
              onChipClick={handleChipClick}
              renderInlineComponents={renderInlineComponents}
              getCapability={getCapabilityForMessage}
              onCapabilityClick={setCapabilityModal}
            />
          </div>
        </div>

        <div className="relative bg-surface">
          <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
          <div className={`w-full min-w-0 ${!hasContextPanel ? 'max-w-3xl mx-auto' : ''} px-4 sm:px-6 pb-4 pt-2`}>
            {!isTyping && chipsToShow.length > 0 && (
              <div className="mb-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {chipsToShow.map((chip, idx) => {
                    const isRecommended = chip === recommendedChip;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleChipClick(chip)}
                        className={`group relative px-3.5 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200 cursor-pointer ${
                          isRecommended
                            ? 'bg-brand text-white border-brand hover:bg-brand-hover shadow-[0_2px_8px_rgba(0,48,135,0.3)]'
                            : 'border-border text-text-muted bg-surface hover:bg-surface-2 hover:border-brand/30 hover:text-brand shadow-sm hover:shadow'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {isRecommended && <ArrowRight className="w-3 h-3" />}
                          {chip}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <ChatInput
              onSend={handleChipClick}
              disabled={isTyping}
              suggestions={chipsToShow}
              placeholder="Ask anything about your members, signals, or operations…"
            />
          </div>
        </div>
      </div>

      {/* Right context panel — desktop only (secondary visuals). On mobile the
          chat is full-width; per-turn charts that matter also render inline. */}
      <AnimatePresence>
        {hasContextPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block w-[40%] flex-shrink-0 overflow-y-auto scrollbar-sleek p-5 bg-gradient-to-b from-[#F8F9FB] to-[#F0F2F5]"
          >
            <AnimatePresence mode="wait">{contextContent}</AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <CapabilityCalloutModal
        isOpen={!!capabilityModal}
        onClose={() => setCapabilityModal(null)}
        capability={capabilityModal}
        callouts={ui.capabilityCallouts}
      />

      {OverlayComponent && overlayOpen ? <OverlayComponent onClose={() => setOverlayOpen(false)} /> : null}
    </div>
  );
}
