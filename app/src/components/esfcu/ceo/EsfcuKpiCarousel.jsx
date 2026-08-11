import kpiMeta from '../../../data/esfcu/ceo/kpis.json';
import KpiCarousel from '../shared/KpiCarousel';

/**
 * The CEO's KPI strip: the shared carousel bound to his kpis.json.
 *
 * The manifest's `statsComponent` slot takes a component and PersonaWorkspace
 * decides its props, so per-persona data has to be bound here rather than at the
 * call site. That is the whole job of this file.
 */
export default function EsfcuKpiCarousel(props) {
  return <KpiCarousel {...props} meta={kpiMeta.kpis} />;
}
