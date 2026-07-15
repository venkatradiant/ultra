import { useMemo } from 'react';
import KpiTile from './KpiTile';

function mergeKpi(kpi, overrides) {
  if (!overrides || !(kpi.id in overrides)) return kpi;
  return { ...kpi, value: overrides[kpi.id] };
}

export default function SupervisorKpiGrid({ baseline, snapshot }) {
  const kpis = useMemo(() => {
    const base = baseline?.tiers?.supervisor?.kpis || [];
    const overrides = snapshot?.kpiOverrides || {};
    return base.map((k) => mergeKpi(k, overrides));
  }, [baseline, snapshot]);

  if (!kpis.length) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {kpis.map((k) => (
        <KpiTile key={k.id} kpi={k} />
      ))}
    </div>
  );
}
