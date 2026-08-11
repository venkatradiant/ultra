import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ExhibitCard from '../shared/ExhibitCard';
import cases from '../../../data/esfcu/cro/cases.json';
import sarItems from '../../../data/esfcu/cro/sarItems.json';
import { tierFor, colorFor } from '../../../utils/confidence';
import { STATE_COLOR } from '../tokens';

/**
 * Spec §12's `/fraud-operations` case triage. Queue on the left, the selected
 * record on the right — the shape the USSFCU analyst workbench uses, because it
 * is what someone actually working a queue needs: the list stays visible while
 * you read a case, so you never lose your place.
 *
 * The SAR panel is the part that matters for the exam story. A case is not done
 * when it is understood; it is done when the filing is defensible. So the
 * deadline clock rides with the record rather than living on a separate screen.
 */

const STATE_ICON = { good: CheckCircle2, warning: AlertTriangle, critical: AlertTriangle };

function CaseRow({ c, active, onSelect }) {
  const Icon = STATE_ICON[c.state] || CheckCircle2;
  return (
    <button
      type="button"
      onClick={() => onSelect(c.id)}
      aria-pressed={active}
      className={`w-full border-b border-border-subtle/60 px-3 py-2 text-left transition-colors last:border-0 ${
        active ? 'bg-brand/[0.06]' : 'hover:bg-surface-2'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <Icon className="h-3 w-3 flex-shrink-0" style={{ color: STATE_COLOR[c.state] }} />
          <span className={`truncate text-[11px] font-semibold ${active ? 'text-brand' : 'text-text'}`}>{c.id}</span>
        </span>
        <span className="flex-shrink-0 text-[10.5px] font-bold tabular-nums text-text">{c.amount_display}</span>
      </div>
      <p className="mt-0.5 truncate text-[9.5px] text-text-subtle">{c.type} · {c.channel}</p>
    </button>
  );
}

export default function CaseTriagePanel() {
  const [activeId, setActiveId] = useState(cases.cases[0].id);
  const active = cases.cases.find((c) => c.id === activeId) || cases.cases[0];
  const sar = sarItems.items.find((s) => s.caseId === active.id);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ExhibitCard
        title="Case triage"
        note={`${cases.shown} of ${cases.open_total} cases opened in the campaign window.`}
        source={cases.source}
        asOf={cases.as_of}
        confidence={cases.confidence}
        provenance={cases.provenance}
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
            {cases.cases.map((c) => (
              <CaseRow key={c.id} c={c} active={c.id === activeId} onSelect={setActiveId} />
            ))}
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface p-3.5">
            <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h4 className="text-[13px] font-bold text-text">{active.id}</h4>
              <span className="text-[10.5px] text-text-muted">{active.type}</span>
              <span
                className="ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                style={{ color: STATE_COLOR[active.state], background: `${STATE_COLOR[active.state]}14` }}
              >
                {active.status}
              </span>
            </div>

            <div className="mb-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-text-subtle">Amount</p>
                <p className="text-[13px] font-bold tabular-nums text-text">{active.amount_display}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-text-subtle">Channel</p>
                <p className="text-[11px] font-semibold text-text">{active.channel}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-text-subtle">Member</p>
                <p className="text-[11px] font-semibold tabular-nums text-text">{active.memberId}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-text-subtle">Score</p>
                <p className="text-[13px] font-bold tabular-nums" style={{ color: colorFor(tierFor(active.score)) }}>
                  {active.score}
                </p>
              </div>
            </div>

            <div className="mb-2.5">
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-text-subtle">Linked receiving accounts</p>
              <div className="flex flex-wrap gap-1">
                {active.linkedAccounts.map((a) => (
                  <span key={a} className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">{a}</span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border-subtle bg-surface-2 p-2.5">
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <FileText className="h-3 w-3 flex-shrink-0 text-brand" />
                <span className="text-[9.5px] font-bold uppercase tracking-wide text-text-muted">SAR package</span>
                {sar ? (
                  <span
                    className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums"
                    style={{ color: STATE_COLOR[sar.state], background: `${STATE_COLOR[sar.state]}14` }}
                  >
                    <Clock className="h-2.5 w-2.5" /> {sar.daysToDeadline} days to deadline
                  </span>
                ) : null}
              </div>
              {sar ? (
                <p className="text-[10.5px] leading-relaxed text-text-muted">
                  <span className="font-semibold text-text">{sar.id}</span> · {sar.status}. Lineage is
                  attached, so the filing stands up to an examiner reading it cold.
                </p>
              ) : (
                <p className="text-[10.5px] leading-relaxed text-text-muted">
                  No SAR open on this case — {active.disposition.toLowerCase()}.
                </p>
              )}
            </div>

            <p className="mt-2 text-[10px] text-text-subtle">Disposition: {active.disposition}.</p>
          </div>
        </div>
      </ExhibitCard>
    </motion.div>
  );
}
