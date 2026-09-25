import { AlertTriangle, ShieldCheck } from 'lucide-react';
import CurrentStateDiagram from '../../process/CurrentStateDiagram';
import JourneyMap from '../../process/JourneyMap';
import { PUBLIC_BACKDROP, ILLUSTRATIVE_NOTICE } from '../../../data/ussfcu/finance/constants';
import { getCurrentState, getJourney } from '../../../data/ussfcu/finance';

/**
 * Fiona's Data Sources page: spec §2's real public backdrop, the statement
 * that every other figure is illustrative sample data (§15 asks for it on this
 * view), and the gap statement — the cross-system assembly that still happens
 * in Excel today (§3), shown in full as the §8 current-state process with its
 * five interventions, and the §9 journey with its traceability to the demo.
 */
const FACTS = [
  ['Institution', PUBLIC_BACKDROP.institution],
  ['Total assets', 'Approximately $1.53B'],
  ['Members', 'Approximately 52,500'],
  ['Net worth ratio', '7.50%, well capitalized'],
  ['Core platform', PUBLIC_BACKDROP.corePlatform],
];

export default function FinanceDataPosturePanel() {
  return (
    <>
      <div className="mb-6 rounded-2xl border border-border-subtle bg-surface p-5">
        <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand">
          <ShieldCheck className="h-3.5 w-3.5" />
          Real public backdrop
        </p>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
          {FACTS.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5 border-b border-border-subtle pb-2 last:border-0">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-subtle">{label}</dt>
              <dd className="text-[12.5px] leading-relaxed text-text-muted">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] text-text-subtle">
          Sources: USS FCU, USS FCU consolidated financial statements, Weiss Ratings, USS FCU technology briefings. Reconfirm against the latest NCUA 5300 Call Report before the presentation.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
        <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5" />
          Data posture and the gap today
        </p>
        <ul className="space-y-2">
          {[
            ILLUSTRATIVE_NOTICE,
            'The gap: today the numbers live in disconnected systems that refresh on different schedules and count things differently, and most of the cross-system assembly still happens by hand in Excel. The intelligence layer reads these sources; it does not replace any of them.',
          ].map((line) => (
            <li key={line} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-amber-900">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600" />
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6 space-y-6">
        <CurrentStateDiagram getter={getCurrentState} productName="Radiant AI" />
        <JourneyMap
          getter={getJourney}
          title="Fiona — From the Morning Signal to a Recommendation"
          idleHint="Hover a phase for its touchpoints, Fiona's own words, and the opportunity that answers them. Model scenarios is the emotional low, which is where Steps 4 and 5 land."
        />
      </div>
    </>
  );
}
