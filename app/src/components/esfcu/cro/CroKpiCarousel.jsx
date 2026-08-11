import kpiMeta from '../../../data/esfcu/cro/kpis.json';
import KpiCarousel from '../shared/KpiCarousel';

/** The CRO's KPI strip: the shared carousel bound to her kpis.json. */
export default function CroKpiCarousel(props) {
  return <KpiCarousel {...props} meta={kpiMeta.kpis} />;
}
