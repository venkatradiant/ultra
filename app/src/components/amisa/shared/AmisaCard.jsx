import IllustrativeDataChip, { ProvenanceLine } from '../../common/IllustrativeDataChip';

/**
 * The card shell every AMISA intelligence card sits in.
 *
 * Ultra has no generic card primitive — the convention is one per client — so
 * this is AMISA's. It differs from DoIT's in one respect that is not cosmetic:
 * the illustrative chip is part of the shell rather than something each card
 * remembers to add. The intake asks that every salary, participation, data
 * quality and comparison figure be labelled on screen, and a shell that carries
 * the label by default is the only version of that rule which survives a
 * fourteenth card being added in a hurry.
 *
 * Pass `illustrative={false}` only for a card showing genuinely public facts.
 */
export default function AmisaCard({
  eyebrow,
  title,
  intro,
  children,
  footer,
  illustrative = true,
  illustrativeNote,
  source,
  freshness,
  className = '',
}) {
  return (
    <div className={`rounded-xl border border-border-subtle bg-surface p-4 ${className}`}>
      {(eyebrow || illustrative) && (
        <div className="mb-2 flex items-start justify-between gap-3">
          {eyebrow ? (
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              {eyebrow}
            </p>
          ) : (
            <span />
          )}
          {illustrative && <IllustrativeDataChip size="sm" note={illustrativeNote} />}
        </div>
      )}
      {title && <h3 className="mb-1 text-[15px] font-semibold leading-snug text-text">{title}</h3>}
      {intro && <p className="mb-3 text-[13px] leading-relaxed text-text-muted">{intro}</p>}
      {children}
      {(footer || source || freshness) && (
        <div className="mt-3 space-y-1.5 border-t border-border-subtle pt-3">
          {footer}
          <ProvenanceLine source={source} freshness={freshness} />
        </div>
      )}
    </div>
  );
}
