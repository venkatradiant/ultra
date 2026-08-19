import { Link } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';
import { useReportsFor } from './reportsState';

/**
 * The receipt for "Save to my reports".
 *
 * Both DoIT personas used to answer that chip with a sentence — "Saved to your
 * reports" — and nothing else. There was no reports surface anywhere in the app,
 * so the sentence was the entire feature. This card shows the record that was
 * actually written and links to where it now lives.
 *
 * Reads the store rather than taking props, so it shows the current subject even
 * if the author edits the report again afterwards.
 */
export default function SavedReportReceiptCard({ personaId }) {
  const reports = useReportsFor(personaId);
  const latest = reports[0];
  if (!latest) return null;

  return (
    <div className="rounded-xl border border-success/25 bg-success/[0.06] p-3.5">
      <div className="flex items-start gap-2.5">
        <FileText className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-success" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-text">Saved to My Reports</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-text-muted">{latest.subject}</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">
            Draft · saved {latest.savedAt} · {reports.length} report{reports.length === 1 ? '' : 's'} in total
          </p>
        </div>
      </div>

      <Link
        to="/my-reports"
        className="mt-3 inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-brand/30 px-2.5 text-[11.5px] font-semibold text-brand hover:bg-brand/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Open My Reports
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
