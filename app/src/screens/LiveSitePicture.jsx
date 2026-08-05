/**
 * Live Site Picture — people, permits and hazard zones in one view.
 *
 * The visual centrepiece: the fused permit-plus-location picture that no single
 * source system can produce. Oil & Gas market only; other personas never reach
 * this route because it is not in their nav slots.
 */
import { usePersona } from '../context/PersonaContext';
import useAsyncData from '../hooks/useAsyncData';
import { getSiteData } from '../data/aramco/hse-gm';
import HsePageHeader from '../components/aramco/HsePageHeader';
import SiteMap from '../components/aramco/SiteMap';
import FlaggedJobsTable from '../components/aramco/FlaggedJobsTable';

export default function LiveSitePicture() {
  const persona = usePersona();
  const site = useAsyncData(getSiteData);

  if (!persona?.id?.startsWith('aramco_')) {
    return (
      <div className="flex-1 py-8 px-6 lg:px-8 overflow-y-auto">
        <p className="text-sm text-text-muted">This view is not available for the active persona.</p>
      </div>
    );
  }

  if (!site) return <div className="flex-1 bg-bg" />;

  const totalPeople = site.zones.reduce((sum, z) => sum + z.people, 0);
  const totalPermits = site.zones.reduce((sum, z) => sum + z.permits, 0);

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto scrollbar-sleek">
      <HsePageHeader
        title="Live Site Picture"
        subtitle={`${totalPeople.toLocaleString()} people and ${totalPermits} open permits across ${site.zones.length} zones, with every job in a hazard zone checked against the permit that authorizes it. ${site.flaggedJobs.length} jobs are running outside their permit conditions right now.`}
        asOf={site.freshness}
      />

      <SiteMap />

      <div className="mt-5">
        <FlaggedJobsTable />
      </div>
    </div>
  );
}
