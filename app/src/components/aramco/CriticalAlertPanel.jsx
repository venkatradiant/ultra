/**
 * CriticalAlertPanel — everything known about the man-down, as one column.
 *
 * The panel authors almost none of what it shows. The worker's name and
 * employee number are derived from the tag serial through the same
 * `entityFromTag` join the map's entity cards use; the position, the manway,
 * the standby post and the rescue winch come out of the confined-space indoor
 * geometry; the headcount behind the Unit 3 muster is the zone's own figure
 * from the site fixture. What is left in `criticalAlert.json` is the incident
 * itself and the choices Gina has.
 *
 * That is the point: the alert and the permit card and the plan cannot disagree
 * with each other, because they are reading the same rows.
 *
 * **Ordered by what she has to do, not by what we know.** This used to be a
 * wide grid that opened with six fact cards and put the actions below the fold
 * of its own nested scrollbar — so the one button the whole beat exists for was
 * invisible until she went looking for it. The column now opens with the
 * picture, says in one paragraph what happened, and gives her the four actions
 * before any of the supporting detail. Evidence, sources and the timeline sit
 * underneath, where they belong: they are what she reads *after* deciding, or
 * what she shows someone who asks how the system knew.
 *
 * **One blue action, and it is the camera.** The fixture marks exactly one
 * action `primary`, and only that one gets the filled brand button. Watching is
 * the golden path — it is where operational data and device data land in the
 * same frame, which is the thing the platform is being judged on. Notifying,
 * dispatching and mustering are real and stay one click away, but they are
 * outlined and quiet: they are consequences of the look, not substitutes for
 * it. If a second action ever renders blue, the eye has two next steps and the
 * demo has none.
 */
