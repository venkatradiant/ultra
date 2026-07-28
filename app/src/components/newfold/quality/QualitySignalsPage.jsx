import { motion } from 'framer-motion';
import { ShieldCheck, Smile, BarChart3, ClipboardCheck } from 'lucide-react';
import DisclosureTimelineHeatmap from './DisclosureTimelineHeatmap';
import RepeatContactCorrelation from './RepeatContactCorrelation';
import page from '../../../data/newfold-digital/quality/pageData.json';

const postureStyle = {
  ok: { dot: 'bg-emerald-500', text: 'text-emerald-600' },
  watch: { dot: 'bg-amber-500', text: 'text-amber-600' },
  risk: { dot: 'bg-red-500', text: 'text-red-600' },
};

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-brand" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-text leading-tight">{title}</h2>
          <p className="text-[11px] text-text-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function QualitySignalsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 space-y-6">
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <h1 className="text-lg font-bold text-text">Quality Signals</h1>
          </div>
          <p className="text-[12px] text-text-muted mt-0.5">
            Process and disclosure adherence, sentiment by brand, first-contact-resolution trends, quality-score distribution, and compliance posture (PCI, auto-renewal disclosure).
          </p>
        </motion.div>

        {/* Compliance posture */}
        <Section icon={ClipboardCheck} title="Compliance Posture" subtitle="Disclosure and PCI adherence across the regulated flows">
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border-subtle">
              {page.compliancePosture.map((c) => {
                const s = postureStyle[c.tone] || postureStyle.watch;
                return (
                  <div key={c.item} className="px-4 py-3 flex items-center gap-3">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text">{c.item}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{c.detail}</p>
                    </div>
                    <span className={`text-[11px] font-semibold ${s.text}`}>{c.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Disclosure adherence + repeat correlation */}
        <Section icon={BarChart3} title="Disclosure Adherence & Repeat-Contact Drivers" subtitle="The macro-change timeline and the refund repeat-contact root cause">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <DisclosureTimelineHeatmap />
            <RepeatContactCorrelation />
          </div>
        </Section>

        {/* Sentiment by brand + quality distribution */}
        <Section icon={Smile} title="Sentiment by Brand & Quality-Score Distribution" subtitle="Where sentiment concentrates and how quality scores spread across agents">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-text-muted mb-3">Sentiment Heatmap by Brand</p>
              <div className="space-y-2.5">
                {page.sentimentByBrand.map((s) => (
                  <div key={s.brand}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-text font-medium">{s.brand}</span>
                      <span className="text-[10px] text-text-muted tabular-nums">{s.negative}% neg</span>
                    </div>
                    <div className="flex h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400" style={{ width: `${s.positive}%` }} />
                      <div className="bg-slate-300" style={{ width: `${s.neutral}%` }} />
                      <div className="bg-red-400" style={{ width: `${s.negative}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-3 text-[9px] text-text-muted">
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Positive</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" />Neutral</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Negative</span>
              </div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-text-muted mb-3">Quality-Score Distribution (agents)</p>
              <div className="space-y-2.5">
                {page.qualityDistribution.map((q) => (
                  <div key={q.band} className="flex items-center gap-3">
                    <span className="text-[11px] text-text w-16 flex-shrink-0 tabular-nums">{q.band}</span>
                    <div className="flex-1 bg-surface-2 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-full rounded-full ${q.band === '<60' || q.band === '60–69' ? 'bg-amber-400' : 'bg-brand'}`} style={{ width: `${q.pct * 2}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-text-muted tabular-nums w-8 text-right">{q.pct}%</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-text-subtle mt-3">Median band 80–89. The 13% below 70 clusters in the cancellation/refund teams touched by the two active incidents.</p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
