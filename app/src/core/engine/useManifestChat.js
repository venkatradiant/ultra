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

import { useState, useCallback, useRef } from 'react';
import { resolveFlowKey, resolveNextSignal, NEXT_SIGNAL_TOKEN } from './chatFlowEngine';

let msgIdCounter = 0;
const nextId = () => `msg-${++msgIdCounter}`;

export default function useManifestChat(flowConfig) {
  const {
    chatFlows,
    askTurnSequence,
    signalSequence,
    actionTurnKey,
    actionConfirmMap = {},
  } = flowConfig;

  const [messages, setMessages] = useState([]);
  const [currentFlowKey, setCurrentFlowKey] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentChips, setCurrentChips] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [contextPanelData, setContextPanelData] = useState(null);
  const signalIndexRef = useRef(0);
  const generationRef = useRef(0);

  const addAIMessage = useCallback((flowKey) => {
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
    }, delay);
  }, [chatFlows, askTurnSequence]);

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
  };
}
