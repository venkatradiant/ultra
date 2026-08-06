/**
 * MapCanvas — the site GIS engine.
 *
 * MapLibre GL rendering a *locally authored* style: a `background` layer plus
 * inline GeoJSON sources. There is no tile server, no sprite, no glyph URL and
 * no API key, so the map makes **zero network requests**. That is deliberate and
 * load-bearing — the rest of this app fetches nothing from third parties, and a
 * keyed tile provider would have been the first thing to break that.
 *
 * Two consequences of going glyph-free, both intentional:
 *   • No `symbol` layers. MapLibre's text rendering needs font PBFs fetched from
 *     a `glyphs` URL. Labels are HTML `Marker`s instead, which also means they
 *     inherit Tailwind and the theme rather than needing their own colour pipe.
 *   • No icons. Markers are styled divs.
 *
 * Colours come from the theme's CSS custom properties, resolved to literals via
 * `resolveColor` — WebGL cannot read `var()`. The style is rebuilt when the
 * active client changes, because a long-lived GL context otherwise keeps the
 * previous tenant's palette.
 */
import { useEffect, useRef, useState, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { resolveColors } from '../../lib/resolveColor';

/** Hazard tints. Kept literal rather than themed: on a safety product these read
 *  as hazard severity, not as brand, and must not drift when a client re-skins. */
const HAZARD = {
  high: { fill: '#DC2626', line: '#991B1B' },
  medium: { fill: '#D97706', line: '#92400E' },
  low: { fill: '#64748B', line: '#475569' },
};

/** Site boundary red, carried from the deployed RTLS console's Site View. */
const BOUNDARY = '#EF4444';

/** RTLS estate. Gateways read darker than the beacons they aggregate. */
const INFRA = { gateway: '#1E293B', beacon: '#475569', degraded: '#D97706' };

/** Frame padding, in pixels. Generous on purpose: HTML markers are anchored to a
 *  point but drawn as pills that extend beyond it, and several carry a vertical
 *  offset to clear the zone labels — a tight fit clipped the southernmost muster
 *  pin against the bottom edge. */
const FIT_PADDING = 40;

/** Bounds of the authored site, so the initial camera frames it exactly. */
function boundsOf(geo) {
  let minX = 180, minY = 90, maxX = -180, maxY = -90;
  const visit = (coords) => {
    if (typeof coords[0] === 'number') {
      minX = Math.min(minX, coords[0]); maxX = Math.max(maxX, coords[0]);
      minY = Math.min(minY, coords[1]); maxY = Math.max(maxY, coords[1]);
      return;
    }
    coords.forEach(visit);
  };
  geo.features.forEach((f) => visit(f.geometry.coordinates));
  return [[minX, minY], [maxX, maxY]];
}

function buildStyle(site, workers, indoor, c) {
  const sources = {
    // `generateId` gives every feature a stable numeric id equal to its index
    // in the collection. Without it `setFeatureState` has nothing to key on and
    // the hover and selection highlights silently do nothing.
    site: { type: 'geojson', data: site, generateId: true },
    workers: { type: 'geojson', data: workers || { type: 'FeatureCollection', features: [] } },
  };
  if (indoor) sources.indoor = { type: 'geojson', data: indoor };

  return {
    version: 8,
    // No `glyphs`, no `sprite` — that is what keeps this offline.
    sources,
    layers: [
      // Interiors get a darker ground so the building slab reads as a lit floor
      // inside a dark surround, which is how a floor plan is normally drawn.
      { id: 'bg', type: 'background', paint: { 'background-color': indoor ? '#CBD5E1' : c.bg } },

      { id: 'perimeter-fill', type: 'fill', source: 'site',
        filter: ['==', ['get', 'kind'], 'perimeter'],
        paint: { 'fill-color': c.surface, 'fill-opacity': 0.9 } },
      // Site boundary in RTLS red with its vertices exposed, the way the
      // deployed console draws a configured boundary. It reads as a surveyed
      // edge someone drew and can re-drag, not as decorative page furniture —
      // which is exactly what it is.
      { id: 'perimeter-line', type: 'line', source: 'site',
        filter: ['==', ['get', 'kind'], 'perimeter'],
        paint: { 'line-color': BOUNDARY, 'line-width': 2.4 } },
      { id: 'perimeter-vertex', type: 'circle', source: 'site',
        filter: ['==', ['get', 'kind'], 'perimeter'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 2.4, 17, 4],
          'circle-color': '#FFFFFF',
          'circle-stroke-width': 1.6,
          'circle-stroke-color': BOUNDARY,
        } },

      { id: 'zone-fill', type: 'fill', source: 'site',
        filter: ['==', ['get', 'kind'], 'zone'],
        paint: {
          'fill-color': ['match', ['get', 'hazard'],
            'high', HAZARD.high.fill, 'medium', HAZARD.medium.fill, HAZARD.low.fill],
          'fill-opacity': ['case',
            ['boolean', ['feature-state', 'selected'], false], 0.3,
            ['boolean', ['feature-state', 'hover'], false], 0.22,
            0.1],
        } },
      // Dashed zone borders, again from the console: a zone is a soft
      // geofence rather than a wall, and a dashed edge says so.
      { id: 'zone-line', type: 'line', source: 'site',
        filter: ['==', ['get', 'kind'], 'zone'],
        paint: {
          'line-color': ['match', ['get', 'hazard'],
            'high', HAZARD.high.line, 'medium', HAZARD.medium.line, HAZARD.low.line],
          'line-width': ['case',
            ['boolean', ['feature-state', 'selected'], false], 2.8,
            ['boolean', ['feature-state', 'hover'], false], 2.4,
            1.4],
          'line-dasharray': [3, 2],
        } },

      // Muster catchment rings. Drawn under everything operational so they
      // frame rather than obscure — the ring answers "who is inside it".
      { id: 'muster-radius-fill', type: 'fill', source: 'site',
        filter: ['==', ['get', 'kind'], 'musterRadius'],
        layout: { visibility: 'none' },
        paint: { 'fill-color': '#EAB308', 'fill-opacity': 0.18 } },
      { id: 'muster-radius-line', type: 'line', source: 'site',
        filter: ['==', ['get', 'kind'], 'musterRadius'],
        layout: { visibility: 'none' },
        paint: { 'line-color': '#CA8A04', 'line-width': 1.4, 'line-dasharray': [4, 3] } },

      { id: 'road', type: 'line', source: 'site',
        filter: ['==', ['get', 'kind'], 'road'],
        paint: { 'line-color': c.border, 'line-width': ['interpolate', ['linear'], ['zoom'], 13, 1.5, 18, 9] } },
      { id: 'piperack', type: 'line', source: 'site',
        filter: ['==', ['get', 'kind'], 'piperack'],
        paint: { 'line-color': c.textSubtle, 'line-width': 2.5, 'line-dasharray': [2, 1.5], 'line-opacity': 0.8 } },
      { id: 'jetty', type: 'line', source: 'site',
        filter: ['==', ['get', 'kind'], 'jetty'],
        paint: { 'line-color': c.textSubtle, 'line-width': 5, 'line-opacity': 0.9 } },

      { id: 'tank-fill', type: 'fill', source: 'site',
        filter: ['==', ['get', 'kind'], 'tank'],
        paint: { 'fill-color': c.surface2, 'fill-opacity': 0.95 } },
      { id: 'tank-line', type: 'line', source: 'site',
        filter: ['==', ['get', 'kind'], 'tank'],
        paint: { 'line-color': c.textSubtle, 'line-width': 1 } },

      // Columns and drums inside the units. Kept faint on purpose: they give the
      // units texture so they do not read as empty rectangles, but at any
      // stronger opacity they compete with the worker dots for "is that a person?"
      { id: 'structure', type: 'fill', source: 'site',
        filter: ['==', ['get', 'kind'], 'structure'],
        paint: { 'fill-color': c.textSubtle, 'fill-opacity': 0.18 } },
      { id: 'building', type: 'fill', source: 'site',
        filter: ['in', ['get', 'kind'], ['literal', ['building', 'berth']]],
        paint: { 'fill-color': c.textSubtle, 'fill-opacity': 0.5 } },

      // Worker density. MapLibre's own heatmap handles 2,400 points without
      // deck.gl; it fades out as you zoom in and the individual dots take over,
      // which is the read an RTLS operator expects.
      { id: 'worker-heat', type: 'heatmap', source: 'workers',
        maxzoom: 16,
        paint: {
          // Tuned down hard. 2,412 points inside a 3 km site saturate instantly
          // at default weight, and a solid amber wash hides the hazard tints
          // underneath — which are the thing the map is actually for. Low weight
          // plus a late colour ramp means only genuine concentrations go warm,
          // and the zones stay readable through the wash.
          'heatmap-weight': 0.35,
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 12, 0.4, 16, 1],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 12, 5, 16, 15],
          // Clean handoff, no overlap band. The site fits the viewport around
          // z15, so the default view must be heat-only — 2,412 individual dots
          // across 3 km is noise, not information. Dots take over only once you
          // are close enough for one dot to mean one person.
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 15.6, 0.65, 16.2, 0],
          'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.25, c.heat1, 0.5, c.heat2, 0.78, c.heat3, 1, c.heat4],
        } },
      { id: 'worker-dot', type: 'circle', source: 'workers',
        minzoom: 15.6,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 15.6, 1.8, 19, 5],
          'circle-color': ['match', ['get', 'role'], 'contractor', c.accent, c.brand],
          'circle-opacity': ['interpolate', ['linear'], ['zoom'], 15.8, 0, 16.4, 0.9],
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 17, 0, 19, 0.7],
          'circle-stroke-color': '#FFFFFF',
        } },

      // The RTLS estate itself — gateways and beacons. Off by default because
      // the GM's question is about people, but one toggle away, because the
      // first challenge any RTLS demo gets is "how do you know that?" and the
      // answer is a map of the hardware that reports it.
      { id: 'infra-dot', type: 'circle', source: 'site',
        filter: ['==', ['get', 'kind'], 'infra'],
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 3,
            17, ['case', ['==', ['get', 'deviceType'], 'Bridgeport'], 7, 5]],
          'circle-color': ['case',
            ['==', ['get', 'status'], 'degraded'], INFRA.degraded,
            ['==', ['get', 'deviceType'], 'Bridgeport'], INFRA.gateway,
            INFRA.beacon],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.95,
        } },

      // Invisible, generous hit targets for the point features whose visible
      // form is an HTML marker. Markers are pointer-events-none so they never
      // eat a map drag, so the click has to land on the map instead.
      { id: 'point-hit', type: 'circle', source: 'site',
        filter: ['in', ['get', 'kind'], ['literal', ['muster', 'gate', 'flagged']]],
        paint: { 'circle-radius': 14, 'circle-opacity': 0 } },

      // Indoor layers carry their own palette rather than the outdoor surface
      // tokens. Reusing those gave a white floor on a near-white page and a
      // light-grey wall on top of it — everything rendered, nothing was
      // visible. A floor plan needs the building to sit *against* its
      // surroundings, so the slab is bright, the walls are dark, and the
      // restricted volume is unmistakably red.
      ...(indoor ? [
        { id: 'indoor-footprint', type: 'fill', source: 'indoor',
          filter: ['==', ['get', 'kind'], 'footprint'],
          paint: { 'fill-color': '#FFFFFF', 'fill-opacity': 1 } },
        { id: 'indoor-unit-fill', type: 'fill', source: 'indoor',
          filter: ['==', ['get', 'kind'], 'unit'],
          paint: {
            'fill-color': ['case', ['get', 'restricted'], HAZARD.high.fill, '#E2E8F0'],
            'fill-opacity': ['case', ['get', 'restricted'], 0.2, 0.85],
          } },
        { id: 'indoor-unit-line', type: 'line', source: 'indoor',
          filter: ['==', ['get', 'kind'], 'unit'],
          paint: {
            'line-color': ['case', ['get', 'restricted'], HAZARD.high.line, '#64748B'],
            'line-width': ['case', ['get', 'restricted'], 2.5, 1.5],
            'line-dasharray': ['case', ['get', 'restricted'], ['literal', [2, 1.2]], ['literal', [1, 0]]],
          } },
        { id: 'indoor-footprint-line', type: 'line', source: 'indoor',
          filter: ['==', ['get', 'kind'], 'footprint'],
          paint: { 'line-color': '#334155', 'line-width': 3 } },
      ] : []),
    ],
  };
}

