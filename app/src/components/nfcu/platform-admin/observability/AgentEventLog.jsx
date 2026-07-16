import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { clockTime } from './stateStyles';

/**
 * The agent activity log — everything the agents did to this component.
 *
 * Written fresh rather than reusing AuditTrailFeed: that component's dedupe()
 * silently drops any entry without an `auditId`, it seeds itself from
 * sessionStorage and subscribes to `nfcu:escalation`, and it renders
 * "{persona} · {score}% confidence". Our events are {component, message,
 * timestamp}. It's also rendered by Governance.jsx for four other personas, so
 * changing it is out of bounds. The look is borrowed; the code isn't.
 *
 * Props: { events } — chronological oldest→newest; rendered newest first.
 */
const TONE = [
  // Order matters: first match wins.
  { test: /blocked frontier egress|PII detected/i, cls: 'text-red-700' },
  { test: /rerouted|no egress|0 PII|Gate 1 verified/i, cls: 'text-emerald-700' },
  { test: /RCA Result|Recommended action/i, cls: 'text-brand font-semibold' },
  { test: /approved by|SUCCESS|Verification passed/i, cls: 'text-emerald-700 font-semibold' },
  { test: /FAILED|DEGRADED|crossed .*threshold|exceeds/i, cls: 'text-amber-700' },
  { test: /Awaiting human approval/i, cls: 'text-text-subtle italic' },
];

function toneFor(message) {
  return TONE.find((t) => t.test.test(message))?.cls ?? 'text-text-muted';
}

export default function AgentEventLog({ events }) {
  // Newest first, like the reference. Slice guards against an unbounded log if
  // a live API ever streams into this.
  const rows = [...(events ?? [])].reverse().slice(0, 40);

  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-5">
      <div className="flex items-center gap-2 mb-0.5">
        <Terminal className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-semibold text-text">Event history</h3>
        <span className="ml-auto text-[10px] text-text-subtle tabular-nums">{rows.length} events</span>
      </div>
      <p className="text-xs text-text-subtle mb-3">Newest first · everything the agents did here</p>

      <ul className="space-y-0.5 max-h-[300px] overflow-y-auto scrollbar-sleek pr-1">
        {/* initial={false} — without it, opening a component cascades 13 entry
            animations at once. */}
        <AnimatePresence initial={false}>
          {rows.map((e) => (
            <motion.li
              // Keyed on content+time, never index: an index key means every row
              // re-animates whenever the list changes.
              key={`${e.timestamp}-${e.message}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex items-start gap-2.5 py-1 px-1.5 rounded hover:bg-surface-2/60"
            >
              <span className="text-[10px] font-mono text-text-subtle tabular-nums flex-shrink-0 pt-px">
                {clockTime(e.timestamp)}
              </span>
              <span className={`text-[10.5px] font-mono leading-snug ${toneFor(e.message)}`}>
                {e.message}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>

        {rows.length === 0 && (
          <li className="text-[11px] text-text-subtle text-center py-4">No agent activity recorded.</li>
        )}
      </ul>
    </div>
  );
}
