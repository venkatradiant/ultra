/**
 * useManifestChat — React binding over the pure chatFlowEngine, driven directly
 * by a persona manifest's ChatFlowConfig.
 *
 * This is the manifest-native successor to the legacy `useChatFlow` hook: same
 * observable behavior (typing delays, chip → turn advancement, signal
 * progression, action confirmation), but the flow config comes from the persona
 * module rather than the monolithic `personaFlowConfigs.js`, and the matching
 * ladder is the shared, unit-tested engine. Legacy `useChatFlow` is retired in
 * Phase 5 once every persona is manifest-driven.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { resolveFlowKey, resolveNextSignal, NEXT_SIGNAL_TOKEN } from './chatFlowEngine';
import { useConversationSession } from '../../context/ConversationSessionContext';

let msgIdCounter = 0;
const nextId = () => `msg-${++msgIdCounter}`;

/**
 * @param flowConfig  the persona manifest's ChatFlowConfig
 * @param persistKey  when set, the thread is stashed above the router on unmount
 *                    and restored on the next mount, so navigating away and back
 *                    lands on the turn the user left rather than the greeting.
 *                    Null for every persona that has not opted in, and the whole
 *                    mechanism is then inert.
 */
export default function useManifestChat(flowConfig, persistKey = null) {
  const {
    chatFlows,
    askTurnSequence,
    signalSequence,
    actionTurnKey,
    actionConfirmMap = {},
    resolveFlowKey: resolveDynamicKey,
    onFlowEnter,
  } = flowConfig;

  const session = useConversationSession();
  // Read once, at mount, via a lazy initializer. A snapshot that arrived later
  // would fight whatever the user has done since, so the stash is consulted
  // exactly here and never again.
  const [restored] = useState(() => session.load(persistKey));

  const [messages, setMessages] = useState(() => restored?.messages ?? []);
  const [currentFlowKey, setCurrentFlowKey] = useState(() => restored?.currentFlowKey ?? null);
  // Never restored as `true`: the timeout that would have landed that message
  // died with the previous mount, so a restored "typing" indicator would spin
  // for ever. A thread is always handed back settled.
  const [isTyping, setIsTyping] = useState(false);
  const [currentChips, setCurrentChips] = useState(() => restored?.currentChips ?? []);
  const [currentTurn, setCurrentTurn] = useState(() => restored?.currentTurn ?? 0);
  const [contextPanelData, setContextPanelData] = useState(() => restored?.contextPanelData ?? null);
  const signalIndexRef = useRef(restored?.signalIndex ?? 0);
  const generationRef = useRef(0);

  const addAIMessage = useCallback((requestedKey) => {
    // A persona may swap the key for a variant that reflects what the user has
    // already done this session (DoIT's briefing does exactly this). An unknown
    // return value is ignored rather than trusted, so a typo cannot blank the
    // thread.
    const rewritten = resolveDynamicKey?.(requestedKey);
    const flowKey = rewritten && chatFlows[rewritten] ? rewritten : requestedKey;
    const flow = chatFlows[flowKey];
    if (!flow) return;

    const text = flow.ai_message || flow.ai_response || '';
    const sources = flow.data_sources_used || [];
    const chips = flow.suggested_chips || [];
    const uiComponents = flow.ui_components_to_render || [];

    setIsTyping(true);
    setCurrentChips([]);

    const delay = 1500 + Math.random() * 1000;
    const gen = generationRef.current;

    setTimeout(() => {
      if (gen !== generationRef.current) return;
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'ai',
          text,
          sources,
          flowKey,
          uiComponents,
          confidence: flow.confidence,
          capability: flow.capability,
        },
      ]);
      setCurrentChips(chips);
      setCurrentFlowKey(flowKey);
      if (uiComponents.length > 0) setContextPanelData({ flowKey, components: uiComponents });

      const turnIdx = askTurnSequence.indexOf(flowKey);
      if (turnIdx >= 0) setCurrentTurn(turnIdx + 1);

      // After the message lands, not before: a persona uses this to record that
      // an action item is finished, and the briefing it feeds must describe the
      // turn the user can actually see.
      onFlowEnter?.(flowKey);
    }, delay);
  }, [chatFlows, askTurnSequence, resolveDynamicKey, onFlowEnter]);

  const advanceSignal = useCallback(() => {
    const nextKey = resolveNextSignal(flowConfig, signalIndexRef.current);
    if (nextKey) {
      signalIndexRef.current += 1;
      addAIMessage(nextKey);
    }
  }, [flowConfig, addAIMessage]);

  const handleChipClick = useCallback((chipText) => {
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: chipText }]);
    setCurrentChips([]);

    // Explicit signal-walkthrough affordances.
    if (chipText === 'Next signal' || chipText === 'Yes, walk me through them') {
      if (chipText === 'Yes, walk me through them') signalIndexRef.current = 0;
      advanceSignal();
      return;
    }

    const { flowKey } = resolveFlowKey(flowConfig, chipText);
    if (flowKey === NEXT_SIGNAL_TOKEN) {
      advanceSignal();
      return;
    }
    if (flowKey) {
      const sigIdx = signalSequence.indexOf(flowKey);
      if (sigIdx >= 0) signalIndexRef.current = sigIdx + 1;
      addAIMessage(flowKey);
      return;
    }

    // No match and no __default__ — mirror legacy silent-guard behavior.
    console.warn(`[ConversationGuard] No flow mapped for chip "${chipText}" — response blocked.`);
  }, [flowConfig, signalSequence, addAIMessage, advanceSignal]);

  const handleActionConfirm = useCallback((actionId) => {
    const flow = chatFlows[actionTurnKey];
    if (!flow?.post_confirm_response) return;
    const confirmConfig = actionConfirmMap[actionId];
    if (!confirmConfig) return;

    const responseText = flow.post_confirm_response[confirmConfig.responseKey] || '';
    const nextChips = confirmConfig.nextChips || [];
    const actions = flow.ui_components_to_render?.find((c) => c.type === 'action_cards')?.actions || [];
    const actionConfidence = actions.find((a) => a.id === actionId)?.confidence;

    setIsTyping(true);
    setCurrentChips([]);
    const gen = generationRef.current;
    setTimeout(() => {
      if (gen !== generationRef.current) return;
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'ai',
          text: responseText,
          sources: ['Salesforce AgentForce'],
          flowKey: `action_confirm_${actionId}`,
          uiComponents: [],
          confidence: actionConfidence,
        },
      ]);
      setCurrentChips(nextChips);
    }, 1500);
  }, [chatFlows, actionTurnKey, actionConfirmMap]);

  const initializeFlow = useCallback((flowKey) => {
    generationRef.current += 1;
    setMessages([]);
    setCurrentChips([]);
    setCurrentTurn(0);
    setCurrentFlowKey(null);
    setContextPanelData(null);
    setIsTyping(false);
    signalIndexRef.current = 0;
    addAIMessage(flowKey);
  }, [addAIMessage]);

  // The stash write. Mirroring into a ref and saving from an unmount cleanup is
  // what lets this run once per navigation instead of on every keystroke of the
  // conversation — and the cleanup still sees the latest values, which a
  // dependency-listed effect closing over state would not.
  const latest = useRef(null);
  // Mirrored from an effect with no dependency list — it runs after every commit,
  // so the ref always holds what was last rendered, and nothing touches a ref
  // during render.
  useEffect(() => {
    latest.current = {
      messages, currentFlowKey, currentChips, currentTurn, contextPanelData,
      signalIndex: signalIndexRef.current,
    };
  });
  useEffect(() => {
    if (!persistKey) return undefined;
    return () => {
      // An untouched thread is not worth stashing: restoring "nothing" would
      // suppress the greeting and leave the workspace blank.
      if (!latest.current?.messages?.length) return;
      session.save(persistKey, latest.current);
    };
  }, [persistKey, session]);

  /** Drop the stash — for an explicit reset, where re-greeting is the point. */
  const clearPersisted = useCallback(() => {
    session.clear(persistKey);
  }, [session, persistKey]);

  return {
    messages,
    isTyping,
    currentChips,
    currentFlowKey,
    currentTurn,
    contextPanelData,
    handleChipClick,
    handleActionConfirm,
    addAIMessage,
    initializeFlow,
    // Tells the workspace not to re-greet over a thread that was just handed
    // back to it.
    restored: Boolean(restored),
    clearPersisted,
  };
}
