/**
 * Every in-chat briefing card Timothy sees has to open Presentation Mode, not
 * just the hero on the home screen. The manifest used to hand the card a no-op
 * handler, so "View Full Briefing" mid-conversation did nothing: the button
 * called the no-op instead of dispatching the persona's overlay event.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import manifest from '@/markets/financial-services/clients/ussfcu/personas/ceo/manifest';

const BRIEFING_TURNS = [
  'ussfcu_ceo_turn_board_briefing',
  'ussfcu_ceo_turn_full_briefing',
  'ussfcu_ceo_export_document',
  'ussfcu_ceo_add_recommendation',
];

describe('USSFCU CEO in-chat "View Full Briefing"', () => {
  afterEach(cleanup);

  it.each(BRIEFING_TURNS)('opens Presentation Mode from %s', (flowKey) => {
    const evt = manifest.features?.overlayOpenEvent;
    expect(evt).toBe('ussfcu-ceo:open-presentation');

    let opened = 0;
    const onOpen = () => { opened += 1; };
    window.addEventListener(evt, onOpen);

    render(<>{manifest.inlineComponents({ flowKey }, manifest.signals)}</>);
    fireEvent.click(screen.getByRole('button', { name: /view full briefing/i }));

    window.removeEventListener(evt, onOpen);
    expect(opened).toBe(1);
  });
});
