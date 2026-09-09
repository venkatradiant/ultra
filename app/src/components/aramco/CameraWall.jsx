/**
 * CameraWall — the fixed-camera estate, as a grid.
 *
 * The wall owns two things the tiles deliberately do not:
 *
 *  • **Which single tile is previewing.** Six 1080-line feeds decoding at once
 *    is the one thing that will visibly stall this page, so exactly one preview
 *    is granted at a time and the grant lives here. A tile asks; it never
 *    decides.
 *
 *  • **The join back to the site fixture.** Cameras carry a `zoneId`, not a
 *    headcount, and the breach count beside a feed is derived from the same
 *    `flaggedJobs` the map pins and the table lists. Nothing on this tab is a
 *    second authoring of a number that already exists — if the fixture changes,
 *    the wall moves with it.
 */
import { useCallback, useMemo, useState } from 'react';
import { VideoOff } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getCameras, getSiteData } from '../../data/aramco/hse-gm';
import IllustrativeDataChip, { ProvenanceLine } from './IllustrativeDataChip';
import CameraTile from './CameraTile';
import CameraViewer from './CameraViewer';

export default function CameraWall({ camerasGetter = getCameras, siteGetter = getSiteData }) {
  const feed = useAsyncData(camerasGetter);
  const site = useAsyncData(siteGetter);

  const [previewId, setPreviewId] = useState(null);
  const [openCamera, setOpenCamera] = useState(null);

  const zonesById = useMemo(() => {
    const out = {};
    site?.zones?.forEach((z) => { out[z.id] = z; });
    return out;
  }, [site]);

  // Zone id → how many flagged jobs are running in it, so a camera pointed at
  // Z2 says so without the count being written down twice.
  const breachesByZone = useMemo(() => {
    const out = {};
    site?.flaggedJobs?.forEach((j) => { out[j.zoneId] = (out[j.zoneId] ?? 0) + 1; });
    return out;
  }, [site]);

  // Closing the viewer must also drop the preview grant: the pointer is very
  // often no longer over the tile it was opened from, and that tile would
  // otherwise keep decoding behind a closed dialog.
  const closeViewer = useCallback(() => { setOpenCamera(null); setPreviewId(null); }, []);

  // Opening a feed stops the wall's preview, so the dialog is the only video
  // on the page — and therefore the only one that can ever be unmuted.
  const openViewer = useCallback((camera) => { setPreviewId(null); setOpenCamera(camera); }, []);

  if (!feed) return null;

  const cameras = feed.cameras ?? [];
  const online = cameras.filter((c) => c.status === 'online').length;

  if (!cameras.length) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface p-10 flex flex-col items-center gap-2 text-center">
        <VideoOff className="w-6 h-6 text-text-subtle" />
        <p className="text-[12.5px] font-semibold text-text">No cameras are configured for this site</p>
        <p className="text-[11px] text-text-subtle">Feeds appear here once the site&apos;s camera estate is connected.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-[13px] font-bold text-text tracking-tight">Live Cameras</h3>
            <p className="text-[11px] text-text-subtle mt-0.5">
              {online} of {cameras.length} feeds online · two gates, three process units and the muster point
            </p>
          </div>
          <IllustrativeDataChip note="Illustrative footage. Not a real Aramco site or camera estate." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {cameras.map((camera) => (
            <CameraTile
              key={camera.id}
              camera={camera}
              zone={camera.zoneId ? zonesById[camera.zoneId] : null}
              breaches={camera.zoneId ? (breachesByZone[camera.zoneId] ?? 0) : 0}
              previewing={previewId === camera.id && !openCamera}
              onPreview={setPreviewId}
              onOpen={openViewer}
            />
          ))}
        </div>

        <p className="text-[11px] text-text-subtle leading-snug mt-3.5">
          Hover a camera for a silent preview, or select one to open it with sound, a timeline and full screen.
          Previews never play audio, and only one feed streams at a time.
        </p>

        <ProvenanceLine
          className="mt-2"
          source="Fixed CCTV estate at the gates, process units and muster point (vendor-agnostic)"
          freshness={feed.freshness}
        />
      </div>

      <CameraViewer
        camera={openCamera}
        zone={openCamera?.zoneId ? zonesById[openCamera.zoneId] : null}
        breaches={openCamera?.zoneId ? (breachesByZone[openCamera.zoneId] ?? 0) : 0}
        onClose={closeViewer}
      />
    </>
  );
}
