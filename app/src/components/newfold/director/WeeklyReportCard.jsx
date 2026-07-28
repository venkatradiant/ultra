import { ArrowDownRight, ArrowUpRight, Minus, FileText } from 'lucide-react';
import metrics from '../../../data/newfold-digital/director/metrics.json';

const trendMeta = {
  down: { icon: ArrowDownRight, color: 'text-red-500' },
  up: { icon: ArrowUpRight, color: 'text-emerald-500' },
  flat: { icon: Minus, color: 'text-slate-400' },
};

export default function WeeklyReportCard() {
  const sections = metrics.weeklyReport;
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
        <FileText className="w-4 h-4 text-brand" />
        <div>
          <p className="text-xs font-semibold text-text">Weekly Customer Care Report — Chief Customer Officer</p>
          <p className="text-[10px] text-text-subtle mt-0.5">Week of Jul 28, 2026 · Cross-brand roll-up</p>
        </div>
      </div>
      <div className="divide-y divide-border-subtle">
        {sections.map((s, i) => {
          const t = trendMeta[s.trend] || trendMeta.flat;
          const Icon = t.icon;
          return (
            <div key={i} className="px-4 py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-text-muted">{i + 1}. {s.section}</span>
                </div>
                <p className="text-[11px] text-text-muted mt-1 leading-snug">{s.detail}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-sm font-bold text-text tabular-nums">{s.value}</span>
                <Icon className={`w-4 h-4 ${t.color}`} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-brand/[0.04]">
        <p className="text-[10px] text-brand font-semibold">
          → Recommended: a mandatory 48-hour care-notification rule for any renewal batch above 20,000 customers.
        </p>
      </div>
    </div>
  );
}
