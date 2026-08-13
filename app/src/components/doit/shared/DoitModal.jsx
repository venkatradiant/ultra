import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * DoIT's dialog shell. Ultra has no generic modal — every one in the app is
 * bespoke and client-scoped — so this is the tenant's, shared across the five
 * VOCE confirm/preview dialogs rather than written five times.
 *
 * Portals to document.body for the same reason the ESFCU deck does: the
 * workspace renders inside an overflow-hidden flex column, so a merely-fixed
 * child can still be clipped.
 *
 * Closes on Escape and on backdrop click, restores focus to whatever opened it,
 * and locks body scroll while open.
 */
export default function DoitModal({ eyebrow, title, children, actions, onClose, labelledBy }) {
  const generatedId = useId();
  const titleId = labelledBy || generatedId;
  const panelRef = useRef(null);
  const restoreTo = useRef(null);

  useEffect(() => {
    restoreTo.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // preventScroll on BOTH focus calls, and it is load-bearing. The workspace
    // shell is `h-[100dvh] overflow-hidden`, which stops the user scrolling it
    // but does NOT stop the browser scrolling it to reveal a focused element.
    // Without this, restoring focus to the chip that opened the dialog drags the
    // whole shell up by however far the chat thread had scrolled, leaving the
    // header off-screen and a band of empty page below.
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (restoreTo.current instanceof HTMLElement) {
        restoreTo.current.focus({ preventScroll: true });
      }
    };
  }, [onClose]);

  return createPortal(
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      className="fixed inset-0 z-[2147483100] flex items-center justify-center overflow-y-auto bg-[rgba(11,34,64,0.6)] p-6"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-lg overflow-hidden rounded-xl bg-surface shadow-[0_24px_60px_-18px_rgba(0,0,0,0.55)] outline-none"
      >
        <div className="h-1 w-full bg-brand" />
        <div className="p-5">
          {eyebrow && (
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">
              {eyebrow}
            </p>
          )}
          <h2 id={titleId} className="mb-2 text-[17px] font-semibold leading-snug text-text">
            {title}
          </h2>
          {children}
          {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Primary and secondary buttons, sized to the 44px touch-target floor.
 *
 * `focusOnMount` takes focus imperatively rather than through the `autoFocus`
 * attribute. Same effect for the keyboard user — a confirm dialog's primary
 * action is the right initial target — without the attribute that fires
 * jsx-a11y/no-autofocus, and it stays under our control if focus handling ever
 * needs to become conditional.
 */
export function ModalPrimary({ children, onClick, focusOnMount }) {
  const ref = useRef(null);

  useEffect(() => {
    if (focusOnMount) ref.current?.focus({ preventScroll: true });
  }, [focusOnMount]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className="min-h-[44px] flex-1 rounded-lg bg-brand px-4 text-[13px] font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {children}
    </button>
  );
}

export function ModalSecondary({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[44px] rounded-lg border border-border px-4 text-[13px] font-semibold text-text-muted transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {children}
    </button>
  );
}
