import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, ShieldCheck, MapPin } from 'lucide-react';
import bh from '../../../data/ussfcu/ceo/businessHealth.json';

function fmtUsd(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

export default function BusinessHealthPanel() {
  const spark = bh.membership.sparkline.map((v, i) => ({ i, v }));
  const maxRegion = Math.max(...bh.members_by_region.map((r) => r.members));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <p className="text-xs font-semibold text-text-muted mb-3">Business health — a strong, well-run institution</p>

      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {/* Membership + sparkline */}
        <div className="bg-surface rounded-lg border border-border-subtle p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-brand" />
            <span className="text-[9.5px] font-semibold text-text-muted uppercase tracking-wide">Members</span>
          </div>
          <p className="text-[16px] font-bold text-text tabular-nums leading-none">{bh.membership.value.toLocaleString()}</p>
          <p className="text-[9.5px] font-semibold text-[#00897B] mt-0.5">+{bh.membership.growth_ytd_pct}% YTD</p>
          <div className="mt-1 h-7">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <Line type="monotone" dataKey="v" stroke="var(--color-brand)" strokeWidth={2} dot={false} animationDuration={900} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net income vs plan */}
        <div className="bg-surface rounded-lg border border-border-subtle p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-brand" />
            <span className="text-[9.5px] font-semibold text-text-muted uppercase tracking-wide">Net Income YTD</span>
          </div>
          <p className="text-[16px] font-bold text-text tabular-nums leading-none">{fmtUsd(bh.net_income.actual_usd)}</p>
          <p className="text-[9.5px] font-semibold text-[#00897B] mt-0.5">+{bh.net_income.vs_plan_pct}% vs plan</p>
          <p className="text-[9px] text-text-subtle mt-1.5">Plan {fmtUsd(bh.net_income.plan_usd)}</p>
        </div>

        {/* Capital */}
        <div className="bg-surface rounded-lg border border-border-subtle p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand" />
            <span className="text-[9.5px] font-semibold text-text-muted uppercase tracking-wide">Net Worth</span>
          </div>
          <p className="text-[16px] font-bold text-text tabular-nums leading-none">{bh.capital.net_worth_ratio_pct}%</p>
          <p className="text-[9.5px] font-semibold text-[#00897B] mt-0.5">{bh.capital.status}</p>
        </div>
      </div>

      {/* Members by region */}
      <div className="bg-surface rounded-lg border border-border-subtle p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin className="w-3.5 h-3.5 text-brand" />
          <span className="text-[9.5px] font-semibold text-text-muted uppercase tracking-wide">Members by region — concentrated in the DMV, national tail growing</span>
        </div>
        <div className="space-y-1.5">
          {bh.members_by_region.map((r, idx) => (
            <div key={r.region} className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted w-40 flex-shrink-0 truncate">{r.region}</span>
              <div className="flex-1 h-3 rounded-full bg-surface-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.members / maxRegion) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.05 }}
                  className="h-full rounded-full bg-brand"
                />
              </div>
              <span className="text-[10px] font-semibold text-text-muted tabular-nums w-12 text-right flex-shrink-0">{r.members.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
