import { motion } from 'framer-motion';
import { FileText, ShieldCheck, Presentation } from 'lucide-react';

// Board briefing preview — section thumbnails + traceability note. The
// "View Full Briefing" affordance launches Presentation Mode in the delivered
// dashboard; that surface is the next build phase, so the control is shown as a
// labeled placeholder here.

const SECTIONS = [
  { title: 'The State of USSFCU', sub: 'Cover' },
  { title: 'Liquidity Watch', sub: 'Loan-to-share 84% · two moves' },
  { title: 'Membership & Growth', sub: '52,488 · +3.1% · national tail' },
  { title: 'Capital & Net Income', sub: '7.50% net worth · $9.4M, +6.8%' },
  { title: 'Recommended Actions', sub: 'Deposit campaign · funding review' },
  { title: 'Lineage Appendix', sub: 'Every figure traced to source' },
];

export default function BoardBriefingPreview({ onViewFullBriefing }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-brand" />
          <p className="text-xs font-semibold text-text-muted">Board Briefing — ready to present</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-[#00897B] bg-[#00897B]/10 px-1.5 py-0.5 rounded">
          <ShieldCheck className="w-2.5 h-2.5" />
          Traceability 100%
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {SECTIONS.map((s, i) => (
          <div key={s.title} className="bg-surface rounded-lg border border-border-subtle p-2.5">
            <div className="flex items-center justify-center w-5 h-5 rounded bg-brand/[0.06] text-brand text-[10px] font-bold mb-1.5">{i + 1}</div>
            <p className="text-[10.5px] font-semibold text-text leading-tight">{s.title}</p>
            <p className="text-[9px] text-text-subtle mt-0.5 leading-snug">{s.sub}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-text-muted mt-3 leading-snug">
        Each figure carries a source-to-report trace, so the board and NCUA examiners can see how every number was built.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (onViewFullBriefing) onViewFullBriefing();
            else window.dispatchEvent(new CustomEvent('ussfcu-ceo:open-presentation'));
          }}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-brand text-white/95 transition-colors hover:bg-[#00246b]"
        >
          <Presentation className="w-3.5 h-3.5" />
          View Full Briefing
        </button>
        <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-text-subtle">
          Opens the board-ready Presentation Mode deck
        </span>
      </div>
    </motion.div>
  );
}