/**
 * @param {object} props
 * @param {object} props.site GeoJSON FeatureCollection — the facility.
 * @param {object} [props.workers] GeoJSON FeatureCollection — live positions.
 * @param {object} [props.indoor] GeoJSON FeatureCollection — an interior level.
 * @param {Array} [props.markers] `[{ id, lngLat, render }]` HTML overlay markers.
 * @param {object} [props.fitTo] GeoJSON to frame instead of the whole site.
 * @param {number} [props.pitch]
 * @param {boolean} [props.showWorkers]
 * @param {boolean} [props.interactive]
 * @param {string} [props.height]
 * @param {(id: string|null) => void} [props.onZoneHover]
 * @param {(feature: object|null) => void} [props.onSelect] Clicked feature.
 * @param {(pos: object|null) => void} [props.onCursor] Cursor lat/lng readout.
 * @param {boolean} [props.showInfra] Render the RTLS gateway/beacon estate.
 * @param {boolean} [props.showMusterRadius] Render muster catchment rings.
 * @param {string|null} [props.selectedZoneId]
 * @param {boolean} [props.paused] Freeze and release the GL context.
 */
export default function MapCanvas({
  site,
  workers,
  indoor,
  markers = [],
  fitTo,
  pitch = 0,
  showWorkers = true,
  interactive = true,
  height = '420px',
  onZoneHover,
  onSelect,
  onCursor,
  showInfra = false,
  showMusterRadius = false,
  selectedZoneId = null,
  paused = false,
}) {
  const holder = useRef(null);
  const map = useRef(null);
  const markerRefs = useRef([]);
  const hovered = useRef(null);
  const [ready, setReady] = useState(false);

  // WebGL cannot read CSS custom properties, so the palette is resolved to
  // literals once per mount. `resolveColors` shares one probe element.
  const colors = useMemo(() => resolveColors({
    bg: 'var(--color-bg)',
    surface: 'var(--color-surface)',
    surface2: 'var(--color-surface-2)',
    border: 'var(--color-border)',
    textSubtle: 'var(--color-text-subtle)',
    brand: 'var(--color-brand)',
    accent: 'var(--color-accent)',
    // The density ramp is deliberately NOT themed, and deliberately single-hue.
    //
    // Two earlier attempts failed for the same reason: any cool colour at the
    // low end gives every cluster a blue halo, and a blue rim around a warm
    // centre reads as an island with a beach. On a site plan that is actively
    // misleading. A pale-to-deep amber thermal ramp reads as one thing only —
    // concentration of people — which is what it is.
    heat1: 'rgba(253, 230, 138, 0.45)',
    heat2: 'rgba(251, 191, 36, 0.75)',
    heat3: 'rgba(217, 119, 6, 0.9)',
    heat4: 'rgba(154, 52, 18, 0.95)',
  }), []);

  useEffect(() => {
    const node = holder.current;
    if (!node || !site || paused) return undefined;

    const m = new maplibregl.Map({
      container: node,
      style: buildStyle(site, showWorkers ? workers : null, indoor, colors),
      bounds: boundsOf(fitTo || site),
      fitBoundsOptions: { padding: FIT_PADDING },
      pitch,
      attributionControl: false, // nothing to attribute: all geometry is ours
      interactive,
      // The style has no remote resources; this makes an accidental one fail
      // loudly in development rather than silently reaching the network.
      transformRequest: (url) => {
        if (import.meta.env.DEV) console.warn('[MapCanvas] unexpected network request', url);
        return { url };
      },
    });
    map.current = m;

    if (interactive) {
      // Bottom-right, matching the deployed console. It also keeps the top-right
      // corner clear, which is where markers near the site's north-east edge
      // were colliding with the zoom buttons.
      m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
      m.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-left');
    }
    m.dragRotate.enable();

    m.on('load', () => setReady(true));

    // Dev-only handle. The zoom at which the heat/dot crossfade happens is
    // tuned by eye, and without this there is no way to check what zoom the
    // default fit actually lands on.
    if (import.meta.env.DEV) window.__tlMap = m;

    if (onZoneHover) {
      m.on('mousemove', 'zone-fill', (e) => {
        const f = e.features?.[0];
        if (!f) return;
        if (hovered.current !== null) m.setFeatureState({ source: 'site', id: hovered.current }, { hover: false });
        hovered.current = f.id;
        m.setFeatureState({ source: 'site', id: f.id }, { hover: true });
        m.getCanvas().style.cursor = 'pointer';
        onZoneHover(f.properties.id);
      });
      m.on('mouseleave', 'zone-fill', () => {
        if (hovered.current !== null) m.setFeatureState({ source: 'site', id: hovered.current }, { hover: false });
        hovered.current = null;
        m.getCanvas().style.cursor = '';
        onZoneHover(null);
      });
    }

    // Click-to-inspect, the console's core map interaction. Order matters:
    // the smallest, most specific things are queried first so a worker dot
    // standing on a zone returns the person, not the polygon underneath.
    if (onSelect) {
      const HIT_ORDER = ['worker-dot', 'infra-dot', 'point-hit', 'zone-fill'];
      m.on('click', (e) => {
        const layers = HIT_ORDER.filter((id) => m.getLayer(id));
        const hits = m.queryRenderedFeatures(e.point, { layers });
        if (!hits.length) return onSelect(null);
        const first = HIT_ORDER.map((id) => hits.find((h) => h.layer.id === id)).find(Boolean);
        if (!first) return onSelect(null);
        return onSelect({
          layer: first.layer.id,
          properties: first.properties,
          coordinates: first.geometry?.type === 'Point'
            ? first.geometry.coordinates
            : [e.lngLat.lng, e.lngLat.lat],
        });
      });
      ['infra-dot', 'point-hit', 'worker-dot'].forEach((id) => {
        m.on('mouseenter', id, () => { m.getCanvas().style.cursor = 'pointer'; });
      });
    }

    // The cursor coordinate readout the console shows along the bottom of its
    // map. It looks like chrome and is not: on a location product it is the
    // standing reminder that everything on screen is a real position in a real
    // frame, not a picture. Cheap to render, and the first thing an RTLS
    // operator reaches for when asked "where exactly".
    if (onCursor) {
      m.on('mousemove', (e) => onCursor({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
        x: Math.round(e.point.x),
        y: Math.round(e.point.y),
      }));
      m.on('mouseout', () => onCursor(null));
    }

    // MapLibre sizes its canvas once at construction and afterwards only listens
    // for *window* resize. Our containers change width without the window
    // moving — the page's entry animation settles after mount, the chat column
    // reflows as turns arrive, the sidebar collapses. Without this the canvas
    // keeps its first-measured width and the map renders into part of its own
    // frame. Re-fit as well as resize, so the site stays framed rather than
    // cropped to whatever the initial aspect ratio implied.
    const fitGeo = fitTo || site;
    let raf = 0;
    const refit = () => {
      m.resize();
      m.fitBounds(boundsOf(fitGeo), { padding: FIT_PADDING, duration: 0 });
    };
    const ro = new ResizeObserver(() => {
      const w = node.clientWidth;
      const h = node.clientHeight;
      if (!w || !h) return;
      // Compare against the canvas rather than against the previous report.
      // The container is routinely narrower at construction than it ends up —
      // the page's entry animation is still settling — so the *first* report is
      // usually the one that matters, and a "skip the first" guard leaves the
      // canvas stuck at its initial width. Comparing to the canvas makes this
      // idempotent: it fires exactly when the two disagree.
      if (Math.abs(w - m.getCanvas().clientWidth) < 1) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        refit();
        // And again once the map settles. A fit applied while the style is
        // still loading gets overwritten by the constructor's own initial fit,
        // which left the site framed off-centre. `once('load')` is not a safe
        // hook for this — it never fires if load already happened — but `idle`
        // is raised every time the map comes to rest, so it always arrives.
        m.once('idle', refit);
      });
    });
    ro.observe(node);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      markerRefs.current.forEach((mk) => mk.remove());
      markerRefs.current = [];
      setReady(false);
      // remove() releases the WebGL context. Browsers cap concurrent contexts,
      // and a scrolling conversation can mount several maps, so this matters.
      m.remove();
      map.current = null;
    };
    // Rebuilt only on identity of the data/config, never on marker churn.
  }, [site, workers, indoor, showWorkers, interactive, pitch, colors, fitTo,
    onZoneHover, onSelect, onCursor, paused]);

  // Layer visibility toggles, applied without rebuilding the style — a style
  // rebuild drops the camera back to the initial fit, which is jarring when the
  // user has panned somewhere and just wants the beacons shown.
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    const set = (id, on) => {
      if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
    };
    set('infra-dot', showInfra);
    set('muster-radius-fill', showMusterRadius);
    set('muster-radius-line', showMusterRadius);
  }, [ready, showInfra, showMusterRadius]);

  // Selected-zone highlight. Tracked as feature-state rather than a paint
  // rebuild so the fill and the border can both react to one flag.
  const selectedRef = useRef(null);
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    if (selectedRef.current !== null) {
      m.setFeatureState({ source: 'site', id: selectedRef.current }, { selected: false });
      selectedRef.current = null;
    }
    if (!selectedZoneId) return;
    const idx = site.features.findIndex(
      (f) => f.properties.kind === 'zone' && f.properties.id === selectedZoneId,
    );
    if (idx < 0) return;
    selectedRef.current = idx;
    m.setFeatureState({ source: 'site', id: idx }, { selected: true });
  }, [ready, selectedZoneId, site]);

  // HTML markers, re-synced without touching the style. These carry the labels
  // that `symbol` layers would otherwise need remote glyphs for.
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    markerRefs.current.forEach((mk) => mk.remove());
    markerRefs.current = markers.map(({ lngLat, element, offset }) => {
      // `offset` lets a caller nudge a label off its anchor. Without it, the
      // fixtures in a 34 m room all land within a few pixels of each other and
      // their labels overlap into nonsense.
      const mk = new maplibregl.Marker({ element, anchor: 'center', offset: offset || [0, 0] })
        .setLngLat(lngLat)
        .addTo(m);
      return mk;
    });
  }, [markers, ready]);

  if (paused) {
    return (
      <div
        style={{ height }}
        className="w-full rounded-xl border border-border-subtle bg-surface-2 flex items-center justify-center"
      >
        <p className="text-[11px] text-text-subtle">Map paused — scroll back to resume</p>
      </div>
    );
  }

  // The bottom controls are lifted clear of the coordinate readout strip the
  // panel draws across the foot of the frame.
  return (
    <div
      ref={holder}
      style={{ height }}
      className="w-full rounded-xl border border-border-subtle overflow-hidden [&_.maplibregl-ctrl-group]:shadow-none [&_.maplibregl-ctrl-group]:border [&_.maplibregl-ctrl-group]:border-border-subtle [&_.maplibregl-ctrl-bottom-right]:mb-7 [&_.maplibregl-ctrl-bottom-left]:mb-7"
    />
  );
}

export { boundsOf };
