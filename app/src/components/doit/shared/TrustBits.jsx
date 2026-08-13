import { ShieldCheck, Info, CheckCircle2, AlertTriangle, FileLock2 } from 'lucide-react';
import { tierFor, colorFor, bgFor, borderFor, labelFor } from '../../../utils/confidence';

/**
 * The trust affordances VOCE carries on every consequential card: a confidence
 * score, a Verified/Reference provenance pair, a status chip, a governance
 * footer, and an accessibility-standards line.
 *
 * These are static scores, not model output — the point they make is that every
 * consequential action carries a number, a citation and a human gate. Colours
 * come from Ultra's confidence helpers so they follow the tenant's own
 * confHigh/confMed/confLow tokens rather than hardcoded greens.
 */

export function ConfidenceBadge({ score, note }) {
  const tier = tierFor(score);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
      style={{ color: colorFor(tier), background: bgFor(tier), borderColor: borderFor(tier) }}
      title={note || `${labelFor(tier)} confidence`}
    >
      <span aria-hidden="true">◉</span>
      AI Confidence: {score}%
    </span>
  );
}

/** Green ✓ Verified — a clarification that matched a governed source. */
export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10.5px] font-semibold text-success">
      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
      Verified
    </span>
  );
}

/** Blue ⓘ Reference — the source behind the answer. */
export function ReferenceBadge({ label = 'Reference' }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[10.5px] font-semibold text-info">
      <Info className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}

const STATUS_STYLES = {
  live: 'border-success/30 bg-success/10 text-success',
  generated: 'border-info/30 bg-info/10 text-info',
  ready: 'border-success/30 bg-success/10 text-success',
  blocked: 'border-warning/35 bg-warning/10 text-warning',
  connected: 'border-success/30 bg-success/10 text-success',
  disconnected: 'border-border bg-surface-2 text-text-subtle',
};

export function StatusBadge({ label, variant = 'live' }) {
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${
        STATUS_STYLES[variant] || STATUS_STYLES.live
      }`}
    >
      {label}
    </span>
  );
}

/** "Approved by … · timestamp · Audit trail recorded" */
export function GovernanceRow({ approvedBy = 'Sarah Chen', action = 'Approved', timestamp = 'Aug 13, 2026 at 9:14 AM' }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-muted">
      <FileLock2 className="h-3.5 w-3.5 flex-shrink-0 text-text-subtle" aria-hidden="true" />
      <span>
        {action} by <span className="font-semibold text-text">{approvedBy}</span>
      </span>
      <span className="text-text-subtle" aria-hidden="true">·</span>
      <span>{timestamp}</span>
      <span className="text-text-subtle" aria-hidden="true">·</span>
      <span>Audit trail recorded</span>
    </div>
  );
}

/** The accessibility-conformance claim VOCE makes about what it generates. */
export function StandardsStatusBar({ children = 'This survey meets Maryland State accessibility standards.' }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-success/25 bg-success/[0.07] px-3 py-2">
      <ShieldCheck className="mt-px h-4 w-4 flex-shrink-0 text-success" aria-hidden="true" />
      <p className="text-[12px] leading-relaxed text-text">{children}</p>
    </div>
  );
}

const BANNER_STYLES = {
  warning: 'border-warning/30 bg-warning/[0.08]',
  info: 'border-info/25 bg-info/[0.07]',
  success: 'border-success/25 bg-success/[0.07]',
};

const BANNER_ICONS = { warning: AlertTriangle, info: Info, success: CheckCircle2 };
const BANNER_ICON_COLOR = { warning: 'text-warning', info: 'text-info', success: 'text-success' };

export function AlertBanner({ variant = 'warning', title, children }) {
  const Icon = BANNER_ICONS[variant] || AlertTriangle;
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${BANNER_STYLES[variant]}`}>
      <Icon className={`mt-px h-4 w-4 flex-shrink-0 ${BANNER_ICON_COLOR[variant]}`} aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="text-[12px] font-semibold text-text">{title}</p>}
        {children && <p className="text-[11.5px] leading-relaxed text-text-muted">{children}</p>}
      </div>
    </div>
  );
}

/**
 * The restraint line. VOCE says out loud when it declined to act on its own —
 * the strongest trust claim in the concept, so it gets its own treatment.
 */
export function EscalationNote({ children }) {
  return (
    <div className="rounded-lg border border-brand/20 bg-brand/[0.05] px-3 py-2.5">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand">
        Held for human judgment
      </p>
      <p className="text-[12px] leading-relaxed text-text">{children}</p>
    </div>
  );
}

/** The blanket disclaimer that sits under generated findings. */
export function AiDisclaimer() {
  return (
    <p className="text-[11px] italic text-text-muted">
      VOCE AI can make mistakes. Review findings before sharing externally.
    </p>
  );
}

/** Platform brand chip — the same colours in all four places they appear. */
export function PlatformChip({ platform, color }) {
  return (
    <span
      className="inline-flex flex-shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
      style={{ background: color }}
    >
      {platform}
    </span>
  );
}
