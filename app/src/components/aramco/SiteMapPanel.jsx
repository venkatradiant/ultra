/**
 * SiteMapPanel — the Live Site Picture, and the inline map for chat turns.
 *
 * Wraps MapCanvas with the chrome that makes a map readable at investor
 * distance: legend, layer toggles, a hovered-zone strip, and the provenance
 * line every figure in this demo carries.
 *
 * Two behaviours worth knowing about:
 *
 *  • **Freeze on scroll.** Lam wants the map inline in chat turns, and a long
 *    conversation can stack several. Browsers cap concurrent WebGL contexts
 *    (commonly 8–16) and silently drop the oldest, which would blank a map
 *    mid-presentation. An IntersectionObserver unmounts the canvas when the
 *    panel scrolls out of view and remounts it on return, so only visible maps
 *    hold a context.
 *
 *  • **Labels are HTML.** MapLibre `symbol` layers need font glyphs fetched from
 *    a remote URL. Rendering labels as Markers keeps the map at zero network
 *    requests and lets them inherit Tailwind and the theme.
 *
 * The interaction model — click anything, get a card; hover a zone, get its
 * load; a live cursor coordinate readout under the frame; layer toggles for
 * people, breaches, labels and the RTLS estate — is taken from the deployed
 * TrackLynk (Synapse) console's Site View rather than invented here.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Layers, Users, AlertTriangle, MapPin, Radio } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getSiteGeo, getWorkerPositions } from '../../data/aramco/hse-gm';
import { entityFromTag } from '../../lib/rtlsIdentity';
import IllustrativeDataChip, { ProvenanceLine } from './IllustrativeDataChip';
import MapCanvas from './MapCanvas';
import MapFeatureCard from './MapFeatureCard';

const HAZARD_SWATCH = { high: 'bg-rose-500', medium: 'bg-amber-500', low: 'bg-slate-400' };

/** Build a detached DOM node for a MapLibre Marker. */
function el(html, className) {
  const node = document.createElement('div');
  node.className = className;
  node.innerHTML = html;
  return node;
}

function zoneLabel(name, people) {
  return el(
    `<span class="block text-[10px] font-bold leading-none">${name}</span>
     <span class="block text-[9px] opacity-70 leading-none mt-0.5">${people.toLocaleString()} people</span>`,
    'pointer-events-none select-none text-center text-text bg-surface/85 backdrop-blur-[1px] rounded px-1.5 py-1 border border-border-subtle whitespace-nowrap',
  );
}

function flaggedMarker(rank) {
  return el(
    `<span class="relative flex items-center justify-center w-6 h-6 rounded-full bg-rose-700 text-white text-[11px] font-extrabold border-2 border-white shadow">
       ${rank}
       <span class="absolute inset-0 rounded-full bg-rose-600 opacity-40 animate-ping"></span>
     </span>`,
    'pointer-events-none select-none',
  );
}

function pinMarker(label, tone) {
  return el(
    `<span class="flex items-center gap-1 rounded-full ${tone} px-2 py-0.5 text-[9.5px] font-semibold border border-white/60 shadow-sm whitespace-nowrap">${label}</span>`,
    'pointer-events-none select-none',
  );
}

/**
 * @param {object} props
 * @param {'site'|'flagged'|'muster'} [props.variant] Which overlay set to emphasise.
 * @param {Array<{count:number,label:string,priority:string,lastKnownPoint:number[]}>} [props.lastKnown]
 * @param {string} [props.height]
 * @param {string} [props.title]
 * @param {boolean} [props.compact] Hide the legend and toggles (inline chat use).
 */
