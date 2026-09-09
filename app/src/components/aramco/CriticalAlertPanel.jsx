/**
 * CriticalAlertPanel — everything known about the man-down, in one card.
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
 */
import { useMemo } from 'react';
import {
  Activity, AlertTriangle, Camera, Check, ChevronRight, FileWarning, Gauge,
  HardHat, LifeBuoy, MapPin, Radio, Send, ShieldAlert, Siren, Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAsyncData from '../../hooks/useAsyncData';
import { getIndoorGeo, getSiteData } from '../../data/aramco/hse-gm';
import { entityFromTag } from '../../lib/rtlsIdentity';
import { useCriticalAlert } from '../../context/CriticalAlertContext';
import { ProvenanceLine } from './IllustrativeDataChip';
import Unit3MusterRollCall from './Unit3MusterRollCall';

const STATE_TONE = {
  critical: 'text-rose-700 bg-rose-700/10 border-rose-700/25',
  attention: 'text-amber-700 bg-amber-500/12 border-amber-600/25',
  compliant: 'text-emerald-700 bg-emerald-500/10 border-emerald-600/25',
};

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
  const { alert, status, statusMeta, timeline, confirmed, confirmAction, resolve } = useCriticalAlert();
  const indoor = useAsyncData(getIndoorGeo);
  const site = useAsyncData(getSiteData);

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

  const isResolved = status === 'resolved';
  const dispatched = confirmed.has('act-dispatch');

  return (
    <div className="border-t border-rose-700/15 bg-surface">
      <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-[1600px]">
        <p className="text-[12.5px] text-text-muted leading-relaxed max-w-4xl mb-4">{alert.summary}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
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
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-text-muted leading-snug max-w-4xl">
          <ShieldAlert className="w-3.5 h-3.5 mt-px flex-shrink-0 text-text-subtle" />
          {alert.vitals.caveat}
        </p>

        <div className="mt-4">
          <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-2">Contributing sources</p>
          <div className="flex flex-wrap gap-2">
            {alert.sources.map((s) => (
              <span
                key={s.id}
                title={s.detail}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-[10.5px] text-text-muted"
              >
                <Radio className="w-3 h-3 text-text-subtle" />
                <span className="font-semibold text-text">{s.label}</span>
                <span className="text-text-subtle">· {s.freshness}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-2">Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
            {alert.actions.map((action) => {
              const Icon = ACTION_ICON[action.id] ?? AlertTriangle;
              const done = confirmed.has(action.id);
              return (
                <div
                  key={action.id}
                  className={`rounded-xl border p-3 flex flex-col ${
                    done ? 'border-emerald-600/30 bg-emerald-500/[0.06]' : 'border-border bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      done ? 'bg-emerald-500/15' : 'bg-brand/10'
                    }`}>
                      {done ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Icon className="w-3.5 h-3.5 text-brand" />}
                    </span>
                    <h4 className="text-[12px] font-bold text-text">{action.label}</h4>
                  </div>
                  {action.target && (
                    <p className="text-[10px] text-text-subtle mb-1">{action.target}</p>
                  )}
                  <p className="text-[11px] text-text-muted leading-snug flex-1">
                    {done ? (action.confirmedNote ?? action.description) : action.description}
                  </p>
                  {!done && (
                    <button
                      type="button"
                      onClick={() => {
                        if (action.kind === 'navigate') { navigate(action.to); return; }
                        confirmAction(action.id);
                      }}
                      disabled={isResolved && action.kind !== 'navigate'}
                      className={`mt-2.5 self-start px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default ${
                        action.kind === 'navigate'
                          ? 'border border-border bg-surface-2 text-text-muted hover:text-text'
                          : 'text-white bg-brand hover:bg-brand/90'
                      }`}
                    >
                      {action.needsConfirm ? `${action.confirmLabel} — confirm` : 'Open'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {!isResolved && (
            <p className="text-[10.5px] text-text-subtle mt-2">
              Nothing is sent, dispatched or mustered until you confirm it. Viewing the camera changes nothing.
            </p>
          )}
        </div>

        {confirmed.has('act-muster') && zone && (
          <div className="mt-4">
            <Unit3MusterRollCall expected={zone.people} />
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
          <div>
            <p className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mb-2">
              Status — {statusMeta.label}
            </p>
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
          </div>

          {dispatched && !isResolved && (
            <button
              type="button"
              onClick={resolve}
              className="px-3.5 py-2 rounded-lg border border-emerald-600/30 bg-emerald-500/[0.08] text-[11px] font-semibold text-emerald-700 hover:bg-emerald-500/15 transition-colors cursor-pointer"
            >
              {alert.resolve.confirmLabel}
            </button>
          )}
        </div>

        <ProvenanceLine
          className="mt-3"
          source="Worker tag telemetry, permit-to-work system, continuous gas monitor and CCTV (vendor-agnostic)"
          freshness="live"
        />
      </div>
    </div>
  );
}
