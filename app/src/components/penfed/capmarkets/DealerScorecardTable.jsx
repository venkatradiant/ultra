import { TrendingDown, ArrowRight } from 'lucide-react';
import dealers from '../../../data/penfed/capmarkets/dealers.json';

const pct = (n) => `${(n * 100).toFixed(1)}%`;

export default function DealerScorecardTable() {
  return (
    <div className="bg-surface-2 rounded-xl border border-border-subtle overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-muted">
          Dealer Scorecard — PNFED 2024-A Pool
        </p>
        <p className="text-[10px] text-text-subtle mt-0.5">
          {pct(dealers.concentration.share_of_pool_balance)} of pool balance •{' '}
          {pct(dealers.concentration.share_of_delinquency_volume)} of delinquency volume
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-surface">
            <tr className="text-left text-text-subtle font-semibold">
              <th className="px-3 py-2">Dealer</th>
              <th className="px-3 py-2 text-right">Loans</th>
              <th className="px-3 py-2 text-right">DQ</th>
              <th className="px-3 py-2 text-right">Health</th>
              <th className="px-3 py-2">Geo / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {dealers.dealers.map((d) => {
              const declining = d.health_trend === 'declining';
              return (
                <tr key={d.id} className="bg-surface">
                  <td className="px-3 py-2 font-semibold text-text">{d.name}</td>
                  <td className="px-3 py-2 text-right text-text-muted">{d.loans_in_pool.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-red-600 font-semibold">{pct(d.delinquency_rate)}</td>
                  <td className="px-3 py-2 text-right">
                    <span className="inline-flex items-center gap-1">
                      <span className={`font-semibold ${declining ? 'text-red-600' : 'text-emerald-700'}`}>
                        {d.financial_health_score}
                      </span>
                      {declining ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-red-500">
                          <TrendingDown className="w-3 h-3" />
                          {d.prior_health_score}<ArrowRight className="w-2.5 h-2.5" />{d.financial_health_score}
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-subtle">stable</span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-text-muted">{d.geographic_concentration}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
        <p className="text-[10px] text-amber-700">
          Pool baseline (non-flagged dealers): {pct(dealers.pool_baseline.non_flagged_dealer_dq_rate)} DQ — these three are {((dealers.dealers[0].delinquency_rate / dealers.pool_baseline.non_flagged_dealer_dq_rate)).toFixed(1)}× higher.
        </p>
      </div>
    </div>
  );
}
