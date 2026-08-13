/**
 * The card shell every VOCE intelligence card sits in.
 *
 * Ultra has no generic card primitive — the convention is a bespoke component
 * per client — so this is DoIT's, matching the surface/border/radius the rest
 * of the app uses rather than the prototype's flat 4px MDWDS boxes.
 */
export default function DoitCard({ eyebrow, title, intro, children, footer, className = '' }) {
  return (
    <div className={`rounded-xl border border-border-subtle bg-surface p-4 ${className}`}>
      {eyebrow && (
        <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
          {eyebrow}
        </p>
      )}
      {title && <h3 className="mb-1 text-[15px] font-semibold leading-snug text-text">{title}</h3>}
      {intro && <p className="mb-3 text-[12.5px] leading-relaxed text-text-muted">{intro}</p>}
      {children}
      {footer && <div className="mt-3 border-t border-border-subtle pt-3">{footer}</div>}
    </div>
  );
}
