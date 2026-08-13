import { ClipboardList } from 'lucide-react';
import { OPEN_SURVEY_EVENT } from './SurveyAutoLaunch';

/**
 * The record in the thread that a survey is open, and the way back into it.
 *
 * Without this, closing the overlay leaves a resident on an otherwise empty chat
 * screen with no obvious next move. The chip does the same job; this makes it
 * visible rather than only offered.
 */
export default function ReopenSurveyCard() {
  const reopen = () => window.dispatchEvent(new CustomEvent(OPEN_SURVEY_EVENT));

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand/15 bg-brand/[0.04] px-4 py-3">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand text-white">
        <ClipboardList className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold text-text">
          Maryland Medical Assistance Application Survey
        </p>
        <p className="text-[11.5px] leading-snug text-text-muted">
          Six questions, about three minutes. Close it any time — your answers stay put.
        </p>
      </div>
      <button
        type="button"
        onClick={reopen}
        className="min-h-[36px] flex-shrink-0 rounded-lg bg-brand px-3 text-[11.5px] font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Reopen the survey
      </button>
    </div>
  );
}
