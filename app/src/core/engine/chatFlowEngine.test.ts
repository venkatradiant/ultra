import { describe, it, expect } from 'vitest';
import { resolveFlowKey, resolveNextSignal, NEXT_SIGNAL_TOKEN } from './chatFlowEngine';
import type { ChatFlowConfig } from '../types';

const config: ChatFlowConfig = {
  chatFlows: {
    turn_1: { user_query: "What's driving the mortgage drop-off?", ai_message: 'Mortgage funnel analysis…' },
    turn_2: { user_query: 'Who are these members?', ai_message: 'Segment breakdown…' },
    sig_1: { ai_message: 'Signal one' },
    sig_2: { ai_message: 'Signal two' },
    __default__: { ai_message: 'Here is what I can help with' },
  },
  chipToFlowKey: {
    'Who are these members?': 'turn_2',
    'Next signal': NEXT_SIGNAL_TOKEN,
  },
  askTurnSequence: ['turn_1', 'turn_2'],
  signalSequence: ['sig_1', 'sig_2'],
};

describe('resolveFlowKey', () => {
  it('resolves an explicit chip map', () => {
    expect(resolveFlowKey(config, 'Who are these members?')).toEqual({ flowKey: 'turn_2', isSignal: false });
  });

  it('passes through the next-signal token', () => {
    expect(resolveFlowKey(config, 'Next signal')).toEqual({ flowKey: NEXT_SIGNAL_TOKEN, isSignal: true });
  });

  it('matches an exact user_query not in the chip map', () => {
    expect(resolveFlowKey(config, "What's driving the mortgage drop-off?").flowKey).toBe('turn_1');
  });

  it('substring-matches a partial query', () => {
    expect(resolveFlowKey(config, 'mortgage drop-off').flowKey).toBe('turn_1');
  });

  it('keyword-scores free-form text', () => {
    expect(resolveFlowKey(config, 'tell me about member segments').flowKey).toBe('turn_2');
  });

  it('flags a signal-sequence match', () => {
    expect(resolveFlowKey(config, 'Signal one')).toEqual({ flowKey: 'sig_1', isSignal: true });
  });

  it('falls back to __default__ for unmatched input', () => {
    expect(resolveFlowKey(config, 'zxcvbnm qwerty').flowKey).toBe('__default__');
  });

  it('returns null when nothing matches and no default exists', () => {
    const noDefault: ChatFlowConfig = { ...config, chatFlows: { turn_1: config.chatFlows.turn_1 } };
    expect(resolveFlowKey(noDefault, 'zxcvbnm qwerty').flowKey).toBeNull();
  });
});

describe('resolveNextSignal', () => {
  it('returns the signal at the index, then null past the end', () => {
    expect(resolveNextSignal(config, 0)).toBe('sig_1');
    expect(resolveNextSignal(config, 1)).toBe('sig_2');
    expect(resolveNextSignal(config, 2)).toBeNull();
  });
});
