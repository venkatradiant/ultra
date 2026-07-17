import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send } from 'lucide-react';
import useManifestChat from '@core/engine/useManifestChat';
import { getPersonaFlowConfigs } from '@/data/personaFlowConfigs';
import { ASSISTANT_CONTEXT } from '@/data/nfcu/platform-admin/assistantContext';
import ChatThread from '@/components/chat/ChatThread';
import SuggestedChips from '@/components/chat/SuggestedChips';

/**
 * Bar-local input. Deliberately NOT the shared ChatInput: that component nests a
 * `rounded-[15px]` form inside a `rounded-2xl` (24px) gradient border with 1px
 * padding, so the border balloons to ~8px at each corner — the fat-corner defect.
 * This is a single-radius input (no nested border), so the corners are clean.
 * Suggestions live as chips above the bar, so no type-ahead dropdown is needed.
 */
function AssistantInput({ onSend, disabled, placeholder }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue('');
  };
  return (
    <form
      onSubmit={submit}
      className={`flex items-center gap-3 bg-surface rounded-2xl border px-5 py-3 transition-colors ${
        focused ? 'border-brand/40 shadow-[0_0_0_3px_rgba(0,48,135,0.08)]' : 'border-border shadow-sm'
      }`}
    >
      <Sparkles className={`w-4 h-4 flex-shrink-0 transition-colors ${focused ? 'text-brand/50' : 'text-brand/25'}`} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 text-sm text-text placeholder-gray-500 outline-none bg-transparent disabled:opacity-40"
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        aria-label="Send"
        className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white hover:bg-brand-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer shadow-sm hover:shadow-md"
      >
        <Send className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}

/**
 * Floating "Ask the AI" bar for Daniel (NFCU AI Governance Admin) on his four
 * non-Ask pages. A docked input pinned to the bottom; on submit a panel slides
 * up with the conversation.
 *
 * INDEPENDENCE — the core requirement. This owns its OWN useManifestChat
 * instance, so the conversation lives entirely inside this component and never
 * touches the /ask PersonaWorkspace chat (a separate instance) or the dashboard
 * behind it. "Do not push this conversation into the main page" holds by
 * construction, not by wiring.
 *
 * SCOPE — mounted only for persona nfcu_platform_admin, only on the four routes
 * in ASSISTANT_CONTEXT (gated by AppShell). The parent keys this on pathname so
 * navigation remounts it fresh; open/close is local state, so closing hides the
 * panel without discarding the thread on the same page.
 *
 * Text-only answers by design: no ui_components_to_render on the nfcu_pa_ask_*
 * flows, so the panel never mounts the heavy NVL/mermaid Gen UI in a small box.
 */
export default function PlatformAdminAssistantBar({ route }) {
  const ctx = ASSISTANT_CONTEXT[route];

  // Daniel's flow config drives the bar — same 35 flows as /ask, but a separate
  // hook instance means a separate thread.
  const flows = getPersonaFlowConfigs('nfcu').nfcu_platform_admin;
  const { messages, isTyping, currentChips, handleChipClick } = useManifestChat(flows);

  const [open, setOpen] = useState(false);

  // Close the panel with Escape, matching the sticky widget's affordance.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!ctx) return null;

  // Before any question, offer the page's chips; after, follow the flow's chips.
  const chipsToShow = messages.length === 0 ? ctx.chips : currentChips;

  const ask = (text) => {
    setOpen(true);
    handleChipClick(text);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:left-[260px] z-40 pointer-events-none">
      {/* Conversation panel — slides up above the docked bar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="pointer-events-auto mx-auto max-w-3xl px-4 sm:px-6"
          >
            <div className="bg-surface border border-border-subtle rounded-2xl shadow-[0_-8px_40px_rgba(0,48,135,0.12)] flex flex-col max-h-[min(60vh,460px)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand" />
                  <h3 className="text-sm font-semibold text-text">{ctx.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-text-subtle" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 scrollbar-sleek">
                <ChatThread
                  messages={messages}
                  isTyping={isTyping}
                  chips={[]}
                  onChipClick={ask}
                />
              </div>

              {!isTyping && chipsToShow.length > 0 && (
                <div className="px-4 pt-2 border-t border-border-subtle flex-shrink-0">
                  <SuggestedChips chips={chipsToShow} onChipClick={ask} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Docked input bar — a raised sheet with rounded top corners and a soft
          upward shadow, so it reads as a floating bar rather than a flat slab. */}
      <div className="pointer-events-auto bg-surface border-t border-border-subtle rounded-t-2xl shadow-[0_-8px_40px_rgba(0,48,135,0.08)] px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-3xl">
          {/* Page chips as quick-launch, only before the conversation starts */}
          {!open && messages.length === 0 && (
            <div className="mb-2">
              <SuggestedChips chips={ctx.chips} onChipClick={ask} />
            </div>
          )}
          <AssistantInput onSend={ask} disabled={isTyping} placeholder={ctx.placeholder} />
        </div>
      </div>
    </div>
  );
}
