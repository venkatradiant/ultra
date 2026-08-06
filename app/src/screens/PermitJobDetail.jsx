/**
 * Permit and Job Detail — the confined-space drill-in.
 *
 * Phase 2 of the GM's day: deciding whether high-consequence work can proceed.
 * Permit conditions and real conditions in the same view, each condition
 * carrying the source that verified it.
 */
import { usePersona } from '../context/PersonaContext';
import useAsyncData from '../hooks/useAsyncData';
import { getPermits } from '../data/aramco/hse-gm';
import HsePageHeader from '../components/aramco/HsePageHeader';
import LazyIndoorViewer from '../components/aramco/LazyIndoorViewer';
import PermitDetailCard from '../components/aramco/PermitDetailCard';
import EvidenceTrustPanel from '../components/aramco/EvidenceTrustPanel';

export default function PermitJobDetail() {
  const persona = usePersona();
  const permits = useAsyncData(getPermits);

  if (!persona?.id?.startsWith('aramco_')) {
    return (
      <div className="flex-1 py-8 px-6 lg:px-8 overflow-y-auto">
        <p className="text-sm text-text-muted">This view is not available for the active persona.</p>
      </div>
    );
  }

  if (!permits) return <div className="flex-1 bg-bg" />;

  const cs = permits.confinedSpace;

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto scrollbar-sleek">
      <HsePageHeader
        title="Permit and Job Detail"
        subtitle={`${cs.id} — ${cs.title}. Permit conditions checked continuously against live occupancy, gas-test interval and standby confirmation, rather than at issue time only.`}
        asOf={permits.freshness}
      />

      {/* The space before the paperwork: where the entrants, the standby post
          and the gas monitor actually are, then the permit record that says
          where they should be. */}
      <LazyIndoorViewer height="min(52vh, 500px)" />

      <div className="mt-5">
        <PermitDetailCard />
      </div>

      <div className="mt-5">
        <EvidenceTrustPanel scope="permit" />
      </div>
    </div>
  );
}
