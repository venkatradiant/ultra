import { BookCheck } from 'lucide-react';
import FinanceCard, { StatusPill } from './FinanceCard';
import { getPlaybookActions, getShockScenario } from '../../../data/ussfcu/finance';
import { PLAYBOOK } from '../../../data/ussfcu/finance/constants';

/**
 * Step 6 · Automated Action — "Trigger-to-action table drawn from the board
 * playbook, each row tied to a shutdown severity band, with the recommended
 * action highlighted for the modeled scenario." Each action is pulled as
 * written. The strip above the table places the modeled 30-day shutdown on
 * the severity scale, so it is obvious why the first band is recommended.
 */
export default function PlaybookActionTable({ eyebrow = 'Automated Action' }) {
  const actions = getPlaybookActions();
  const { days, scenario } = getShockScenario();
  const bands = [...new Map(actions.map((a) => [a.band, { band: a.band, range: a.range, recommended: a.recommendedFlag }])).values()];

  return (
    <FinanceCard
      eyebrow={eyebrow}
      title={PLAYBOOK.title}
      aside={<StatusPill tone="brand">Pulled as written</StatusPill>}
      footnote="Sources: UST Finex, Board playbook (policy)."
    >
      {/* Severity scale: the modeled shutdown sits at the end of the first band. */}
      <div className="mb-3 rounded-lg border border-border-subtle bg-surface p-3">
        <div className="relative flex h-6 overflow-hidden rounded-md text-[10px] font-semibold">
          {bands.map((b) => (
            <div
              key={b.band}
              className={`flex min-w-0 flex-1 items-center justify-center truncate px-2 ${b.recommended ? 'bg-brand text-white' : 'bg-surface-2 text-text-muted'}`}
            >
              <span className="truncate">{b.range}</span>
            </div>
          ))}
        </div>
        <div className="relative mt-1 h-4 text-[9.5px] text-text-subtle">
          <span className="absolute left-0">Day 0</span>
          <span className="absolute left-1/2 -translate-x-1/2 font-semibold text-brand">▲ Modeled: {days} days</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface">
        <table className="w-full min-w-[460px] text-[11px]">
          <thead>
            <tr className="border-b border-border-subtle text-[9.5px] uppercase tracking-wide text-text-subtle">
              <th className="w-[32%] px-3 py-2 text-left font-semibold">Shutdown severity</th>
              <th className="px-3 py-2 text-left font-semibold">Board playbook action</th>
            </tr>
          </thead>
          <tbody>
            {bands.map((b) => (
              <tr key={b.band} className={`border-b border-border-subtle align-top last:border-0 ${b.recommended ? 'bg-brand-subtle/60' : ''}`}>
                <td className="px-3 py-2.5">
                  <p className={`font-semibold ${b.recommended ? 'text-brand' : 'text-text'}`}>{b.band}</p>
                  <p className="mt-0.5 text-[10px] text-text-subtle">{b.range}</p>
                  {b.recommended ? (
                    <span className="mt-1.5 inline-flex">
                      <StatusPill tone="brand">Recommended · {scenario}</StatusPill>
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5">
                  <ul className="space-y-1.5">
                    {actions
                      .filter((a) => a.band === b.band)
                      .map((a) => (
                        <li key={a.action} className="flex items-start gap-2 text-text">
                          <BookCheck className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${b.recommended ? 'text-brand' : 'text-text-subtle'}`} />
                          <span>{a.action}</span>
                        </li>
                      ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-text-muted">A decision, not a rebuild.</p>
    </FinanceCard>
  );
}
