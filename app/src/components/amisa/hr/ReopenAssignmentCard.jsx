import { ClipboardList } from 'lucide-react';
import { openAssignment } from './assignmentOverlay';

/** A way back into the assignment, once she has closed it. */
export default function ReopenAssignmentCard() {
  return (
    <button
      type="button"
      onClick={openAssignment}
      className="inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/[0.06] px-3.5 py-2.5 text-[13px] font-semibold text-brand transition-colors hover:bg-brand/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <ClipboardList className="h-4 w-4" aria-hidden="true" />
      Open my assignment
    </button>
  );
}
