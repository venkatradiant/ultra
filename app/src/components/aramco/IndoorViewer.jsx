/**
 * IndoorViewer — inside Unit 3, where the confined-space entry is happening.
 *
 * The 2D plan runs on the *same MapLibre engine* as the site map. IMDF is a data
 * format rather than a renderer — it is GeoJSON underneath — so the interior
 * needs no second dependency, and a real IMDF export could replace the fixture
 * without touching this file. That is why xeokit was rejected: it is a BIM model
 * loader, and with no model there is nothing for it to load.
 *
 * The 3D view is a separate, lazily-loaded scene. It only downloads three.js if
 * someone actually presses the toggle, which most of the time nobody does.
 *
 * What this view is for: the permit says continuous gas monitoring, a standby
 * person at the entry point, and a maximum of two entrants. On a list those are
 * three rows. In the space they are three positions you can check against each
 * other — which is the difference between reading a permit and verifying one.
 */
import { lazy, Suspense, useMemo, useState } from 'react';
import { Box, Map as MapIcon, Loader2 } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getIndoorGeo, getPermits } from '../../data/aramco/hse-gm';
import IllustrativeDataChip, { ProvenanceLine } from './IllustrativeDataChip';
import MaximizablePanel, { MaximizeButton } from '../common/MaximizablePanel';
import MapCanvas from './MapCanvas';

const IndoorScene3D = lazy(() => import('./IndoorScene3D'));

const FIXTURE_TONE = {
  compliant: { dot: 'bg-emerald-600', text: 'text-emerald-800' },
  attention: { dot: 'bg-amber-500', text: 'text-amber-800' },
  breached: { dot: 'bg-rose-700', text: 'text-rose-800' },
};

function el(html, className) {
  const node = document.createElement('div');
  node.className = className;
  node.innerHTML = html;
  return node;
}

export default function IndoorViewer({
  getter = getIndoorGeo,
  permitGetter = getPermits,
  height = '380px',
}) {
  const indoor = useAsyncData(getter);
  const permits = useAsyncData(permitGetter);
  const [mode, setMode] = useState('2d');

  const markers = useMemo(() => {
    if (!indoor || typeof document === 'undefined') return [];
    const out = [];

    indoor.features
      .filter((f) => f.properties.kind === 'unit')
      .forEach((f) => {
        const ring = f.geometry.coordinates[0];
        const cx = (ring[0][0] + ring[2][0]) / 2;
        const cy = (ring[0][1] + ring[2][1]) / 2;
        out.push({
          lngLat: [cx, cy],
          element: el(
            `<span class="text-[9.5px] font-semibold leading-none">${f.properties.name}</span>`,
            'pointer-events-none select-none text-text/80 whitespace-nowrap px-1 text-center max-w-[110px]',
          ),
        });
      });

    indoor.features
      .filter((f) => f.properties.kind === 'fixture' || f.properties.kind === 'opening')
      .forEach((f) => {
        const p = f.properties;
        const tone = p.state === 'attention' ? 'bg-amber-500' : p.state === 'breached' ? 'bg-rose-700' : 'bg-emerald-600';
        out.push({
          lngLat: f.geometry.coordinates,
          // The fixture dot stays on its true position; only the label is
          // nudged. `labelOffset` is authored in the fixture so the layout
          // decision lives with the geometry it belongs to.
          offset: p.labelOffset,
          element: el(
            `<span class="flex items-center gap-1">
               <span class="w-2.5 h-2.5 rounded-full ${p.kind === 'opening' ? 'bg-slate-700' : tone} border-2 border-white shadow flex-shrink-0"></span>
               <span class="text-[9px] font-semibold text-text bg-surface/90 rounded px-1 py-0.5 border border-border-subtle whitespace-nowrap">${p.name}</span>
             </span>`,
            'pointer-events-none select-none',
          ),
        });
      });

    indoor.features
      .filter((f) => f.properties.kind === 'occupant')
      .forEach((f) => {
        out.push({
          lngLat: f.geometry.coordinates,
          element: el(
            `<span class="flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white text-[9px] font-bold border-2 border-white shadow">${f.properties.id.replace('E-', '')}</span>`,
            'pointer-events-none select-none',
          ),
        });
      });

    return out;
  }, [indoor]);

  if (!indoor) return null;

  const cs = permits?.confinedSpace;
  const fixtures = indoor.features.filter((f) => f.properties.kind === 'fixture');
  const occupants = indoor.features.filter((f) => f.properties.kind === 'occupant');
  const level = indoor.features.find((f) => f.properties.kind === 'level');

  return (
    <MaximizablePanel className="p-4 sm:p-5" label="Confined-space entry">
      {({ maximized }) => {
      // The confined space is the one view where the vertical relationship —
      // entrants below the deck, standby above at the manway — is the whole
      // point, and it is the first thing a 380-pixel frame flattens away.
      const frameHeight = maximized ? 'min(74vh, 900px)' : height;
      return (
        <>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold text-text tracking-tight">
            Inside {cs?.zoneName || 'Unit 3'} — {indoor.metadata?.permitId || 'CS-1182'}
          </h3>
          <p className="text-[11px] text-text-subtle mt-0.5">
            {level?.properties.name} · {occupants.length} of {cs?.occupancy?.max ?? 2} entrants inside ·{' '}
            {fixtures.length} monitored conditions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border overflow-hidden">
            {[
              { id: '2d', label: 'Plan', icon: MapIcon },
              { id: '3d', label: '3D', icon: Box },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                  mode === id ? 'bg-brand text-white' : 'bg-surface-2 text-text-muted hover:text-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
          <IllustrativeDataChip note="Invented interior geometry. Authored in IMDF feature shape." />
          <MaximizeButton />
        </div>
      </div>

      {mode === '2d' ? (
        <MapCanvas
          site={indoor}
          indoor={indoor}
          markers={markers}
          height={frameHeight}
          showWorkers={false}
        />
      ) : (
        <Suspense
          fallback={
            <div
              style={{ height: frameHeight }}
              className="w-full rounded-xl border border-border-subtle bg-surface-2 flex items-center justify-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin text-text-subtle" />
              <span className="text-[11px] text-text-subtle">Loading the 3D view…</span>
            </div>
          }
        >
          <IndoorScene3D indoor={indoor} height={frameHeight} />
        </Suspense>
      )}

      {/* The permit conditions, positioned rather than listed. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
        {fixtures.map((f) => {
          const tone = FIXTURE_TONE[f.properties.state] || FIXTURE_TONE.compliant;
          return (
            <div key={f.properties.id} className="rounded-xl border border-border-subtle bg-surface-2/40 p-3 min-w-0">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-text leading-snug">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tone.dot}`} />
                {f.properties.name}
              </p>
              <p className="text-[10.5px] text-text-muted mt-1 leading-snug">{f.properties.detail}</p>
            </div>
          );
        })}
      </div>

      <ProvenanceLine
        className="mt-3"
        source="Permit-to-work system, location and tag data (vendor-agnostic), fixed gas detection, entry camera"
        freshness="under 1 minute ago"
        note="Interior authored in IMDF feature shape (level / unit / opening / fixture / occupant) and rendered through the same map engine as the site view."
      />
        </>
      );
      }}
    </MaximizablePanel>
  );
}