export default function SiteMapPanel({
  variant = 'site',
  lastKnown = [],
  height = '440px',
  title = 'Live Site Picture',
  compact = false,
  siteGetter = getSiteGeo,
  workerGetter = getWorkerPositions,
}) {
  const site = useAsyncData(siteGetter);
  const workers = useAsyncData(workerGetter);
  const [showWorkers, setShowWorkers] = useState(variant !== 'flagged');
  const [showFlagged, setShowFlagged] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showInfra, setShowInfra] = useState(false);
  const [hoverZone, setHoverZone] = useState(null);
  const [selected, setSelected] = useState(null);
  const [cursor, setCursor] = useState(null);

  // Freeze when off-screen: releases the GL context so a scrolling conversation
  // with several maps never exhausts the browser's context pool.
  const wrap = useRef(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const node = wrap.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '200px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Zone lookup by id, so a clicked worker can name the zone it stands in — the
  // console's entity card always answers "inside which zone", and a position
  // without that line is a dot rather than a fact.
  const zonesById = useMemo(() => {
    const out = {};
    site?.features.forEach((f) => {
      if (f.properties.kind === 'zone') out[f.properties.id] = f.properties;
    });
    return out;
  }, [site]);

  const handleSelect = useCallback((hit) => {
    if (!hit) return setSelected(null);
    const p = hit.properties;
    if (hit.layer === 'worker-dot') {
      const zone = zonesById[p.zoneId];
      return setSelected({
        type: 'entity',
        role: p.role,
        ...entityFromTag(p.t, p.role, zone?.name, hit.coordinates),
      });
    }
    if (hit.layer === 'infra-dot') {
      return setSelected({ type: 'infra', ...p, coordinates: hit.coordinates });
    }
    if (hit.layer === 'zone-fill') {
      return setSelected({ type: 'zone', ...p });
    }
    // point-hit covers the three kinds that render as HTML markers.
    if (p.kind === 'muster') return setSelected({ type: 'muster', ...p, coordinates: hit.coordinates });
    if (p.kind === 'gate') return setSelected({ type: 'gate', ...p, coordinates: hit.coordinates });
    if (p.kind === 'flagged') {
      return setSelected({
        type: 'zone',
        name: `${p.zoneName} — job ${p.id}`,
        zoneType: 'Permit breach',
        icon: 'hazard',
        hazard: 'high',
        people: zonesById[p.zoneId]?.people ?? 0,
        occupancy: zonesById[p.zoneId]?.occupancy ?? 0,
        permits: zonesById[p.zoneId]?.permits ?? 0,
        highRiskPermits: zonesById[p.zoneId]?.highRiskPermits ?? 0,
      });
    }
    return setSelected(null);
  }, [zonesById]);

  const markers = useMemo(() => {
    if (!site || typeof document === 'undefined') return [];
    const out = [];
    const byKind = (k) => site.features.filter((f) => f.properties.kind === k);

    if (showLabels) {
      byKind('zone').forEach((f) => {
        const ring = f.geometry.coordinates[0];
        const cx = (ring[0][0] + ring[2][0]) / 2;
        const cy = (ring[0][1] + ring[2][1]) / 2;
        out.push({ lngLat: [cx, cy], element: zoneLabel(f.properties.short, f.properties.people) });
      });
    }

    if (showFlagged && variant !== 'muster') {
      byKind('flagged').forEach((f) => {
        out.push({ lngLat: f.geometry.coordinates, element: flaggedMarker(f.properties.rank) });
      });
    }

    // Gates carry the console's in/out glyph pair. A gate is the one place on
    // an RTLS site where direction is the whole point — it is what turns a
    // presence reading into a headcount — so the marker says so.
    byKind('gate').forEach((f) => {
      out.push({
        lngLat: f.geometry.coordinates,
        element: pinMarker(
          `<span class="opacity-70 mr-0.5">⇥⇤</span>${f.properties.name}`,
          'bg-slate-700 text-white',
        ),
      });
    });

    // Muster points and last-known pins are authored at zone centres, which is
    // exactly where the zone labels sit — one group landed dead on top of the
    // "Muster" label and hid it entirely. Pushing the two sets in opposite
    // directions separates all three tiers without moving the underlying data.
    if (variant === 'muster') {
      byKind('muster').forEach((f) => {
        out.push({
          lngLat: f.geometry.coordinates,
          offset: [0, 24],
          element: pinMarker(f.properties.id, 'bg-emerald-600 text-white'),
        });
      });
      lastKnown.forEach((g) => {
        if (!g.lastKnownPoint) return;
        const tone = g.priority === 'high' ? 'bg-rose-700 text-white' : g.priority === 'medium' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white';
        out.push({
          lngLat: g.lastKnownPoint,
          // Up and to the right. Vertical alone was not enough: the zone labels
          // and the muster pins already occupy the column above and below every
          // anchor, so the only free space is diagonal.
          offset: [44, -34],
          element: pinMarker(`${g.count} · last known`, tone),
        });
      });
    }

    return out;
  }, [site, showFlagged, showLabels, variant, lastKnown]);

  // Frame the flagged jobs *with their units*, not the three points alone.
  // Fitting the bare points put them at the very edge of the frame — one of them
  // under the zoom control — on a uniform hazard wash with no surrounding
  // geometry, so the map answered "where" with no "where relative to what".
  // Including the parent zone polygons keeps Unit 2 and Unit 3 both in view.
  const fitTo = useMemo(() => {
    if (!site || variant !== 'flagged') return undefined;
    const flagged = site.features.filter((f) => f.properties.kind === 'flagged');
    if (!flagged.length) return undefined;
    const zoneIds = new Set(flagged.map((f) => f.properties.zoneId));
    const zones = site.features.filter(
      (f) => f.properties.kind === 'zone' && zoneIds.has(f.properties.id),
    );
    return { type: 'FeatureCollection', features: [...flagged, ...zones] };
  }, [site, variant]);

  if (!site) return null;

  const zone = hoverZone && site.features.find((f) => f.properties.kind === 'zone' && f.properties.id === hoverZone)?.properties;
  const totals = site.features
    .filter((f) => f.properties.kind === 'zone')
    .reduce((a, f) => ({
      people: a.people + f.properties.people,
      permits: a.permits + f.properties.permits,
      high: a.high + f.properties.highRiskPermits,
    }), { people: 0, permits: 0, high: 0 });

  const Toggle = ({ on, set, icon: Icon, label }) => (
    <button
      type="button"
      onClick={() => set((v) => !v)}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
        on ? 'border-brand/35 bg-brand/8 text-brand' : 'border-border bg-surface-2 text-text-subtle hover:text-text-muted'
      }`}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div ref={wrap} className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold text-text tracking-tight">{title}</h3>
          <p className="text-[11px] text-text-subtle mt-0.5">
            {totals.people.toLocaleString()} people · {totals.permits} active permits ·{' '}
            {totals.high} high-risk · 11 zones
          </p>
        </div>
        <IllustrativeDataChip note="Invented facility layout. Not a real Aramco site." />
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Toggle on={showWorkers} set={setShowWorkers} icon={Users} label="People" />
          <Toggle on={showFlagged} set={setShowFlagged} icon={AlertTriangle} label="Permit breaches" />
          <Toggle on={showLabels} set={setShowLabels} icon={MapPin} label="Labels" />
          <Toggle on={showInfra} set={setShowInfra} icon={Radio} label="RTLS estate" />
          <span className="ml-auto inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            {Object.entries(HAZARD_SWATCH).map(([k, cls]) => (
              <span key={k} className="inline-flex items-center gap-1.5 text-[10px] text-text-muted capitalize">
                <span className={`w-2.5 h-2.5 rounded-sm ${cls} opacity-60`} /> {k} hazard
              </span>
            ))}
            {/* The dot colours are a category, not a status — worth saying, since
                green on a safety map otherwise reads as "fine". */}
            {showWorkers && (
              <>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-text-muted">
                  <span className="w-2 h-2 rounded-full bg-accent" /> Contractor
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-text-muted">
                  <span className="w-2 h-2 rounded-full bg-brand" /> Staff
                </span>
              </>
            )}
            {showInfra && (
              <>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-text-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-white" /> Bridgeport gateway
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-text-muted">
                  <span className="w-2 h-2 rounded-full bg-slate-500 border border-white" /> Beacon
                </span>
              </>
            )}
          </span>
        </div>
      )}

      <div className="relative">
        <MapCanvas
          site={site}
          workers={workers}
          markers={markers}
          fitTo={fitTo}
          showWorkers={showWorkers}
          showInfra={showInfra}
          showMusterRadius={variant === 'muster'}
          selectedZoneId={selected?.type === 'zone' ? selected.id : null}
          height={height}
          paused={!visible}
          onZoneHover={setHoverZone}
          onSelect={handleSelect}
          onCursor={setCursor}
        />

        {/* The clicked-feature card. Pinned to the frame's top-left rather than
            tethered to the point: a tethered popup on a 3 km site spends half
            its life half off-screen, and the card's job is to be read, not to
            point. */}
        {selected && (
          <div className="absolute top-3 left-3 z-10">
            <MapFeatureCard feature={selected} onClose={() => setSelected(null)} />
          </div>
        )}

        {/* Cursor coordinate readout, carried from the console's map footer. */}
        <div className="absolute bottom-0 inset-x-0 h-7 flex items-center justify-end gap-3 sm:gap-4 pl-3 pr-14 bg-slate-900/80 text-white/85 text-[9.5px] sm:text-[10px] font-mono pointer-events-none rounded-b-xl overflow-hidden whitespace-nowrap">
          {cursor ? (
            <>
              <span className="hidden md:inline">Cell: ({cursor.x}, {cursor.y})</span>
              <span>Lat: {cursor.lat.toFixed(5)}</span>
              <span>Lng: {cursor.lng.toFixed(5)}</span>
            </>
          ) : (
            <span className="opacity-60 truncate">Move the cursor over the map for a position readout</span>
          )}
        </div>
      </div>

      <div className="mt-3 min-h-[34px]">
        {zone ? (
          <p className="text-[11.5px] text-text-muted leading-snug">
            <span className="font-semibold text-text">{zone.name}</span> ·{' '}
            <span className="capitalize">{zone.hazard} hazard</span> · {zone.people.toLocaleString()} people ·{' '}
            {zone.permits} permits{zone.highRiskPermits > 0 ? `, ${zone.highRiskPermits} high-risk` : ''}
          </p>
        ) : (
          <p className="text-[11px] text-text-subtle leading-snug">
            <Layers className="inline w-3 h-3 mr-1 -mt-0.5" />
            Click a zone, a person or a device for its record. Drag to pan, scroll to zoom, right-drag to rotate and tilt.
            {showWorkers ? ' Zoom past the density heat to resolve individual positions.' : ''}
          </p>
        )}
      </div>

      <ProvenanceLine
        className="mt-2"
        source="Permit-to-work system, gate access-control, location and tag data (vendor-agnostic)"
        freshness="under 1 minute ago"
      />
    </div>
  );
}
