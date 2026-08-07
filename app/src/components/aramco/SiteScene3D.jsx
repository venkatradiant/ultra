/**
 * SiteScene3D — the whole refinery, in three dimensions.
 *
 * The site counterpart to IndoorScene3D, and built to the same rules: lazily
 * loaded so three.js only downloads when someone presses the toggle, vanilla
 * three rather than React Three Fiber (see that file's header for why), one
 * effect that builds, renders and disposes.
 *
 * What 3D earns on a *site* map, as opposed to inside a vessel: a refinery is a
 * vertical place. In plan, Unit 2 and the tank farm are two rectangles of
 * similar size. In elevation, one is a forest of 40-metre columns and the other
 * is a field of 18-metre drums, the flare stands over both, and the density
 * column above a unit says how many people are standing in all that steel. The
 * plan answers "where"; this answers "what does where look like".
 *
 * Three things make it more than a picture:
 *
 *  • **It extrudes the fixture, not a guess.** Every solid's `heightM` is
 *    authored in `scripts/generate-aramco-geo.mjs` and lives in site.geo.json,
 *    so the skyline is reviewable data and a real GIS export could carry its own.
 *
 *  • **Clicking works.** A raycast returns the same `{ layer, properties,
 *    coordinates }` shape MapCanvas emits, so SiteMapPanel's existing select
 *    handler and MapFeatureCard are reused untouched. The 3D view is a second
 *    camera on one model, not a second application.
 *
 *  • **The coordinate readout survives.** The cursor ray is intersected with the
 *    ground plane and inverted back to lon/lat. On a location product a view
 *    that cannot say where the pointer is has stopped being a map.
 *
 * The people layer is deliberately NOT 2,412 dots at site distance — the same
 * judgement the 2D map makes when it hides individual positions above zoom 15.6.
 * One column per zone, height by headcount, resolving into individual bodies
 * once the camera is close enough for one body to mean one person.
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RotateCcw } from 'lucide-react';
import { resolveColors } from '../../lib/resolveColor';
import projector from '../../lib/geoProject';

/** Hazard tints. Literal, and literal for the same reason as in MapCanvas: on a
 *  safety product these read as severity, not as brand, and must survive a
 *  client re-skin unchanged. */
const HAZARD = {
  high: { fill: 0xdc2626, line: 0x991b1b },
  medium: { fill: 0xd97706, line: 0x92400e },
  low: { fill: 0x64748b, line: 0x475569 },
};
const BOUNDARY = 0xef4444;
const STEEL = { tank: 0xcbd5e1, structure: 0xb6c2d1, rack: 0x94a3b8, road: 0xd7dde5 };

/** Density ramp, matching the 2D heatmap's single-hue amber. A cool low end put
 *  a blue halo around every cluster, which on a site plan reads as water. */
const DENSITY = [
  { at: 0, color: 0xfde68a },
  { at: 0.5, color: 0xfbbf24 },
  { at: 0.8, color: 0xf59e0b },
  { at: 1, color: 0xc2410c },
];

/** Camera distance, in metres, at which individual people replace the columns.
 *  The 3D analogue of the 2D map's zoom-15.6 heat/dot handoff, and tuned the
 *  same way — by eye, to the point where one marker can honestly stand for one
 *  person rather than for a smear of them. */
const DOT_DISTANCE = 1400;

function densityColor(ratio) {
  const t = Math.max(0, Math.min(1, ratio));
  let lo = DENSITY[0];
  let hi = DENSITY[DENSITY.length - 1];
  for (let i = 0; i < DENSITY.length - 1; i++) {
    if (t >= DENSITY[i].at && t <= DENSITY[i + 1].at) { lo = DENSITY[i]; hi = DENSITY[i + 1]; }
  }
  const span = hi.at - lo.at || 1;
  return new THREE.Color(lo.color).lerp(new THREE.Color(hi.color), (t - lo.at) / span);
}

/** Bounding-box centre of a polygon ring, which is how the 2D map places its
 *  zone labels — the two views therefore anchor to the same point. */
function ringCentre(ring) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  ring.forEach(([x, y]) => {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  });
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

/**
 * A text label as a screen-space sprite.
 *
 * `sizeAttenuation: false` keeps labels a constant size however far the camera
 * pulls back, which is what the 2D map's HTML markers do and what makes a label
 * legible on a 3 km site. `depthTest: false` keeps them out from behind the
 * steel — a name hidden inside a distillation column is a name nobody reads.
 */
function labelSprite(title, sub, { tone = '#0f172a', bg = 'rgba(255,255,255,0.92)', size = 1 } = {}) {
  const pad = 12;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 30px ui-sans-serif, system-ui, sans-serif';
  const titleW = ctx.measureText(title).width;
  ctx.font = '24px ui-sans-serif, system-ui, sans-serif';
  const subW = sub ? ctx.measureText(sub).width : 0;

  canvas.width = Math.ceil(Math.max(titleW, subW) + pad * 2);
  canvas.height = sub ? 82 : 50;

  ctx.fillStyle = bg;
  ctx.strokeStyle = 'rgba(100,116,139,0.55)';
  ctx.lineWidth = 2;
  const r = 10;
  const w = canvas.width; const h = canvas.height;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(w - r, 0); ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r); ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h); ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = tone;
  ctx.font = 'bold 30px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(title, w / 2, 34);
  if (sub) {
    ctx.font = '24px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(71,85,105,0.9)';
    ctx.fillText(sub, w / 2, 68);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture, sizeAttenuation: false, depthTest: false, transparent: true,
  });
  const sprite = new THREE.Sprite(material);
  /** three.js defines `position` as a non-writable property, so it is set on the
   *  vector rather than assigned over. Chaining keeps the call sites one line. */
  sprite.at = (x, y, z) => { sprite.position.set(x, y, z); return sprite; };
  // Scale is in normalized screen units when attenuation is off: 0.13 of the
  // viewport for a typical zone name, scaled by the caller for emphasis.
  const unit = 0.00042 * size;
  sprite.scale.set(w * unit, h * unit, 1);
  sprite.renderOrder = 10;
  return sprite;
}

