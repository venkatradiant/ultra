import { usePersona } from '../../../../context/PersonaContext';
import IllustrativeDataChip from '../../../common/IllustrativeDataChip';

/**
 * The shared frame for Fiona's two navigation pages (spec §12): the page
 * title, what the page answers, and the illustrative-data marker. Only the
 * Finance persona lists these pages, so any other persona that reaches the
 * route by URL gets the not-available note rather than finance data.
 */
export default function FinancePageShell({ title, subtitle, children }) {
  const persona = usePersona();

  if (persona?.id !== 'ussfcu_finance') {
    return (
      <div className="flex-1 py-8 px-6 lg:px-8 overflow-y-auto">
        <p className="text-sm text-text-muted">This view is not available for the active persona.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto scrollbar-sleek">
      <div className="mx-auto max-w-5xl">
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-text">{title}</h2>
            <p className="mt-0.5 text-sm text-text-subtle">{subtitle}</p>
          </div>
          <IllustrativeDataChip />
        </header>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