import { useMemo } from 'react';
import {
  Activity, AlertTriangle, Camera, Check, ChevronRight, FileWarning,
  HardHat, LifeBuoy, MapPin, Radio, Send, ShieldAlert, Siren, Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAsyncData from '../../hooks/useAsyncData';
import { getCameras, getIndoorGeo, getSiteData } from '../../data/aramco/hse-gm';
import { entityFromTag } from '../../lib/rtlsIdentity';
import { useCriticalAlert } from '../../context/CriticalAlertContext';
import { ProvenanceLine } from './IllustrativeDataChip';
import CriticalAlertCamera from './CriticalAlertCamera';
import Unit3MusterRollCall from './Unit3MusterRollCall';

const ACTION_ICON = {
  'act-camera': Camera,
  'act-notify': Send,
  'act-dispatch': Siren,
  'act-muster': Users,
};

/**
 * Metres between two `[lon, lat]` points, flat-earth at this scale.
 *
 * The whole vessel is about twelve metres across, so the curvature correction
 * is far below the precision anyone would read off it. What matters is that the
 * distance is measured from the geometry rather than typed into a fixture where
 * it could quietly stop matching the dot on the plan.
 */
function metresBetween(a, b) {
  if (!a || !b) return null;
  const midLat = ((a[1] + b[1]) / 2) * (Math.PI / 180);
  const dx = (a[0] - b[0]) * 111_320 * Math.cos(midLat);
  const dy = (a[1] - b[1]) * 110_574;
  return Math.sqrt(dx * dx + dy * dy);
}

/** A section heading, so the column reads as parts rather than one long scroll. */
function Heading({ children }) {
  return (
    <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-2">{children}</p>
  );
}

function Fact({ icon: Icon, label, children, tone = 'default' }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-2/60 p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${tone === 'critical' ? 'text-rose-700' : 'text-text-subtle'}`} />
        <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  );
}

export default function CriticalAlertPanel() {
  const navigate = useNavigate();
  const {
    alert, status, statusMeta, timeline, confirmed, cameraPlaying,
    playCamera, confirmAction, resolve,
  } = useCriticalAlert();
  const indoor = useAsyncData(getIndoorGeo);
  const site = useAsyncData(getSiteData);
  const cameraFeed = useAsyncData(getCameras);

  // The join: occupant dot, manway, standby post and winch, straight out of the
  // interior plan the confined-space viewer already draws.
  const geo = useMemo(() => {
    const byId = {};
    indoor?.features?.forEach((f) => { if (f.properties?.id) byId[f.properties.id] = f; });
    const worker = byId[alert.location.occupantId];
    const manway = byId[alert.location.openingId];
    return {
      workerPoint: worker?.geometry?.coordinates ?? null,
      manwayPoint: manway?.geometry?.coordinates ?? null,
      standby: byId[alert.responder.fixtureId]?.properties ?? null,
      winch: byId[alert.responder.rescueFixtureId]?.properties ?? null,
    };
  }, [indoor, alert]);

  const distance = metresBetween(geo.workerPoint, geo.manwayPoint);
  const worker = entityFromTag(alert.worker.tagSerial, alert.worker.role, alert.location.zoneName);
  const zone = site?.zones?.find((z) => z.id === alert.unit3Muster.scopeZoneId);

  // The camera the alert names, out of the same fixture the wall reads. Looked
  // up rather than duplicated into the alert, so the feed cannot drift from the
  // one that plays on the Live Site Picture.
  const cameraAction = alert.actions.find((a) => a.kind === 'camera');
  const camera = cameraFeed?.cameras?.find((c) => c.id === cameraAction?.cameraId) ?? null;

  const isResolved = status === 'resolved';
  const dispatched = confirmed.has('act-dispatch');

  return (
    <div className="px-4 py-4 space-y-5">
      {/* The picture first. Everything under it is the system explaining what it
          saw; this is the thing a general manager actually wants to look at. */}
      {cameraAction && (
        <div>
          <Heading>Live camera</Heading>
          <CriticalAlertCamera
            camera={camera}
            autoPlay={cameraPlaying}
            wallLabel={cameraAction.wallLabel}
            onOpenWall={cameraAction.wallTo ? () => navigate(cameraAction.wallTo) : undefined}
          />
        </div>
      )}

      <p className="text-[12.5px] text-text-muted leading-relaxed">{alert.summary}</p>

      {/* Actions, above every piece of supporting detail. */}
      <div>
        <Heading>Actions</Heading>
        <div className="space-y-2">
          {alert.actions.map((action) => {
            const Icon = ACTION_ICON[action.id] ?? AlertTriangle;
            const done = confirmed.has(action.id);
            return (
              <div
                key={action.id}
                className={`rounded-xl border p-3 ${
                  done
                    ? 'border-emerald-600/30 bg-emerald-500/[0.06]'
                    : action.primary
                      ? 'border-brand/40 bg-brand/[0.05]'
                      : 'border-border bg-surface'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    done ? 'bg-emerald-500/15' : action.primary ? 'bg-brand/15' : 'bg-brand/10'
                  }`}>
                    {done ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Icon className="w-3.5 h-3.5 text-brand" />}
                  </span>
                  <h4 className="text-[12px] font-bold text-text">{action.label}</h4>
                </div>
                {action.target && (
                  <p className="text-[10px] text-text-subtle mb-1">{action.target}</p>
                )}
                <p className="text-[11px] text-text-muted leading-snug">
                  {done ? (action.confirmedNote ?? action.description) : action.description}
                </p>
                {!done && (
                  <button
                    type="button"
                    onClick={() => {
                      if (action.kind === 'camera') { playCamera(action.id); return; }
                      confirmAction(action.id);
                    }}
                    disabled={isResolved && action.kind !== 'camera'}
                    className={`mt-2.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default ${
                      action.primary
                        ? 'text-white bg-brand hover:bg-brand/90 shadow-sm'
                        : 'border border-border bg-surface-2 text-text-muted hover:text-text'
                    }`}
                  >
                    {action.needsConfirm
                      ? `${action.confirmLabel} — confirm`
                      : action.openLabel ?? 'Open'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {!isResolved && (
          <p className="mt-2 text-[10.5px] text-text-subtle leading-snug">
            Nothing is sent, dispatched or mustered until you confirm it. Watching the camera changes nothing.
          </p>
        )}
      </div>

      {/* The live roll-call only exists once she has called the muster, and it
          belongs with the actions rather than at the bottom — it is the one
          thing on this column that is still moving. */}
      {confirmed.has('act-muster') && zone && (
        <Unit3MusterRollCall expected={zone.people} />
      )}

      <div>
        <Heading>What the system saw</Heading>
        <div className="space-y-2">
          <Fact icon={HardHat} label="Worker" tone="critical">
            <p className="text-[13px] font-bold text-text">{worker.name}</p>
            <p className="text-[11px] text-text-muted mt-0.5">
              <span className="font-mono">{worker.entityId}</span> · {worker.roleLabel} · {alert.worker.company}
            </p>
            <p className="text-[10.5px] text-text-subtle mt-1">
              Tag <span className="font-mono">{worker.tagId}</span> · {worker.tagType} · entered {alert.worker.enteredAt}, {alert.worker.minutesInside} min inside
            </p>
          </Fact>

          <Fact icon={MapPin} label="Location" tone="critical">
            <p className="text-[13px] font-bold text-text">{alert.location.vesselName}</p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {distance != null
                ? `Inside the vessel, ${distance.toFixed(1)} m from the ${alert.location.openingName.toLowerCase()}.`
                : `Inside the vessel, near the ${alert.location.openingName.toLowerCase()}.`}
            </p>
            <p className="text-[10.5px] text-text-subtle mt-1">
              {alert.location.levelLabel} · {alert.location.zoneName}
            </p>
          </Fact>

          <Fact icon={Activity} label="Vital signs" tone="critical">
            <p className="text-[13px] font-bold text-rose-700">{alert.vitals.headline}</p>
            <div className="mt-1.5 space-y-1">
              {alert.vitals.readings.map((r) => (
                <div key={r.id} className="flex items-baseline justify-between gap-2">
                  <span className="text-[10.5px] text-text-muted">{r.label}</span>
                  <span className={`text-[10.5px] font-semibold ${r.state === 'critical' ? 'text-rose-700' : 'text-amber-700'}`}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </Fact>

          <Fact icon={FileWarning} label="Permit status" tone="critical">
            <p className="text-[13px] font-bold text-text">
              <span className="font-mono">{alert.permit.id}</span> — {alert.permit.stateLabel}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5 leading-snug">{alert.permit.detail}</p>
            <button
              type="button"
              onClick={() => navigate('/permits')}
              className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand hover:underline cursor-pointer"
            >
              Open the permit <ChevronRight className="w-3 h-3" />
            </button>
          </Fact>

          <Fact icon={LifeBuoy} label="Nearest responder">
            <p className="text-[13px] font-bold text-text">{alert.responder.role}</p>
            <p className="text-[11px] text-text-muted mt-0.5 leading-snug">{alert.responder.detail}</p>
            {geo.winch && (
              <p className="text-[10.5px] text-text-subtle mt-1">{alert.responder.rescueLabel}</p>
            )}
          </Fact>

          <Fact icon={Users} label="Also inside">
            <p className="text-[13px] font-bold text-text">
              {entityFromTag(alert.responder.secondEntrant.tagSerial, 'contractor').name}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
              {alert.responder.secondEntrant.detail}
            </p>
            <p className="text-[10.5px] text-text-subtle mt-1">
              Occupancy {2} of {2} — still within the permitted maximum.
            </p>
          </Fact>
        </div>

        {/* The honest limit of the claim. A tag is not a medical device, and an
            alert that implies otherwise is the wrong kind of confident. */}
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-text-muted leading-snug">
          <ShieldAlert className="w-3.5 h-3.5 mt-px flex-shrink-0 text-text-subtle" />
          {alert.vitals.caveat}
        </p>
      </div>

      <div>
        <Heading>Contributing sources</Heading>
        <div className="flex flex-wrap gap-1.5">
          {alert.sources.map((s) => (
            <span
              key={s.id}
              title={s.detail}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-[10.5px] text-text-muted"
            >
              <Radio className="w-3 h-3 text-text-subtle" />
              <span className="font-semibold text-text">{s.label}</span>
              <span className="text-text-subtle">· {s.freshness}</span>
            </span>
          ))}
        </div>
      </div>

      <div>
        <Heading>Status — {statusMeta.label}</Heading>
        <ol className="space-y-1.5">
          {timeline.map((e) => (
            <li key={e.id} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
              <span className="text-[11px] text-text-muted leading-snug">
                <span className="font-semibold text-text">{e.label}</span>
                <span className="text-text-subtle"> · {e.at}</span>
                {e.detail && <> — {e.detail}</>}
              </span>
            </li>
          ))}
        </ol>

        {dispatched && !isResolved && (
          <button
            type="button"
            onClick={resolve}
            className="mt-3 w-full px-3.5 py-2 rounded-lg border border-emerald-600/30 bg-emerald-500/[0.08] text-[11px] font-semibold text-emerald-700 hover:bg-emerald-500/15 transition-colors cursor-pointer"
          >
            {alert.resolve.confirmLabel}
          </button>
        )}
      </div>

      <ProvenanceLine
        source="Worker tag telemetry, permit-to-work system, continuous gas monitor and CCTV (vendor-agnostic)"
        freshness="live"
      />
    </div>
  );
}
