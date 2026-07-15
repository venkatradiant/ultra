import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

// Step 6 (Automated Action): three completed steps + "all set, no fee" banner.
const STEPS = [
  { title: 'Direct deposit routing added', detail: 'Applies to your primary checking account, now and every future pay cycle' },
  { title: '$3,140.00 salary credit scheduled', detail: 'Posts within one business day' },
  { title: '$412.00 auto loan payment queued', detail: 'Retries automatically once funds post, before the grace period ends' },
];

export default function MemberActionConfirm() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4"
    >
      <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-emerald-700/80 mb-3">
        Done — here is exactly what I did
      </h4>
      <ul className="space-y-2">
        {STEPS.map((s, i) => (
          <li key={i} className="flex items-start gap-2.5 rounded-lg bg-surface border border-emerald-100/70 p-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-text leading-snug">{s.title}</p>
              <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">{s.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-600/[0.08] border border-emerald-200 px-3 py-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
        <p className="text-[12px] font-semibold text-emerald-800">You&rsquo;re all set — no late fee will apply.</p>
      </div>
    </motion.div>
  );
}
