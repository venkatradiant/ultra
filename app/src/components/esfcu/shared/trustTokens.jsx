import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { ACCENT_SOFT, STATE_COLOR } from '../tokens';

/**
 * The trust strip's shared vocabulary — state words, state chrome and the
 * ribbon glyphs.
 *
 * These live apart from DataTrustStrip.jsx so that file exports components and
 * nothing else: mixing constants in breaks Fast Refresh for every persona
 * surface that renders a strip.
 */

/** Spec §13: "status always text plus icon, never color alone". */
export const STATE_WORD = { good: 'Good', warning: 'Attention', critical: 'Critical' };
export const STATE_WORD_CLASS = { good: 'good', warning: 'warn', critical: 'warn' };

export const STATE = {
  good: { label: 'Good', color: STATE_COLOR.good, bg: 'bg-[#00897B]/10', text: 'text-[#00897B]', Icon: CheckCircle2 },
  warning: { label: 'Attention', color: STATE_COLOR.warning, bg: 'bg-[#B45309]/10', text: 'text-[#B45309]', Icon: AlertTriangle },
  critical: { label: 'Critical', color: STATE_COLOR.critical, bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', Icon: AlertTriangle },
};

/** Warm-stroked ribbon glyphs, shared because they are chrome, not content. */
export const RibbonIcons = {
  pipeline: <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT_SOFT} strokeWidth="2"><path d="M5 12l4 4L19 6" /></svg>,
  recon: <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT_SOFT} strokeWidth="2"><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /><path d="M9 7h4a3 3 0 013 3v4" /></svg>,
  audit: <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT_SOFT} strokeWidth="2"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" /></svg>,
  ncua: <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT_SOFT} strokeWidth="2"><path d="M12 3a9 9 0 109 9" /><path d="M12 12l5-3" /></svg>,
  coverage: <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT_SOFT} strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 019 9h-9z" /></svg>,
  sar: <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT_SOFT} strokeWidth="2"><path d="M6 3h9l4 4v14H6z" /><path d="M9 12h7M9 16h5" /></svg>,
};

