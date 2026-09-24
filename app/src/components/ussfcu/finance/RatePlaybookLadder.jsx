import { BookCheck, Check } from 'lucide-react';
import FinanceCard, { StatusPill } from './FinanceCard';
import { PLAYBOOK } from '../../../data/ussfcu/finance/constants';

/**
 * Q5 · Automated Action — the board playbook's pre-set action for each rate
 * increment, pulled as written. The +100 bp rung is the scenario the last two
 * answers modelled, so it is the one marked.
 */
const MODELLED_BPS = 100;

export default function RatePlaybookLadder() {
  return (
    <FinanceCard
      eyebrow="Automated Action"
      title="Pre-set playbook action by rate move"
      aside={<StatusPill tone="brand">Pulled as written</StatusPill>}
      footnote="Actions are quoted from the approved playbook, not regenerated, so the answer is a decision, not a rebuild."
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-2">
        <BookCheck className="h-4 w-4 text-brand" />
        <span className="text-[11.5px] font-semibold text-text">{PLAYBOOK.title}</span>
        <span className="text-[10.5px] text-text-muted">· {PLAYBOOK.approval}</span>
      </div>

      <ol className="relative space-y-2.5 pl-6">
        <span className="absolute bottom-3 left-[9px] top-3 w-px bg-border" aria-hidden="true" />
        {PLAYBOOK.tiers.map((t) => {
          const modelled = t.bps === MODELLED_BPS;
          return (
            <li key={t.bps} className="relative">
              <span
                className={`absolute -left-6 top-3 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 ${
                  modelled ? 'border-warning bg-warning text-white' : 'border-brand/40 bg-surface text-brand'
                }`}
                aria-hidden="true"
              >
                {modelled ? <Check className="h-2.5 w-2.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-brand/60" />}
              </span>
              <div className={`rounded-lg border p-3 ${modelled ? 'border-warning/40 bg-warning-subtle' : 'border-border-subtle bg-surface'}`}>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className={`text-[13px] font-bold tabular-nums ${modelled ? 'text-warning' : 'text-brand'}`}>{t.label}</span>
                  {modelled ? <StatusPill tone="warning">Scenario modelled</StatusPill> : null}
                </div>
                <p className="text-[11.5px] leading-relaxed text-text">{t.action}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </FinanceCard>
  );
}
