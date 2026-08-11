import { motion } from 'framer-motion';
import { UserCheck, Clock } from 'lucide-react';
import ExhibitCard from '../shared/ExhibitCard';
import response from '../../../data/esfcu/cro/response.json';

/**
 * Spec §15a slide 7 and §10 Step 6's "Assign the owners" — the recommended
 * actions as numbered items, each with an owner and a response timeframe.
 *
 * Owners are roles rather than names. Renata is already an illustrative person;
 * inventing five colleagues to sit beside her would multiply the fiction for no
 * demo value, and a role is what a risk-committee note would actually carry.
 */
export default function NextStepsPanel() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ExhibitCard
        title="Who owns what, and by when"
        note="Six steps, each assigned and time-boxed. This is where the AI noticing the pattern becomes a human owning the response."
        source={response.source}
        asOf={response.as_of}
        confidence={response.confidence}
        provenance={response.provenance}
      >
        <ol className="space-y-2">
          {response.next_steps.map((s) => (
            <li key={s.n} className="flex gap-2.5 rounded-xl border border-border-subtle bg-surface p-2.5">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-brand text-[11px] font-bold text-white">
                {s.n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-semibold text-text">{s.title}</p>
                <p className="text-[10px] leading-snug text-text-subtle">{s.detail}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5 text-[9.5px] font-semibold text-text-muted">
                    <UserCheck className="h-2.5 w-2.5" /> {s.owner}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5 text-[9.5px] font-semibold text-text-muted">
                    <Clock className="h-2.5 w-2.5" /> {s.timeframe}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </ExhibitCard>
    </motion.div>
  );
}
