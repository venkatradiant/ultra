/**
 * AramcoBackdropPanel — the real, public, sourced frame the demo sits on.
 *
 * Specification §2. This is the ONLY genuine data in the prototype, and putting
 * it on the Data Sources screen is deliberate: the page that lists where numbers
 * come from is exactly where a viewer should learn which numbers are real.
 *
 * Every row here is public and sourced to the Aramco FY2025 Annual Report.
 * Everything else in the prototype is illustrative — the demo-site frame at the
 * bottom included, which is why it is visually separated rather than mixed in.
 */
import { motion } from 'framer-motion';
import { BadgeCheck, ExternalLink } from 'lucide-react';
import {
  ARAMCO_PUBLIC_FACTS,
  PUBLIC_FACTS_SOURCE,
  PUBLIC_FACTS_URL,
  DEMO_SITE_FRAME,
  ARAMCO_GRADIENT,
  LOGO_WHITE,
} from '../../data/aramco/_shared/aramcoBrand';
import IllustrativeDataChip from './IllustrativeDataChip';

export default function AramcoBackdropPanel() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface overflow-hidden mb-6">
      {/* Client identity band — the one place Aramco gets its own field. */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3" style={{ background: ARAMCO_GRADIENT }}>
        <img src={LOGO_WHITE} alt="Aramco" className="h-5 w-auto object-contain" />
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/90">
          Illustrative target example — not a current customer
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              Public company backdrop — real and sourced
            </h3>
            <p className="text-[11.5px] text-text-muted mt-1 leading-relaxed max-w-3xl">
              The only genuine figures in this prototype. Everything below this panel, and every operational number
              elsewhere in the product, is illustrative.
            </p>
          </div>
          <a
            href={PUBLIC_FACTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[10.5px] font-semibold text-text-muted hover:bg-surface-2 hover:text-text transition-colors flex-shrink-0"
          >
            aramco.com <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
          {ARAMCO_PUBLIC_FACTS.map((fact, i) => (
            <motion.div
              key={fact.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: i * 0.04 }}
              className="rounded-xl border border-border-subtle bg-surface-2 p-3 min-w-0"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-subtle leading-snug">
                {fact.label}
              </p>
              <p className="text-lg font-bold text-text leading-tight mt-1">{fact.value}</p>
              <p className="text-[10.5px] text-text-muted leading-snug mt-1">{fact.detail}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-[10px] text-text-subtle mt-2.5">Source: {PUBLIC_FACTS_SOURCE}</p>

        {/* The demo site — visually separated, because this part is invented. */}
        <div className="mt-5 rounded-xl border border-dashed border-border p-3.5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">
              The demo site frame
            </p>
            <IllustrativeDataChip size="sm" note="A representative complex. Not an actual Aramco facility." />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
            {[
              ['Capacity', DEMO_SITE_FRAME.capacity],
              ['Direct staff', DEMO_SITE_FRAME.directStaff],
              ['Contractors', DEMO_SITE_FRAME.contractors],
              ['State', DEMO_SITE_FRAME.state],
            ].map(([label, value]) => (
              <p key={label} className="text-[11.5px] text-text-muted">
                <span className="font-semibold text-text">{label}:</span> {value}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
