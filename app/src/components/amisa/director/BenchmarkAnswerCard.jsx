import { Users, ShieldOff } from 'lucide-react';
import AmisaCard from '../shared/AmisaCard';
import ConfidenceBadge from '../../common/ConfidenceBadge';
import { DefinitionNote, AppliedByRow } from '../shared/AmisaTrustBits';
import { useDirectorState } from '../shared/directorState';
import {
  BENCHMARK_DEFINITIONS,
  HERO_BENCHMARK,
  computeValidCount,
  methodologyLine,
} from '../../../data/amisa/_shared/constants';
import { MEMBER_SCHOOL_ROSTER, participatingSchools } from '../../../data/amisa/_shared/schools';

/**
 * The hero answer: one number, and everything needed to defend it.
 *
 * The intake is explicit that this has to be trustworthy rather than
 * impressive, so the number is the smallest thing on the card. What surrounds
 * it is the case for believing it — how many schools stand behind it, the
 * definition they all answered against, what was excluded and why, and who
 * made the call that produced the analysis set.
 *
 * The methodology line is generated from the sweep the Executive Director
 * actually applied. Change a checkbox on the previous card and this line
 * changes with it; that is the point of routing both through
 * `computeValidCount` rather than printing 298.
 */
export default function BenchmarkAnswerCard() {
  const { sweep, sweepApplied } = useDirectorState();
  const valid = computeValidCount(sweep);
  const nonParticipants = MEMBER_SCHOOL_ROSTER.length - participatingSchools().length;

  return (
    <AmisaCard
      eyebrow="Benchmark · Human Resources"
      title={HERO_BENCHMARK.question}
      illustrativeNote="A fictional benchmark over a fictional roster. No real salary data is present."
      source="AMISA Survey Platform, 2026 wave · definitions from the AMISA Data Dictionary"
      freshness={`Window closed September 30 · ${sweepApplied ? 'sweep applied' : 'sweep not yet applied'}`}
      footer={
        <div className="space-y-1.5">
          <p className="text-[11.5px] text-text-muted">{methodologyLine(sweep)}</p>
          {sweepApplied && <AppliedByRow />}
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[40px] font-bold leading-none tracking-tight text-text">
            ${HERO_BENCHMARK.value.toLocaleString()}
          </p>
          <p className="mt-1 text-[12px] text-text-muted">
            Average, {HERO_BENCHMARK.degree} degree · {HERO_BENCHMARK.yearsExperience} years'
            experience · {HERO_BENCHMARK.currency}
          </p>
        </div>
        <ConfidenceBadge
          score={HERO_BENCHMARK.confidence}
          note="Reflects contributor count, definition compliance and the share of records surviving the sweep."
        />
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Fact
          icon={Users}
          label="Schools contributing"
          value={HERO_BENCHMARK.contributingSchools}
          note="Submitted Human Resources and employ a teacher at this degree and experience."
        />
        <Fact
          label="Records in the answer"
          value={valid}
          note="After the data-quality sweep you applied."
        />
        <Fact
          icon={ShieldOff}
          label="Schools excluded"
          value={nonParticipants}
          note="Not participating this year. Excluded from the answer and from access to it."
        />
      </div>

      <DefinitionNote definition={BENCHMARK_DEFINITIONS['teacher-salary']} />
    </AmisaCard>
  );
}

function Fact({ icon: Icon, label, value, note }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-2 px-3 py-2">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0 text-text-subtle" aria-hidden="true" />}
        <span className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-text-muted">
          {label}
        </span>
      </div>
      <p className="mt-0.5 text-[20px] font-bold leading-none text-text">{value}</p>
      <p className="mt-1 text-[10.5px] leading-snug text-text-muted">{note}</p>
    </div>
  );
}
