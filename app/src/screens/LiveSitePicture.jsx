/**
 * Live Site Picture — people, permits and hazard zones in one view.
 *
 * The visual centrepiece: the fused permit-plus-location picture that no single
 * source system can produce. Oil & Gas market only; other personas never reach
 * this route because it is not in their nav slots.
 *
 * The HSE GM additionally gets a Live Cameras tab beside the site plan. Two
 * notes on why the tabs are built here rather than inside the map panel:
 *
 *  • `SiteMapPanel` is not this page's private component — it also renders
 *    inline in chat turns for three Aramco personas and inside the muster view.
 *    A tab strip added there would follow it into all of them. Kept at page
 *    level, the camera wall reaches exactly the route it was asked for, and the
 *    map's own People / Permit breaches / Labels / RTLS estate layer toggles
 *    are untouched.
 *
 *  • Switching tabs unmounts the map rather than hiding it, which releases its
 *    WebGL context — the same discipline the panel already applies to itself
 *    when it scrolls out of view.
 */
import { useCallback, useRef, useState } from 'react';
import { Map as MapIcon, Video } from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import useAsyncData from '../hooks/useAsyncData';
import { getSiteData } from '../data/aramco/hse-gm';
import HsePageHeader from '../components/aramco/HsePageHeader';
import LazySiteMap from '../components/aramco/LazySiteMap';
import FlaggedJobsTable from '../components/aramco/FlaggedJobsTable';
import CameraWall from '../components/aramco/CameraWall';

const TABS = [
  { id: 'map', label: 'Site Map', icon: MapIcon },
  { id: 'cameras', label: 'Live Cameras', icon: Video },
];

export default function LiveSitePicture() {
  const persona = usePersona();
  const site = useAsyncData(getSiteData);
  const [tab, setTab] = useState('map');
  const tabRefs = useRef({});

  // The camera estate is authored for the HSE GM's site. The other Aramco
  // personas reach this route too, and they get the page exactly as it was.
  const hasCameras = persona?.id === 'aramco_hse_gm';
  const active = hasCameras ? tab : 'map';

  const onTabKeyDown = useCallback((e) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.id === active);
    const next = TABS[(i + delta + TABS.length) % TABS.length];
    setTab(next.id);
    tabRefs.current[next.id]?.focus();
  }, [active]);

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

  const mapSubtitle = `${totalPeople.toLocaleString()} people and ${totalPermits} open permits across ${site.zones.length} zones, with every job in a hazard zone checked against the permit that authorizes it. ${site.flaggedJobs.length} jobs are running outside their permit conditions right now.`;
  const cameraSubtitle = 'Fixed cameras on the gates, the process units carrying high-risk work, and the muster point. Hover any feed for a silent preview, or open one for sound, a timeline and full screen.';

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto scrollbar-sleek">
      <HsePageHeader
        title="Live Site Picture"
        subtitle={active === 'cameras' ? cameraSubtitle : mapSubtitle}
        asOf={site.freshness}
      >
        {hasCameras && (
          <div
            role="tablist"
            aria-label="Live Site Picture views"
            className="inline-flex rounded-lg border border-border overflow-hidden"
          >
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                ref={(node) => { tabRefs.current[id] = node; }}
                type="button"
                role="tab"
                id={`live-site-tab-${id}`}
                aria-selected={active === id}
                aria-controls={`live-site-panel-${id}`}
                tabIndex={active === id ? 0 : -1}
                onClick={() => setTab(id)}
                onKeyDown={onTabKeyDown}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                  active === id ? 'bg-brand text-white' : 'bg-surface-2 text-text-muted hover:text-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        )}
      </HsePageHeader>

      {active === 'cameras' ? (
        <div role="tabpanel" id="live-site-panel-cameras" aria-labelledby="live-site-tab-cameras">
          <CameraWall />
        </div>
      ) : (
        <div
          role={hasCameras ? 'tabpanel' : undefined}
          id={hasCameras ? 'live-site-panel-map' : undefined}
          aria-labelledby={hasCameras ? 'live-site-tab-map' : undefined}
        >
          {/* The route gets the full-height map — this is the view that has to read
              at investor distance, so it is given the room the chat turns cannot. */}
          <LazySiteMap height="min(62vh, 620px)" />

          <div className="mt-5">
            <FlaggedJobsTable />
          </div>
        </div>
      )}
    </div>
  );
}
