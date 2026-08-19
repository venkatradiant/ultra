import { Check, Clock3, Circle } from 'lucide-react';
import DoitCard from '../shared/DoitCard';
import { StatusBadge } from '../shared/TrustBits';
import { useAuthorState } from '../shared/authorState';
import { APPROVER, DISTRIBUTION_LISTS, SURVEY_2 } from '../../../data/doit/_shared/constants';

/**
 * Where the just-submitted survey stands.
 *
 * This card used to show a delivery ring and a "Responses so far: 0" row for a
 * survey that had only just been submitted. Both were claims about a survey
 * that does not exist yet: the author submits, the manager approves, and only
 * then does anything reach a resident. A timeline is the honest shape — it says
 * which step is done, which is waiting, and which has not started.
 */
const STAGES = [
  { id: 'drafted', label: 'Drafted and checked', detail: 'Accessibility and plain-language checks passed', state: 'done' },
  { id: 'submitted', label: 'Submitted for approval', detail: 'Sarah Chen', state: 'done' },
  { id: 'approval', label: 'Manager approval', detail: `${APPROVER.name} · ${APPROVER.turnaround}`, state: 'current' },
  { id: 'live', label: 'Live to recipients', detail: 'Begins once approved', state: 'pending' },
  { id: 'results', label: 'Results', detail: 'Nothing to review until responses arrive', state: 'pending' },
];

const ICONS = {
  done: { Icon: Check, cls: 'bg-success/15 text-success' },
  current: { Icon: Clock3, cls: 'bg-info/15 text-info' },
  pending: { Icon: Circle, cls: 'bg-surface-2 text-text-subtle' },
};

export default function SurveyStatusCard() {
  const { distributionList, draftQuestions } = useAuthorState();
  const list = DISTRIBUTION_LISTS.find((l) => l.name === distributionList) || DISTRIBUTION_LISTS[0];

  return (
    <DoitCard eyebrow="Survey status" title={SURVEY_2.name}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11.5px] text-text-muted">
          {draftQuestions.length} questions · {list.name} · {list.contacts.toLocaleString()} recipients
        </p>
        <StatusBadge label="Awaiting approval" variant="blocked" />
      </div>

      <ol className="space-y-0">
        {STAGES.map((stage, idx) => {
          const { Icon, cls } = ICONS[stage.state];
          const last = idx === STAGES.length - 1;
          return (
            <li key={stage.id} className="flex gap-2.5">
              <div className="flex flex-col items-center">
                <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${cls}`}>
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {!last && <span className="w-px flex-1 bg-border-subtle" aria-hidden="true" />}
              </div>
              <div className={`min-w-0 flex-1 ${last ? 'pb-0' : 'pb-3'}`}>
                <p
                  className={`text-[12.5px] font-medium ${
                    stage.state === 'pending' ? 'text-text-subtle' : 'text-text'
                  }`}
                >
                  {stage.label}
                </p>
                <p className="text-[11px] text-text-muted">{stage.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </DoitCard>
  );
}