/**
 * @param {object} props
 * @param {object} props.site GeoJSON FeatureCollection — the facility.
 * @param {object} [props.workers] GeoJSON FeatureCollection — live positions.
 * @param {'site'|'flagged'|'muster'} [props.variant]
 * @param {Array} [props.lastKnown] Muster's unaccounted groups.
 * @param {object} [props.fitTo] GeoJSON to frame instead of the whole site.
 * @param {boolean} [props.showWorkers] Density columns and individual people.
 * @param {boolean} [props.showFlagged]
 * @param {boolean} [props.showLabels]
 * @param {boolean} [props.showInfra] Gateways and beacons.
 * @param {string|null} [props.selectedZoneId]
 * @param {string} [props.height]
 * @param {(feature: object|null) => void} [props.onSelect]
 * @param {(id: string|null) => void} [props.onZoneHover]
 * @param {(pos: object|null) => void} [props.onCursor]
 */
export default function SiteScene3D({
  site,
  workers,
  variant = 'site',
  lastKnown = [],
  fitTo,
  showWorkers = true,
  showFlagged = true,
  showLabels = true,
  showInfra = false,
  selectedZoneId = null,
  height = '440px',
  onSelect,
  onZoneHover,
  onCursor,
}) {
  const holder = useRef(null);
  const scene = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [resolving, setResolving] = useState(false);

  // Callbacks live in refs so a parent re-render never rebuilds the scene. The
  // build is expensive — a few hundred meshes — and rebuilding it would also
  // throw away wherever the user had orbited to.
  const cbs = useRef({});
  cbs.current = { onSelect, onZoneHover, onCursor };

  // Layer state is applied twice on purpose: once at build time from this ref,
  // so a scene rebuilt for a new variant does not come back with every layer on,
  // and once in the effect below when a toggle is pressed.
  const toggles = useRef({});
  toggles.current = { showWorkers, showFlagged, showLabels, showInfra };

  // Auto-rotation stops for good the moment someone takes hold of the scene.
  //
  // It used to resume as soon as the pointer left the canvas, which made the
  // view feel like it was fighting back: you would line up an angle, move the
  // mouse to point at something, and the site would swing away from you. The
  // opening shot still turns on its own — that is what it is for — but the
  // first drag, zoom or pan hands the camera over, and `Reset view` gives it
  // back.
  const [controlled, setControlled] = useState(false);
  const idle = useRef(true);
  idle.current = !hovering && !controlled;

  // The scene's own handles, published by the effect so the chrome below can
  // reach into it without a rebuild.
  const api = useRef(null);

  // `lastKnown` is re-derived by the muster panel on every render, so its
  // identity is never stable. Rebuilding a few hundred meshes on each parent
  // render — and throwing away wherever the user had orbited to — because an
  // array was rebuilt with the same contents would be a real bug, so the effect
  // keys on the contents and reads the array through a ref.
  const lastKnownRef = useRef(lastKnown);
  lastKnownRef.current = lastKnown;
  const lastKnownKey = lastKnown.map((g) => `${g.count}:${g.priority}:${g.lastKnownPoint}`).join('|');

  useEffect(() => {
    const node = holder.current;
    if (!node || !site) return undefined;

    const colors = resolveColors({
      bg: 'var(--color-surface-2)',
      surface: 'var(--color-surface)',
      brand: 'var(--color-brand)',
      accent: 'var(--color-accent)',
    });

    const project = projector(site.features);
    /** lon/lat → scene metres. Z is negated so north is −Z, matching the way
     *  `rotateX(-90°)` lands an extruded polygon. */
    const xz = (lngLat) => { const [e, n] = project(lngLat); return [e, -n]; };
    const extent = project.extent || 500;

    const width = node.clientWidth || 800;
    const heightPx = node.clientHeight || 440;

    const sc = new THREE.Scene();
    sc.background = new THREE.Color(colors.bg);
    sc.fog = new THREE.Fog(colors.bg, extent * 2.6, extent * 6.5);

    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 1, extent * 12);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, heightPx);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    node.appendChild(renderer.domElement);

    sc.add(new THREE.HemisphereLight(0xffffff, 0xc9d3e0, 1.9));
    const sun = new THREE.DirectionalLight(0xffffff, 1.9);
    sun.position.set(extent * 0.7, extent * 1.3, extent * 0.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    // The shadow camera has to cover the whole site or half the plant casts
    // nothing and the lighting reads as broken rather than as flat.
    const s = extent * 1.4;
    sun.shadow.camera.left = -s; sun.shadow.camera.right = s;
    sun.shadow.camera.top = s; sun.shadow.camera.bottom = -s;
    sun.shadow.camera.far = extent * 4;
    sc.add(sun);
    sc.add(sun.target);

    const disposables = [];
    const track = (...things) => { things.forEach((t) => t && disposables.push(t)); };

    // Groups, so the panel's layer toggles are a `visible` flag rather than a
    // rebuild — the same reasoning as MapCanvas setting layout visibility
    // instead of restyling.
    const groups = {
      people: new THREE.Group(),
      flagged: new THREE.Group(),
      labels: new THREE.Group(),
      infra: new THREE.Group(),
    };
    Object.values(groups).forEach((g) => sc.add(g));
    groups.people.visible = toggles.current.showWorkers;
    groups.flagged.visible = toggles.current.showFlagged;
    groups.labels.visible = toggles.current.showLabels;
    groups.infra.visible = toggles.current.showInfra;

    const byKind = (k) => site.features.filter((f) => f.properties.kind === k);
    /** Meshes the raycaster is allowed to hit, in the priority MapCanvas uses. */
    const hits = { worker: [], infra: [], point: [], zone: [] };
    const zoneMeshes = new Map();

    // ─── Ground ───────────────────────────────────────────────────
    const perimeter = byKind('perimeter')[0];
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xe6eaef, roughness: 1 });
    track(groundMat);
    if (perimeter) {
      const ring = perimeter.geometry.coordinates[0].slice(0, -1).map(project);
      const shape = new THREE.Shape();
      ring.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
      const geo = new THREE.ShapeGeometry(shape);
      geo.rotateX(-Math.PI / 2);
      const pad = new THREE.Mesh(geo, groundMat);
      pad.receiveShadow = true;
      sc.add(pad);
      track(geo);

      // The boundary as a low translucent wall with a hard red top edge. The 2D
      // map draws this as a red line with its vertices exposed, because it is a
      // configured geofence someone can re-drag rather than page furniture; in
      // 3D the same fact reads as a fence.
      const fenceH = perimeter.properties.heightM || 3;
      const wallGeo = [];
      const pts = perimeter.geometry.coordinates[0].map(xz);
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, z1] = pts[i];
        const [x2, z2] = pts[i + 1];
        const len = Math.hypot(x2 - x1, z2 - z1);
        const plane = new THREE.PlaneGeometry(len, fenceH);
        plane.rotateY(Math.atan2(-(z2 - z1), x2 - x1));
        plane.translate((x1 + x2) / 2, fenceH / 2, (z1 + z2) / 2);
        wallGeo.push(plane);
      }
      wallGeo.forEach((g) => {
        const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
          color: BOUNDARY, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false,
        }));
        sc.add(mesh);
        track(g, mesh.material);
      });
      const topGeo = new THREE.BufferGeometry().setFromPoints(
        pts.map(([x, z]) => new THREE.Vector3(x, fenceH, z)),
      );
      const topMat = new THREE.LineBasicMaterial({ color: BOUNDARY });
      sc.add(new THREE.Line(topGeo, topMat));
      track(topGeo, topMat);
    }

    // ─── Zones ────────────────────────────────────────────────────
    // Hazard-tinted pads just above grade, with the dashed edge the 2D map uses:
    // a zone is a soft geofence, not a wall, and a dashed line says so in both
    // views.
    byKind('zone').forEach((f) => {
      const tint = HAZARD[f.properties.hazard] || HAZARD.low;
      const ring = f.geometry.coordinates[0].slice(0, -1).map(project);
      const shape = new THREE.Shape();
      ring.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
      const geo = new THREE.ShapeGeometry(shape);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({
        color: tint.fill, transparent: true, opacity: 0.16, depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 0.4;
      mesh.userData = {
        layer: 'zone-fill',
        properties: f.properties,
        coordinates: ringCentre(f.geometry.coordinates[0]),
        baseOpacity: 0.16,
      };
      sc.add(mesh);
      zoneMeshes.set(f.properties.id, mesh);
      hits.zone.push(mesh);
      track(geo, mat);

      const edgeGeo = new THREE.BufferGeometry().setFromPoints(
        f.geometry.coordinates[0].map((c) => { const [x, z] = xz(c); return new THREE.Vector3(x, 0.6, z); }),
      );
      const edgeMat = new THREE.LineDashedMaterial({ color: tint.line, dashSize: 26, gapSize: 18 });
      const edge = new THREE.Line(edgeGeo, edgeMat);
      edge.computeLineDistances();
      sc.add(edge);
      track(edgeGeo, edgeMat);

      if (f.properties.people > 0) {
        const [lx, lz] = xz(ringCentre(f.geometry.coordinates[0]));
        groups.labels.add(
          labelSprite(f.properties.short, `${f.properties.people.toLocaleString()} people`).at(lx, 8, lz),
        );
      }
    });

    // ─── Roads and pipe racks ─────────────────────────────────────
    const roadMat = new THREE.MeshStandardMaterial({ color: STEEL.road, roughness: 1 });
    const rackMat = new THREE.MeshStandardMaterial({ color: STEEL.rack, roughness: 0.8, metalness: 0.15 });
    track(roadMat, rackMat);
    const ribbon = (feature, { w, y, thickness, material, posts = false }) => {
      const pts = feature.geometry.coordinates.map(xz);
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, z1] = pts[i];
        const [x2, z2] = pts[i + 1];
        const len = Math.hypot(x2 - x1, z2 - z1);
        const geo = new THREE.BoxGeometry(len, thickness, w);
        geo.rotateY(Math.atan2(-(z2 - z1), x2 - x1));
        geo.translate((x1 + x2) / 2, y, (z1 + z2) / 2);
        const mesh = new THREE.Mesh(geo, material);
        mesh.receiveShadow = true;
        mesh.castShadow = y > 1;
        sc.add(mesh);
        track(geo);
        // A pipe rack floating on nothing reads as a bug. Legs every 90 m.
        if (posts) {
          const n = Math.max(1, Math.round(len / 90));
          for (let k = 0; k <= n; k++) {
            const t = k / n;
            const leg = new THREE.BoxGeometry(2.5, y, 2.5);
            leg.translate(x1 + (x2 - x1) * t, y / 2, z1 + (z2 - z1) * t);
            const legMesh = new THREE.Mesh(leg, material);
            legMesh.castShadow = true;
            sc.add(legMesh);
            track(leg);
          }
        }
      }
    };
    byKind('road').forEach((f) => ribbon(f, { w: 14, y: 0.2, thickness: 0.4, material: roadMat }));
    byKind('piperack').forEach((f) => ribbon(f, {
      w: 7, y: f.properties.heightM || 6, thickness: 1.4, material: rackMat, posts: true,
    }));
    byKind('jetty').forEach((f) => ribbon(f, {
      w: 18, y: f.properties.heightM || 2, thickness: 1.2, material: rackMat, posts: true,
    }));

    // ─── Plant ────────────────────────────────────────────────────
    // Tanks and process structures are authored as many-sided circles for the
    // plan; in elevation they are what they always were, so a true cylinder is
    // both cheaper and rounder than extruding the polygon.
    const cylinder = (f, { color, roughness = 0.6, metalness = 0.3 }) => {
      const [cx, cz] = xz(ringCentre(f.geometry.coordinates[0]));
      const r = f.properties.radiusM || 20;
      const h = f.properties.heightM || 10;
      const geo = new THREE.CylinderGeometry(r, r, h, 24);
      const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cx, h / 2, cz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      sc.add(mesh);
      track(geo, mat);
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(r, r * 0.02 + 0.2, 6, 24),
        new THREE.MeshStandardMaterial({ color: 0x8b98a8, roughness: 0.7 }),
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.set(cx, h, cz);
      sc.add(rim);
      track(rim.geometry, rim.material);
    };
    byKind('tank').forEach((f) => cylinder(f, { color: STEEL.tank, roughness: 0.45, metalness: 0.4 }));
    byKind('structure').forEach((f) => cylinder(f, { color: STEEL.structure, roughness: 0.6, metalness: 0.25 }));

    // Buildings and the berth extrude their real footprint — these are boxes in
    // the world too, so the polygon is the honest shape.
    const buildingMat = new THREE.MeshStandardMaterial({ color: colors.surface, roughness: 0.9 });
    track(buildingMat);
    [...byKind('building'), ...byKind('berth')].forEach((f) => {
      const ring = f.geometry.coordinates[0].slice(0, -1).map(project);
      const shape = new THREE.Shape();
      ring.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: f.properties.heightM || 8, bevelEnabled: false,
      });
      geo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geo, buildingMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      sc.add(mesh);
      track(geo);
      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x94a3b8 });
      sc.add(new THREE.LineSegments(edges, lineMat));
      track(edges, lineMat);
    });

    // The flare. Everyone looks for it on a refinery, and at 90 m it is the one
    // object that gives the rest of the site its scale.
    const flames = [];
    byKind('flare').forEach((f) => {
      const [x, z] = xz(f.geometry.coordinates);
      const h = f.properties.heightM || 90;
      const stack = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 4.5, h, 12),
        new THREE.MeshStandardMaterial({ color: 0x9aa6b4, roughness: 0.7, metalness: 0.3 }),
      );
      stack.position.set(x, h / 2, z);
      stack.castShadow = true;
      sc.add(stack);
      track(stack.geometry, stack.material);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(3.4, 16, 10),
        new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.85 }),
      );
      flame.position.set(x, h + 8, z);
      sc.add(flame);
      flames.push(flame);
      track(flame.geometry, flame.material);

      const glow = new THREE.PointLight(0xfb923c, 3, extent * 1.2, 2);
      glow.position.set(x, h + 10, z);
      sc.add(glow);
      groups.labels.add(labelSprite(f.properties.name).at(x, h + 26, z));
    });

    // ─── People ───────────────────────────────────────────────────
    // One column per zone, height by headcount and colour by how full the zone
    // is against its configured occupancy. This is the 3D reading of the 2D
    // heatmap, and it is deliberately the default: 2,412 dots across 3 km is
    // noise in either projection.
    const maxPeople = Math.max(...byKind('zone').map((f) => f.properties.people), 1);
    const columns = [];
    byKind('zone').forEach((f) => {
      const p = f.properties;
      if (!p.people) return;
      const [x, z] = xz(ringCentre(f.geometry.coordinates[0]));
      // Sized against the flare, which is the tallest authored thing on site at
      // 90 m: the busiest zone stands about twice the stack. Anything subtler
      // and the headline reading of this view — where the people are — loses to
      // the tank farm, which is only scenery.
      const h = 70 + (p.people / maxPeople) * 190;
      const geo = new THREE.CylinderGeometry(46, 46, h, 6);
      const mat = new THREE.MeshStandardMaterial({
        color: densityColor(p.occupancy ? p.people / p.occupancy : 0.5),
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        roughness: 0.85,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, h / 2 + 1, z);
      groups.people.add(mesh);
      columns.push(mesh);
      track(geo, mat);
    });

    // Individual bodies, one instanced mesh for all 2,412. Hidden until the
    // camera is close enough that one marker means one person.
    let workerMesh = null;
    const workerFeatures = workers?.features || [];
    if (workerFeatures.length) {
      const geo = new THREE.SphereGeometry(2.2, 6, 5);
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.5 });
      workerMesh = new THREE.InstancedMesh(geo, mat, workerFeatures.length);
      workerMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      const dummy = new THREE.Object3D();
      const staff = new THREE.Color(colors.brand);
      const contractor = new THREE.Color(colors.accent);
      workerFeatures.forEach((f, i) => {
        const [x, z] = xz(f.geometry.coordinates);
        dummy.position.set(x, 2.6, z);
        dummy.updateMatrix();
        workerMesh.setMatrixAt(i, dummy.matrix);
        workerMesh.setColorAt(i, f.properties.role === 'contractor' ? contractor : staff);
      });
      workerMesh.instanceMatrix.needsUpdate = true;
      if (workerMesh.instanceColor) workerMesh.instanceColor.needsUpdate = true;
      workerMesh.visible = false;
      workerMesh.userData = { layer: 'worker-dot' };
      groups.people.add(workerMesh);
      hits.worker.push(workerMesh);
      track(geo, mat);
    }

    // ─── Flagged jobs ─────────────────────────────────────────────
    // A beacon column, because the whole point of the flagged view is that these
    // three are findable from anywhere on site. The ground ring pulses; the
    // column does not, so the eye is drawn without the scene strobing.
    const pulses = [];
    if (variant !== 'muster') {
      byKind('flagged').forEach((f) => {
        const [x, z] = xz(f.geometry.coordinates);
        const h = 120;
        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(3.5, 3.5, h, 12, 1, true),
          new THREE.MeshBasicMaterial({
            color: 0xdc2626, transparent: true, opacity: 0.34,
            side: THREE.DoubleSide, depthWrite: false,
          }),
        );
        beam.position.set(x, h / 2, z);
        groups.flagged.add(beam);
        track(beam.geometry, beam.material);

        const head = new THREE.Mesh(
          new THREE.SphereGeometry(7, 16, 12),
          new THREE.MeshStandardMaterial({ color: 0xb91c1c, emissive: 0xdc2626, emissiveIntensity: 0.6 }),
        );
        head.position.set(x, h, z);
        head.userData = {
          layer: 'point-hit', properties: f.properties, coordinates: f.geometry.coordinates,
        };
        groups.flagged.add(head);
        hits.point.push(head);
        track(head.geometry, head.material);

        const ring = new THREE.Mesh(
          new THREE.RingGeometry(26, 34, 48),
          new THREE.MeshBasicMaterial({
            color: 0xdc2626, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false,
          }),
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 1.2, z);
        groups.flagged.add(ring);
        pulses.push(ring);
        track(ring.geometry, ring.material);

        groups.flagged.add(
          labelSprite(`${f.properties.rank}`, null, { bg: 'rgba(190,18,60,0.95)', tone: '#ffffff', size: 1.1 })
            .at(x, h + 16, z),
        );
      });
    }

    // ─── Gates, muster, last-known ────────────────────────────────
    const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    track(postMat);
    byKind('gate').forEach((f) => {
      const [x, z] = xz(f.geometry.coordinates);
      const geo = new THREE.BoxGeometry(6, 14, 6);
      const mesh = new THREE.Mesh(geo, postMat);
      mesh.position.set(x, 7, z);
      mesh.castShadow = true;
      mesh.userData = { layer: 'point-hit', properties: f.properties, coordinates: f.geometry.coordinates };
      sc.add(mesh);
      hits.point.push(mesh);
      track(geo);
      groups.labels.add(labelSprite(`⇥⇤ ${f.properties.name}`).at(x, 26, z));
    });

    if (variant === 'muster') {
      byKind('musterRadius').forEach((f) => {
        const ring = f.geometry.coordinates[0].slice(0, -1).map(project);
        const shape = new THREE.Shape();
        ring.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
        const geo = new THREE.ShapeGeometry(shape);
        geo.rotateX(-Math.PI / 2);
        const mat = new THREE.MeshBasicMaterial({
          color: 0xeab308, transparent: true, opacity: 0.2, depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 0.8;
        sc.add(mesh);
        track(geo, mat);
      });
      byKind('muster').forEach((f) => {
        const [x, z] = xz(f.geometry.coordinates);
        const geo = new THREE.CylinderGeometry(9, 9, 22, 12);
        const mat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 11, z);
        mesh.castShadow = true;
        mesh.userData = { layer: 'point-hit', properties: f.properties, coordinates: f.geometry.coordinates };
        sc.add(mesh);
        hits.point.push(mesh);
        track(geo, mat);
        groups.labels.add(
          labelSprite(f.properties.id, null, { bg: 'rgba(5,150,105,0.95)', tone: '#ffffff' }).at(x, 40, z),
        );
      });
      lastKnownRef.current.forEach((g) => {
        if (!g.lastKnownPoint) return;
        const [x, z] = xz(g.lastKnownPoint);
        const bg = g.priority === 'high' ? 'rgba(190,18,60,0.95)'
          : g.priority === 'medium' ? 'rgba(217,119,6,0.95)' : 'rgba(100,116,139,0.95)';
        groups.labels.add(
          labelSprite(`${g.count} · last known`, null, { bg, tone: '#ffffff' }).at(x, 58, z),
        );
      });
    }

    // ─── RTLS estate ──────────────────────────────────────────────
    // Off by default, one toggle away — the honest answer to "how do you know
    // where anyone is" is a map of the hardware that reports it, and in 3D that
    // hardware is on poles above the plant rather than dots underneath it.
    byKind('infra').forEach((f) => {
      const [x, z] = xz(f.geometry.coordinates);
      const gateway = f.properties.deviceType === 'Bridgeport';
      const poleH = gateway ? 26 : 18;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, poleH, 6), postMat);
      pole.position.set(x, poleH / 2, z);
      groups.infra.add(pole);
      track(pole.geometry);
      const headGeo = gateway ? new THREE.BoxGeometry(6, 5, 6) : new THREE.SphereGeometry(3, 10, 8);
      const headMat = new THREE.MeshStandardMaterial({
        color: f.properties.status === 'degraded' ? 0xd97706 : gateway ? 0x1e293b : 0x475569,
        emissive: f.properties.status === 'degraded' ? 0xd97706 : 0x000000,
        emissiveIntensity: 0.4,
        roughness: 0.6,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(x, poleH + 2, z);
      head.userData = { layer: 'infra-dot', properties: f.properties, coordinates: f.geometry.coordinates };
      groups.infra.add(head);
      hits.infra.push(head);
      track(headGeo, headMat);
    });

    // ─── Camera ───────────────────────────────────────────────────
    // Framed from the same geometry the 2D map fits, so pressing 3D keeps your
    // place rather than throwing you back to the whole site.
    const frame = fitTo?.features?.length ? fitTo : site;
    const fp = projector(frame.features);
    const target = new THREE.Vector3(0, 0, 0);
    {
      // `fp` is centred on the framed subset; its centre in *scene* space is
      // wherever that subset's centroid projects under the site's own origin.
      const c = fp.invert([0, 0]);
      const [tx, tz] = xz(c);
      target.set(tx, 0, tz);
    }
    const frameExtent = Math.max(fp.extent || extent, 120);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(target);

    // Frame by measuring rather than by guessing a distance.
    //
    // A multiplier of the site's extent cannot work here: the site is a wide,
    // flat slab, the panel is a wide, short box, and the tilt foreshortens the
    // depth by an amount that depends on the angle. Every constant that framed
    // the full site left the three flagged jobs as a postage stamp, or the
    // reverse. Projecting the framed geometry into clip space and dividing the
    // camera's offset by the overflow converges in two or three passes and is
    // correct for any subset, any aspect ratio and any camera angle.
    // How high the frame has to reach depends on what is actually drawn. With
    // the people layer on it is the tallest headcount column; with it off — the
    // flagged-jobs view, where the frame is only two units wide — reserving that
    // headroom anyway is what pushed the camera back until the three beacons
    // were specks.
    const frameCeiling = toggles.current.showWorkers ? 280 : 140;
    const framePoints = [];
    frame.features.forEach((f) => {
      const visit = (c) => {
        if (typeof c[0] === 'number') {
          const [x, z] = xz(c);
          framePoints.push(new THREE.Vector3(x, 0, z));
          // The tops matter too — a column of people or a beacon that pokes out
          // of frame is exactly what the 3D view was opened to see.
          framePoints.push(new THREE.Vector3(x, frameCeiling, z));
          return;
        }
        c.forEach(visit);
      };
      visit(f.geometry.coordinates);
    });
    // Held in clip space rather than pixels so a resize can re-apply the same
    // composition against the new canvas size.
    const viewShift = { x: 0, y: 0 };
    const applyViewShift = (w, h) => {
      if (!viewShift.x && !viewShift.y) return camera.clearViewOffset();
      return camera.setViewOffset(w, h, viewShift.x * (w / 2), -viewShift.y * (h / 2), w, h);
    };

    /** The opening angle. Everything else about the shot is measured. */
    const shotDir = new THREE.Vector3(0.62, 0.95, 0.8).normalize();
    const shotRight = new THREE.Vector3().crossVectors(shotDir, new THREE.Vector3(0, 1, 0)).normalize();
    const shotUp = new THREE.Vector3().crossVectors(shotRight, shotDir).normalize();

    /**
     * Frame the site by measuring it against the camera's own axes.
     *
     * An earlier version projected the geometry into clip space and divided the
     * camera's offset by the overflow until it fitted. It read well and was
     * wrong: `project()` on a point *behind* the camera divides by a negative w
     * and returns a coordinate hundreds of units outside the frustum, so a
     * single bad pass threw the camera to the far plane, the next pass measured
     * a sub-pixel site and collapsed it onto the target, and the loop
     * oscillated. Projecting the frame onto the camera's right/up/forward axes
     * instead has no such singularity: it is one pass, it cannot diverge, and
     * it also hands back the box centre the view offset needs.
     */
    const fitFrame = () => {
      if (!framePoints.length) return;
      const w = renderer.domElement.clientWidth || 1;
      const h = renderer.domElement.clientHeight || 1;

      const tanV = Math.tan((camera.fov / 2) * (Math.PI / 180));
      const tanH = tanV * camera.aspect;

      /**
       * What distance frames the site from one particular direction.
       *
       * Solved point by point rather than from the bounding box as a whole. A
       * point nearer the camera needs less lateral room than the same offset
       * far away, so pairing the widest point with the nearest depth — which is
       * what a box-plus-a-depth-margin does — pushes the camera much too far
       * back. On the flagged-jobs view, where the frame is two units inside a
       * 3 km site, that was the difference between filling the panel and
       * sitting in the middle of it.
       */
      const solve = (dirV, rightV, upV) => {
        let minR = Infinity, maxR = -Infinity;
        let minU = Infinity, maxU = -Infinity;
        let minD = Infinity, maxD = -Infinity;
        const rel = new THREE.Vector3();
        framePoints.forEach((p) => {
          rel.copy(p).sub(target);
          const r = rel.dot(rightV); const u = rel.dot(upV); const d = rel.dot(dirV);
          if (r < minR) minR = r; if (r > maxR) maxR = r;
          if (u < minU) minU = u; if (u > maxU) maxU = u;
          if (d < minD) minD = d; if (d > maxD) maxD = d;
        });
        const centreR = (minR + maxR) / 2;
        const centreU = (minU + maxU) / 2;
        let dist = 0;
        framePoints.forEach((p) => {
          rel.copy(p).sub(target);
          const dr = Math.abs(rel.dot(rightV) - centreR);
          const du = Math.abs(rel.dot(upV) - centreU);
          const need = Math.max(dr / tanH, du / tanV) / 0.93 + rel.dot(dirV);
          if (need > dist) dist = need;
        });
        return { dist, centreR, centreU, midD: (minD + maxD) / 2 };
      };

      // Fit the *worst* angle of the orbit, not the opening one. The camera
      // auto-rotates, and a site that is 1.7 times wider than it is deep needs
      // measurably more room once its long axis swings into the depth — framed
      // to the opening shot alone, the perimeter's corners left the frame about
      // a third of the way round. Sampling the turn costs one pass per step at
      // mount and about 15% of the opening zoom, and buys a composition that
      // never clips at any angle a presenter might leave it on.
      const opening = solve(shotDir, shotRight, shotUp);
      let dist = opening.dist;
      const spun = new THREE.Vector3();
      const spin = (v, c, s) => spun.set(v.x * c + v.z * s, v.y, -v.x * s + v.z * c).clone();
      for (let k = 1; k < 24; k++) {
        const a = (k * Math.PI) / 12;
        const c = Math.cos(a); const s = Math.sin(a);
        dist = Math.max(dist, solve(spin(shotDir, c, s), spin(shotRight, c, s), spin(shotUp, c, s)).dist);
      }

      camera.position.copy(target).addScaledVector(shotDir, dist);
      camera.lookAt(target);
      camera.updateMatrixWorld();

      // Centre by shifting the *projection*, not the camera or the orbit centre.
      //
      // A tilted view of a flat site lands off-centre in the frame with empty
      // sky on one side. Panning the camera fixes that but moves the point the
      // auto-orbit turns around, so the site then swings in and out of view;
      // sinking the orbit centre below grade fixes it too, until someone zooms
      // in and the camera dives at a point underground. A view offset slides the
      // rendered window over the frustum and leaves both the camera and the
      // target where they were, so the orbit still turns about the middle of the
      // plant at every zoom.
      // Composed for the opening shot, which is the one a presenter sees when
      // the toggle is pressed. It drifts a little as the scene turns, which is
      // the price of an orbit that stays centred on the plant.
      const depth = Math.max(dist - opening.midD, 1);
      viewShift.x = opening.centreR / (depth * tanH);
      viewShift.y = opening.centreU / (depth * tanV);
      applyViewShift(w, h);
      camera.updateProjectionMatrix();
    };
    fitFrame();

    // Once someone has orbited, the frame is theirs — a resize must not yank
    // the camera back to the opening shot mid-inspection.
    let userMoved = false;
    controls.addEventListener('start', () => {
      userMoved = true;
      setControlled(true);
    });

    api.current = {
      reset: () => {
        userMoved = false;
        setControlled(false);
        fitFrame();
        controls.update();
      },
    };
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = 1.45;          // never duck below the ground plane
    controls.minDistance = frameExtent * 0.18;
    controls.maxDistance = extent * 5;
    controls.autoRotateSpeed = 0.42;
    controls.update();

    // ─── Interaction ──────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 4 };
    const pointer = new THREE.Vector2();
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const groundHit = new THREE.Vector3();
    let hoveredZone = null;
    let down = null;
    let moved = false;

    const setPointer = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return rect;
    };

    /** The same precedence MapCanvas applies: the smallest, most specific thing
     *  under the cursor wins, so a person standing on a zone returns the person. */
    const pick = () => {
      const order = [
        ['worker', hits.worker.filter((m) => m.visible && m.parent?.visible)],
        ['infra', hits.infra.filter(() => groups.infra.visible)],
        ['point', hits.point.filter((m) => m.parent === sc || m.parent?.visible)],
        ['zone', hits.zone],
      ];
      for (const [, meshes] of order) {
        if (!meshes.length) continue;
        const found = raycaster.intersectObjects(meshes, false)[0];
        if (found) return found;
      }
      return null;
    };

    const onPointerMove = (e) => {
      const rect = setPointer(e);
      if (cbs.current.onCursor) {
        if (raycaster.ray.intersectPlane(ground, groundHit)) {
          const [lng, lat] = project.invert([groundHit.x, groundHit.z]);
          cbs.current.onCursor({
            lng, lat,
            x: Math.round(e.clientX - rect.left),
            y: Math.round(e.clientY - rect.top),
          });
        } else {
          cbs.current.onCursor(null);
        }
      }
      const zoneHit = raycaster.intersectObjects(hits.zone, false)[0];
      const id = zoneHit?.object.userData.properties.id || null;
      if (id !== hoveredZone) {
        if (hoveredZone) {
          const prev = zoneMeshes.get(hoveredZone);
          if (prev) prev.material.opacity = prev.userData.baseOpacity;
        }
        hoveredZone = id;
        if (id) {
          const next = zoneMeshes.get(id);
          if (next) next.material.opacity = next.userData.baseOpacity + 0.14;
        }
        cbs.current.onZoneHover?.(id);
      }
      renderer.domElement.style.cursor = pick() ? 'pointer' : '';
    };

    const onPointerDown = (e) => { down = [e.clientX, e.clientY]; moved = false; };
    const onPointerDrag = (e) => {
      if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) moved = true;
    };
    const onPointerUp = (e) => {
      const wasDrag = moved;
      down = null;
      moved = false;
      if (wasDrag || !cbs.current.onSelect) return;
      setPointer(e);
      const found = pick();
      if (!found) return cbs.current.onSelect(null);
      const { object, instanceId } = found;
      if (object.userData.layer === 'worker-dot') {
        const f = workerFeatures[instanceId];
        if (!f) return cbs.current.onSelect(null);
        return cbs.current.onSelect({
          layer: 'worker-dot', properties: f.properties, coordinates: f.geometry.coordinates,
        });
      }
      return cbs.current.onSelect({
        layer: object.userData.layer,
        properties: object.userData.properties,
        coordinates: object.userData.coordinates,
      });
    };
    const onPointerLeave = () => {
      cbs.current.onCursor?.(null);
      if (hoveredZone) {
        const prev = zoneMeshes.get(hoveredZone);
        if (prev) prev.material.opacity = prev.userData.baseOpacity;
        hoveredZone = null;
        cbs.current.onZoneHover?.(null);
      }
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointermove', onPointerDrag);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);

    // ─── Loop ─────────────────────────────────────────────────────
    let raf = 0;
    let t = 0;
    let dotsOn = null;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      t = now / 1000;
      controls.autoRotate = idle.current;
      controls.update();

      // The heat-to-dots handoff, by camera distance rather than by zoom. Both
      // views make the same promise: a marker only appears once it can honestly
      // stand for one person.
      const d = camera.position.distanceTo(controls.target);
      const close = d < DOT_DISTANCE;
      if (close !== dotsOn) {
        dotsOn = close;
        if (workerMesh) workerMesh.visible = close;
        columns.forEach((c) => { c.visible = !close; });
        setResolving(close);
      }

      pulses.forEach((ring, i) => {
        const k = (t * 0.6 + i * 0.33) % 1;
        ring.scale.setScalar(0.75 + k * 0.9);
        ring.material.opacity = 0.5 * (1 - k);
      });
      flames.forEach((f, i) => {
        f.scale.set(1, 0.85 + Math.sin(t * 6 + i) * 0.18, 1);
      });

      renderer.render(sc, camera);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      const w = node.clientWidth;
      const h = node.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      renderer.setSize(w, h);
      // The container is routinely narrower at construction than it ends up —
      // the page's entry animation is still settling — so the opening shot has
      // to be re-fitted once the panel reaches its real width, exactly as the
      // 2D map re-fits its bounds. Once someone has orbited the framing is
      // theirs, but the view offset is in pixels and still has to be restated
      // against the new size or the composition drifts.
      if (userMoved) applyViewShift(w, h);
      else fitFrame();
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(node);

    scene.current = { groups, zoneMeshes };

    // Dev-only handle. The camera framing and the column/dot handoff are both
    // tuned by eye, and without this there is no way to ask the scene what it
    // actually built — the same reason MapCanvas exposes its map.
    if (import.meta.env.DEV) window.__tlScene = { sc, camera, controls, groups, columns, hits, raycaster };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      api.current = null;
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointermove', onPointerDrag);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      controls.dispose();
      scene.current = null;
      // Sprite textures are the one thing `track` cannot see, since the sprite
      // owns its canvas — walk the tree for them.
      sc.traverse((obj) => {
        if (obj.isSprite) { obj.material.map?.dispose(); obj.material.dispose(); }
      });
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
      // Release the GL context rather than leaving it to the GC — browsers cap
      // concurrent contexts and a scrolling conversation mounts several maps.
      renderer.forceContextLoss?.();
      if (canvas.parentNode === node) node.removeChild(canvas);
    };
  }, [site, workers, variant, fitTo, lastKnownKey]);

  // Layer toggles, applied as group visibility rather than a rebuild — the same
  // reason MapCanvas sets layout visibility instead of restyling.
  useEffect(() => {
    const s = scene.current;
    if (!s) return;
    s.groups.people.visible = showWorkers;
    s.groups.flagged.visible = showFlagged;
    s.groups.labels.visible = showLabels;
    s.groups.infra.visible = showInfra;
  }, [showWorkers, showFlagged, showLabels, showInfra]);

  // Selected-zone highlight, kept in step with the 2D view's feature-state.
  useEffect(() => {
    const s = scene.current;
    if (!s) return undefined;
    const mesh = selectedZoneId && s.zoneMeshes.get(selectedZoneId);
    if (!mesh) return undefined;
    mesh.material.opacity = mesh.userData.baseOpacity + 0.24;
    return () => { mesh.material.opacity = mesh.userData.baseOpacity; };
  }, [selectedZoneId]);

  return (
    <div
      style={{ height }}
      className="relative w-full rounded-xl border border-border-subtle overflow-hidden bg-surface-2"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div ref={holder} className="absolute inset-0" />

      {/* Bottom-left, clear of two things: the feature card the panel pins to the
          top-left on a click, and the coordinate readout strip across the foot. */}
      <div className="absolute bottom-9 left-3 flex items-center gap-1.5">
        <p className="text-[10px] text-text-subtle bg-surface/85 rounded px-1.5 py-0.5 border border-border-subtle pointer-events-none">
          {controlled
            ? 'Your view'
            : hovering ? 'Rotation held' : 'Auto-rotating'}
          {' · '}
          {resolving ? 'individual positions' : 'headcount by zone'}
          {' · '}
          drag to orbit, right-drag to pan, scroll to zoom
        </p>
        {controlled && (
          <button
            type="button"
            onClick={() => api.current?.reset()}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-muted hover:text-brand bg-surface/85 rounded px-1.5 py-0.5 border border-border-subtle hover:border-brand/35 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset view
          </button>
        )}
      </div>
    </div>
  );
}
