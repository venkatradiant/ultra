import { Check, X } from 'lucide-react';
import AmisaCard from '../shared/AmisaCard';
import { BoundaryNote } from '../shared/AmisaTrustBits';
import { MIN_PEER_GROUP, MIN_PEER_GROUP_NOTE } from '../../../data/amisa/_shared/constants';

/**
 * What the association can and cannot see, side by side.
 *
 * WHY THIS EXISTS. A committee of school IT directors will probe the boundary —
 * "can you show me one school's data?", "what about test scores?" — and the
 * answer has to be a confident, specific refusal rather than a shrug. It is the
 * strongest moment in the pitch: the product's value to a head of school is
 * precisely what it declines to do.
 *
 * It also closes a real hole. The chat engine's keyword rung scores a query
 * against each flow's ANSWER text as well as its question, so "show me student
 * test scores for the school in Chile" scored two coincidental words against
 * the peer-comparison turn ("school", "Chile") and landed there — a probe about
 * student data answered with a benchmark. This flow's corpus names every term
 * such a probe uses, so it outscores the data views and wins the match. See
 * `amisaFlows.test.ts`, which pins that routing.
 *
 * Everything on this card is a real property of the build, not a claim: the
 * suppression floor, the missing geographic axis and the absent assessment data
 * are all enforced in `suppression.ts` and asserted in `amisaData.test.ts`.
 */

const CAN_SEE = [
  'How many schools submitted, and how complete each section is',
  `A benchmark aggregated from at least ${MIN_PEER_GROUP} contributing schools`,
  'Which schools have not started, so the association can follow up',
  'Data-quality findings across the wave, as proposals to review',
];

const CANNOT_SEE = [
  "One school's own submitted figures, or any drill-down into a named school",
  'Individual staff records — names, contracts, individual salaries',
  'Student-level data of any kind, including test scores and assessment results',
  'AP, IB, SAT, ACT or MAP results — none of it is aggregated at the association',
  'Any result cut by country, which would identify a single-school country',
];

export default function BoundaryCard() {
  return (
    <AmisaCard
      eyebrow="What the association can see"
      title="Aggregates, and nothing underneath them"
      intro="The boundary is enforced on every query, including the ones the AI makes."
      illustrative={false}
      source="Suppression and Entitlement Rules"
      freshness="Governance configuration"
      footer={
        <BoundaryNote>
          {MIN_PEER_GROUP_NOTE} The permitted grouping axes and the entitlement rules are
          configuration AMISA owns, not application code a developer has to remember to write.
        </BoundaryNote>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Column tone="can" heading="Available to AMISA" items={CAN_SEE} />
        <Column tone="cannot" heading="Never available to AMISA" items={CANNOT_SEE} />
      </div>
    </AmisaCard>
  );
}

function Column({ tone, heading, items }) {
  const can = tone === 'can';
  const Icon = can ? Check : X;
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        can ? 'border-success/25 bg-success/[0.06]' : 'border-critical/25 bg-critical/[0.05]'
      }`}
    >
      <p
        className={`mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
          can ? 'text-success' : 'text-critical'
        }`}
      >
        {heading}
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-text">
            <Icon
              className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${can ? 'text-success' : 'text-critical'}`}
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
