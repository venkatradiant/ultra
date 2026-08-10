import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Users, ShieldCheck, GraduationCap, Building2 } from 'lucide-react';
import bh from '../../../data/esfcu/ceo/businessHealth.json';
import ExhibitCard from './ExhibitCard';
import { NAVY } from './tokens';

// "Show me membership and growth" — the growth story and the funding story in
// one view: the education-community base, the Howard University division and
// its conversion opportunity, and capital as the assurance line underneath.
export default function MembershipPanel() {
  const spark = bh.membership.sparkline.map((v, i) => ({ i, v }));
  const maxSeg = Math.max(...bh.segments.map((s) => s.members));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ExhibitCard
        title="Membership, the Howard University division, and capital"
        note={bh.note}
        source={bh.source}
        asOf={bh.as_of}
        confidence={bh.confidence}
      >
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {/* Membership + sparkline */}
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-brand" />
              <span className="text-[9.5px] font-semibold uppercase tracking-wide text-text-muted">Members</span>
              <Marker real={bh.membership.real} />
            </div>
            <p className="text-[16px] font-bold leading-none tabular-nums text-text">{bh.membership.display}</p>
            <p className="mt-0.5 text-[9.5px] font-semibold text-[#00897B]">+{bh.membership.growth_yoy_pct}% YoY</p>
            <div className="mt-1 h-7">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <Line type="monotone" dataKey="v" stroke={NAVY} strokeWidth={2} dot={false} animationDuration={900} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Howard University division */}
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-brand" />
              <span className="text-[9.5px] font-semibold uppercase tracking-wide text-text-muted">HU Division</span>
            </div>
            <p className="text-[16px] font-bold leading-none tabular-nums text-text">{bh.division.members.toLocaleString()}</p>
            <p className="mt-0.5 text-[9.5px] font-semibold text-[#B45309]">
              {bh.division.primary_depositor_rate_pct}% are primary depositors
            </p>
            <p className="mt-1.5 text-[9px] leading-snug text-text-subtle">
              Merged {bh.division.merged_effective} · {bh.division.field_of_membership}
            </p>
          </div>

          {/* Capital — the assurance line */}
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" />
              <span className="text-[9.5px] font-semibold uppercase tracking-wide text-text-muted">Net Worth</span>
              <Marker real={bh.capital.real} />
            </div>
            <p className="text-[16px] font-bold leading-none tabular-nums text-text">{bh.capital.net_worth_ratio_pct}%</p>
            <p className="mt-0.5 text-[9.5px] font-semibold text-[#00897B]">{bh.capital.status}</p>
            <p className="mt-1.5 text-[9px] leading-snug text-text-subtle">
              Well above the {bh.capital.threshold_pct}% threshold — the room the board has to act.
            </p>
          </div>
        </div>

        {/* Field of membership */}
        <div className="mt-3 rounded-lg border border-border-subtle bg-surface-2 p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 flex-shrink-0 text-brand" />
            <span className="text-[9.5px] font-semibold uppercase tracking-wide text-text-muted">
              Field of membership — {bh.footprint.branches} branches across {bh.footprint.state}
            </span>
          </div>
          <div className="space-y-1.5">
            {bh.segments.map((s, idx) => (
              <div key={s.segment} className="flex items-center gap-2">
                <span className="w-32 flex-shrink-0 truncate text-[10px] text-text-muted sm:w-44">{s.segment}</span>
                <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-surface">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.members / maxSeg) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.05 }}
                    className="h-full rounded-full bg-brand"
                  />
                </div>
                <span className="w-12 flex-shrink-0 text-right text-[10px] font-semibold tabular-nums text-text-muted">
                  {s.members.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[9px] leading-snug text-text-subtle">{bh.division.real_note}</p>
        </div>
      </ExhibitCard>
    </motion.div>
  );
}

function Marker({ real }) {
  return (
    <span
      className={`rounded px-1 py-px text-[8px] font-bold uppercase tracking-wide ${
        real ? 'bg-[#00897B]/10 text-[#00897B]' : 'bg-surface text-text-subtle'
      }`}
    >
      {real ? 'Real' : 'Illustrative'}
    </span>
  );
}
