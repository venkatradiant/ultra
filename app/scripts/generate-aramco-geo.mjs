/**
 * Generates the TrackLynk.AI site geometry fixtures.
 *
 * Run: node scripts/generate-aramco-geo.mjs
 *
 * The old site fixture had no coordinate system — zones were hand-placed x/y/w/h
 * in a 1200x700 SVG viewBox, and flagged-job markers carried their own absolute
 * coordinates independent of their zoneId, so moving a zone silently orphaned
 * its markers. Everything here is derived instead: markers are placed *from*
 * their zone, so the two cannot drift apart.
 *
 * DATA POSTURE — read before changing anything:
 *   The facility is INVENTED. It is not a real Aramco site, and the geographic
 *   anchor below is a deliberately round number in the open Gulf chosen to be
 *   obviously synthetic rather than surveyed. Nothing on screen reveals a
 *   location — the demo ships no basemap imagery — so these coordinates exist
 *   only so the map engine has a real projection to work in, and so a live
 *   location feed could later replace the fixture without a reprojection.
 *
 * Deterministic: a seeded PRNG, so re-running produces byte-identical output and
 * the worker positions never shuffle between demo runs.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'aramco', 'hse-gm');
mkdirSync(OUT, { recursive: true });

// ─── Seeded PRNG ────────────────────────────────────────────────
// mulberry32 — small, fast, and stable across Node versions, which matters
// because the fixture is committed and must not churn.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Projection ─────────────────────────────────────────────────
// The old viewBox was 1200x700 with a 150-unit "250 m" scale bar, i.e. about
// 1.67 m per unit — a 2.0 x 1.17 km site. That is small for a 400,000 bpd
// complex, so the site is scaled to 3.2 x 1.87 km, which is in the right range
// for the capacity the narrative claims.
const ANCHOR = { lon: 50.0, lat: 26.5 }; // deliberately round; see posture note
const VIEW = { w: 1200, h: 700 };
const SITE_M = { w: 3200, h: 1867 };
const M_PER_DEG_LAT = 110574;
const M_PER_DEG_LON = 111320 * Math.cos((ANCHOR.lat * Math.PI) / 180);

/** SVG viewBox units → [lon, lat]. Y is flipped: SVG grows down, latitude up. */
function pt(x, y) {
  const eastM = (x / VIEW.w) * SITE_M.w;
  const northM = ((VIEW.h - y) / VIEW.h) * SITE_M.h;
  return [
    +(ANCHOR.lon + eastM / M_PER_DEG_LON).toFixed(6),
    +(ANCHOR.lat + northM / M_PER_DEG_LAT).toFixed(6),
  ];
}

/** Axis-aligned rectangle in viewBox units → a closed GeoJSON ring. */
function rect(x, y, w, h) {
  return [[pt(x, y), pt(x + w, y), pt(x + w, y + h), pt(x, y + h), pt(x, y)]];
}

/** Regular polygon approximating a circle — used for storage tanks. */
function circle(cx, cy, r, sides = 24) {
  const ring = [];
  for (let i = 0; i <= sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    ring.push(pt(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
  }
  return [ring];
}

// ─── Heights ────────────────────────────────────────────────────
// Every solid on site carries a `heightM` in real metres, because the 3D view
// extrudes the *fixture* rather than guessing from `kind` at render time. Two
// reasons that matters: a real GIS export would carry its own heights and must
// be able to override these, and a height buried in a renderer is a number no
// one can review. The figures below are ordinary refinery proportions, not
// surveyed ones — the facility is invented, and so is its skyline.
const HEIGHT = {
  fence: 3,          // perimeter fence
  road: 0,           // painted on grade
  piperack: 6,       // rack deck above grade
  tankNorth: 18,     // crude storage, the taller farm
  tankSouth: 14,     // product storage
  buildingLow: 8,    // admin blocks
  buildingTall: 12,  // control room
  jetty: 2,
  berth: 4,
  flare: 90,         // the stack, visible from anywhere on site
};

const feat = (geometry, properties) => ({ type: 'Feature', geometry, properties });
const poly = (coordinates, properties) => feat({ type: 'Polygon', coordinates }, properties);
const line = (pts, properties) => feat({ type: 'LineString', coordinates: pts.map(([x, y]) => pt(x, y)) }, properties);
const point = (x, y, properties) => feat({ type: 'Point', coordinates: pt(x, y) }, properties);

// ─── Zones ──────────────────────────────────────────────────────
// Carried over verbatim from siteData.json so every headcount, permit count and
// hazard level stays exactly as the conversation script quotes it.
//
// `zoneType`, `occupancy` and `icon` mirror the fields the deployed TrackLynk
// (Synapse) RTLS console asks for when a zone is created — Zone Type,
// Occupancy, Zone Name, Description, Zone Icon, Zone Color. Carrying the same
// vocabulary means the zone card on the map reads the way an operator who
// already uses that console expects it to, instead of inventing a parallel
// model for the same object.
const ZONES = [
  { id: 'Z1', name: 'Unit 1 — Crude Distillation', short: 'Unit 1', hazard: 'high', zoneType: 'Work Place', icon: 'hazard', occupancy: 400, x: 70, y: 96, w: 250, h: 170, people: 310, permits: 62, highRiskPermits: 9 },
  { id: 'Z2', name: 'Unit 2 — Hydrocracker', short: 'Unit 2', hazard: 'high', zoneType: 'Work Place', icon: 'hazard', occupancy: 500, x: 340, y: 96, w: 250, h: 170, people: 420, permits: 88, highRiskPermits: 16 },
  { id: 'Z3', name: 'Unit 3 — Coker', short: 'Unit 3', hazard: 'high', zoneType: 'Work Place', icon: 'hazard', occupancy: 450, x: 610, y: 96, w: 250, h: 170, people: 385, permits: 79, highRiskPermits: 14 },
  { id: 'Z4', name: 'Unit 4 — Sulphur Recovery', short: 'Unit 4', hazard: 'high', zoneType: 'Work Place', icon: 'hazard', occupancy: 320, x: 880, y: 96, w: 250, h: 170, people: 245, permits: 54, highRiskPermits: 8 },
  { id: 'Z5', name: 'Tank Farm North', short: 'Tank N', hazard: 'medium', zoneType: 'Work Place', icon: 'building', occupancy: 240, x: 70, y: 296, w: 340, h: 150, people: 180, permits: 41, highRiskPermits: 5 },
  { id: 'Z7', name: 'Utilities and Flare', short: 'Utilities', hazard: 'high', zoneType: 'Work Place', icon: 'hazard', occupancy: 340, x: 430, y: 296, w: 290, h: 150, people: 265, permits: 47, highRiskPermits: 5 },
  { id: 'Z8', name: 'Marine Loading', short: 'Marine', hazard: 'medium', zoneType: 'Work Place', icon: 'building', occupancy: 180, x: 740, y: 296, w: 390, h: 150, people: 120, permits: 26, highRiskPermits: 0 },
  { id: 'Z6', name: 'Tank Farm South', short: 'Tank S', hazard: 'medium', zoneType: 'Work Place', icon: 'building', occupancy: 200, x: 70, y: 476, w: 340, h: 150, people: 140, permits: 33, highRiskPermits: 3 },
  { id: 'Z9', name: 'Central Admin and Control', short: 'Admin', hazard: 'low', zoneType: 'Work Place', icon: 'building', occupancy: 280, x: 430, y: 476, w: 290, h: 150, people: 210, permits: 12, highRiskPermits: 0 },
  { id: 'Z10', name: 'West Gate', short: 'West Gate', hazard: 'low', zoneType: 'Access Control', icon: 'access', occupancy: 150, x: 740, y: 476, w: 180, h: 150, people: 97, permits: 5, highRiskPermits: 0 },
  { id: 'Z11', name: 'Parking Muster Point', short: 'Muster', hazard: 'low', zoneType: 'Muster Zone', icon: 'muster', occupancy: 2000, x: 940, y: 476, w: 190, h: 150, people: 40, permits: 3, highRiskPermits: 0 },
];

// Flagged jobs are placed *relative to their zone* (fractions of width/height),
// so a zone can move without orphaning its marker — the failure mode the old
// absolute x/y coordinates had.
const FLAGGED = [
  { id: 'FJ-001', rank: 1, zoneId: 'Z2', fx: 0.72, fy: 0.26, severity: 'critical', bucket: 'safety' },
  { id: 'FJ-002', rank: 2, zoneId: 'Z2', fx: 0.86, fy: 0.60, severity: 'critical', bucket: 'safety' },
  { id: 'FJ-003', rank: 3, zoneId: 'Z3', fx: 0.78, fy: 0.31, severity: 'critical', bucket: 'compliance' },
];

// `radiusM` is the muster point's catchment, drawn on the map as a circle the
// way the deployed RTLS console draws it when a muster event starts — the
// operator's question at an alarm is "who is inside the ring", and a ring is
// the only honest way to show it. `capacity` feeds the same allocation bands
// (optimal / moderate / high / overloaded) the console uses.
const MUSTER_POINTS = [
  // Capacities match `muster.json`, which is the narrative source for what each
  // point is expected to receive. They have to agree: the map card and the
  // muster board are the same fact seen twice, and a demo that contradicts
  // itself between two panels is worse than one that shows neither.
  { id: 'M1', name: 'Muster Point A — North', x: 200, y: 690, covers: ['Z1', 'Z5'], capacity: 800, radiusM: 160 },
  { id: 'M2', name: 'Muster Point B — West', x: 200, y: 640, covers: ['Z6', 'Z10'], capacity: 800, radiusM: 160 },
  { id: 'M3', name: 'Muster Point C — East', x: 1035, y: 660, covers: ['Z3', 'Z4'], capacity: 800, radiusM: 160 },
  { id: 'M4', name: 'Muster Point D — Marine', x: 935, y: 380, covers: ['Z8'], capacity: 400, radiusM: 130 },
  { id: 'M5', name: 'Muster Point E — Central', x: 575, y: 660, covers: ['Z2', 'Z7', 'Z9'], capacity: 400, radiusM: 130 },
];

// ─── RTLS infrastructure ────────────────────────────────────────
// The estate that produces the position feed: Bridgeport gateways (one per
// zone, the fixed receivers) and Beacon RF ATEX anchors (denser inside the
// hazardous units). Showing them matters because it is the honest answer to
// "how do you know where anyone is" — the location layer is not magic, it is
// this hardware, and an RTLS console that hides it is asking to be trusted
// rather than earning it. ATEX is the hazardous-area certification, which is
// why the units get the certified part and the office does not.
const BRIDGEPORT_OFFSETS = { fx: 0.5, fy: 0.12 };
const BEACON_LAYOUT = [
  { fx: 0.18, fy: 0.28 }, { fx: 0.82, fy: 0.28 },
  { fx: 0.18, fy: 0.76 }, { fx: 0.82, fy: 0.76 },
];

// ─── site.geojson ───────────────────────────────────────────────
function buildSite() {
  const r = rng(20260805);
  const features = [];

  features.push(poly(rect(40, 62, 1120, 600), {
    kind: 'perimeter', name: 'Site perimeter', heightM: HEIGHT.fence,
  }));

  // Roads — the spine and the cross streets that make a plan read as a plant
  // rather than a bar chart.
  features.push(line([[40, 281], [1160, 281]], { kind: 'road', name: 'North Ring Road' }));
  features.push(line([[40, 461], [1160, 461]], { kind: 'road', name: 'Central Avenue' }));
  features.push(line([[325, 62], [325, 662]], { kind: 'road', name: 'A Street' }));
  features.push(line([[595, 62], [595, 662]], { kind: 'road', name: 'B Street' }));
  features.push(line([[865, 62], [865, 662]], { kind: 'road', name: 'C Street' }));
  features.push(line([[600, 62], [600, 100]], { kind: 'road', name: 'Main Gate approach' }));

  // Pipe racks — drawn as their own kind so they can be styled as the dashed
  // steel corridors they are, not as roads.
  const rack = HEIGHT.piperack;
  features.push(line([[70, 271], [1130, 271]], { kind: 'piperack', name: 'Main pipe rack', heightM: rack }));
  features.push(line([[430, 271], [430, 96]], { kind: 'piperack', name: 'Unit 2 rack tie-in', heightM: rack }));
  features.push(line([[700, 271], [700, 96]], { kind: 'piperack', name: 'Unit 3 rack tie-in', heightM: rack }));
  features.push(line([[930, 296], [930, 271]], { kind: 'piperack', name: 'Marine rack', heightM: rack }));

  // Unit polygons carry the operational figures the conversation quotes.
  ZONES.forEach((z) => {
    features.push(poly(rect(z.x, z.y, z.w, z.h), {
      kind: 'zone',
      id: z.id,
      name: z.name,
      short: z.short,
      hazard: z.hazard,
      zoneType: z.zoneType,
      icon: z.icon,
      occupancy: z.occupancy,
      people: z.people,
      permits: z.permits,
      highRiskPermits: z.highRiskPermits,
    }));
  });

  // Storage tanks inside the two tank farms — the single most recognisable
  // feature of a refinery from above, and what the old grid of boxes lacked.
  const tankFarms = [
    { zone: 'Z5', cols: 5, rows: 2, x: 105, y: 330, dx: 66, dy: 62, r: 24, h: HEIGHT.tankNorth },
    { zone: 'Z6', cols: 5, rows: 2, x: 105, y: 510, dx: 66, dy: 62, r: 22, h: HEIGHT.tankSouth },
  ];
  tankFarms.forEach((tf) => {
    for (let c = 0; c < tf.cols; c++) {
      for (let row = 0; row < tf.rows; row++) {
        const jitter = (r() - 0.5) * 3;
        features.push(poly(
          circle(tf.x + c * tf.dx + jitter, tf.y + row * tf.dy + jitter, tf.r),
          {
            kind: 'tank', zoneId: tf.zone, id: `TK-${tf.zone}-${c}${row}`,
            // Radius in metres travels with the tank so the 3D view can raise a
            // true cylinder instead of re-measuring the 24-gon that approximates
            // one in plan.
            radiusM: +(tf.r * (SITE_M.w / VIEW.w)).toFixed(1),
            heightM: tf.h,
          },
        ));
      }
    }
  });

  // Process structures inside the four units — columns and drums, so the units
  // read as congested plant rather than empty rectangles.
  ZONES.filter((z) => z.hazard === 'high' && z.id.startsWith('Z') && ['Z1', 'Z2', 'Z3', 'Z4'].includes(z.id))
    .forEach((z) => {
      const n = 5 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const cx = z.x + 30 + r() * (z.w - 60);
        const cy = z.y + 30 + r() * (z.h - 60);
        const rad = 7 + r() * 7;
        features.push(poly(circle(cx, cy, rad, 12), {
          kind: 'structure', zoneId: z.id, id: `ST-${z.id}-${i}`,
          radiusM: +(rad * (SITE_M.w / VIEW.w)).toFixed(1),
          // Slim things are fractionation columns and stand tall; fat things are
          // drums and squat. Deriving height from the footprint rather than
          // rolling for it keeps the skyline in step with the plan — a wide
          // circle that towered over a narrow one would read as a mistake.
          heightM: Math.round(45 - (rad - 7) * 2.7),
        }));
      }
    });

  // Flare stack — Utilities. The one point everyone looks for on a refinery plan.
  features.push(point(690, 330, {
    kind: 'flare', name: 'Flare stack', zoneId: 'Z7', heightM: HEIGHT.flare,
  }));

  // Marine jetty reaching off the quay.
  features.push(line([[1090, 371], [1155, 371]], { kind: 'jetty', name: 'Loading jetty', zoneId: 'Z8', heightM: HEIGHT.jetty }));
  features.push(poly(rect(1148, 356, 12, 30), { kind: 'berth', name: 'Berth 1', zoneId: 'Z8', heightM: HEIGHT.berth }));

  // Admin and control buildings. The last one is the control room — the tallest
  // thing in a low-hazard zone, and the building the GM is standing in.
  [[455, 500, 90, 46], [560, 500, 70, 46], [455, 560, 60, 40], [530, 560, 100, 40], [645, 500, 55, 100]]
    .forEach(([x, y, w, h], i) => {
      features.push(poly(rect(x, y, w, h), {
        kind: 'building', zoneId: 'Z9', id: `B-${i + 1}`,
        heightM: i === 4 ? HEIGHT.buildingTall : HEIGHT.buildingLow,
      }));
    });

  features.push(point(600, 62, { kind: 'gate', id: 'G1', name: 'Main Gate' }));
  features.push(point(40, 552, { kind: 'gate', id: 'G2', name: 'West Gate' }));

  MUSTER_POINTS.forEach((m) => {
    features.push(point(m.x, m.y, {
      kind: 'muster', id: m.id, name: m.name, covers: m.covers.join(','),
      capacity: m.capacity, radiusM: m.radiusM,
    }));
    // The catchment ring, as its own polygon so it can be toggled independently
    // of the pin. Radius in viewBox units, converted from metres.
    features.push(poly(circle(m.x, m.y, m.radiusM * (VIEW.w / SITE_M.w), 48), {
      kind: 'musterRadius', id: `${m.id}-r`, musterId: m.id, radiusM: m.radiusM,
    }));
  });

  // RTLS estate. Gateway per zone, beacons denser where the hazard is.
  let bp = 100;
  let bc = 60;
  ZONES.forEach((z) => {
    bp += 1;
    features.push(point(z.x + z.w * BRIDGEPORT_OFFSETS.fx, z.y + z.h * BRIDGEPORT_OFFSETS.fy, {
      kind: 'infra',
      id: `BP-${bp}`,
      name: `Bridgeport ${bp}`,
      deviceType: 'Bridgeport',
      zoneId: z.id,
      zoneName: z.name,
      status: 'online',
    }));
    const slots = z.hazard === 'high' ? BEACON_LAYOUT : BEACON_LAYOUT.slice(0, 2);
    slots.forEach((s) => {
      bc += 1;
      features.push(point(z.x + z.w * s.fx, z.y + z.h * s.fy, {
        kind: 'infra',
        id: `BR-${bc}`,
        name: `Beacon RF ${bc}`,
        // Only the certified units get the ATEX part — the office beacons are
        // ordinary hardware, and pretending otherwise would misstate the estate.
        deviceType: z.hazard === 'low' ? 'Beacon RF' : 'Beacon RF ATEX',
        zoneId: z.id,
        zoneName: z.name,
        status: r() < 0.94 ? 'online' : 'degraded',
      }));
    });
  });

  FLAGGED.forEach((f) => {
    const z = ZONES.find((zz) => zz.id === f.zoneId);
    features.push(point(z.x + z.w * f.fx, z.y + z.h * f.fy, {
      kind: 'flagged',
      id: f.id,
      rank: f.rank,
      zoneId: f.zoneId,
      zoneName: z.name,
      severity: f.severity,
      bucket: f.bucket,
    }));
  });

  return {
    type: 'FeatureCollection',
    metadata: {
      illustrative: true,
      note: 'Invented facility. Not a real Aramco site. The geographic anchor is a round number chosen to be obviously synthetic; no basemap imagery ships with this demo.',
      anchor: ANCHOR,
      extentMetres: SITE_M,
      generatedBy: 'scripts/generate-aramco-geo.mjs',
    },
    features,
  };
}

// ─── workers.geojson ────────────────────────────────────────────
// One point per person on site. The zone people counts sum to exactly 2,412,
// which is HEADCOUNT.reconciled in _shared/constants.js — so the map's density
// layer and the reconciliation panel are counting the same population rather
// than two numbers that happen to look similar.
function buildWorkers() {
  const r = rng(770214);
  const features = [];
  let n = 0;

  ZONES.forEach((z) => {
    // Work fronts: people cluster around a handful of active faces, not evenly
    // across a unit. Uniform scatter is what makes a synthetic map look fake.
    const fronts = Math.max(3, Math.round(z.people / 55));
    const centres = Array.from({ length: fronts }, () => ({
      x: z.x + 25 + r() * (z.w - 50),
      y: z.y + 25 + r() * (z.h - 50),
    }));

    for (let i = 0; i < z.people; i++) {
      const c = centres[Math.floor(r() * centres.length)];
      // Box-Muller for a believable Gaussian spread around each front.
      const u = Math.max(r(), 1e-9);
      const v = r();
      // Spread wide enough that crews read as concentrations within a unit
      // rather than as separate islands — a tight sigma made every zone look
      // like an archipelago once the heat layer rendered.
      const mag = Math.sqrt(-2 * Math.log(u)) * (z.w / 6.5);
      const px = Math.min(z.x + z.w - 4, Math.max(z.x + 4, c.x + mag * Math.cos(2 * Math.PI * v)));
      const py = Math.min(z.y + z.h - 4, Math.max(z.y + 4, c.y + mag * Math.sin(2 * Math.PI * v) * 0.6));

      n += 1;
      features.push(point(px, py, {
        id: `W-${String(n).padStart(4, '0')}`,
        // Tag serial. Everything else the entity card shows — display name,
        // employee number, tag type — is derived from this one number at read
        // time rather than stored 2,412 times over. The console's own model is
        // the same shape: a person is an entity, a tag is assigned to them, and
        // the tag serial is what the location feed actually reports.
        t: 60 + n,
        zoneId: z.id,
        // Turnaround load: roughly seven in ten on site are contractors, which
        // is the whole reason the headcount sources disagree.
        role: r() < 0.7 ? 'contractor' : 'staff',
        source: r() < 0.88 ? 'location' : 'gate',
      }));
    }
  });

  return {
    type: 'FeatureCollection',
    metadata: {
      illustrative: true,
      total: n,
      note: 'Seeded, deterministic positions. Totals match HEADCOUNT.reconciled in _shared/constants.js.',
      generatedBy: 'scripts/generate-aramco-geo.mjs',
    },
    features,
  };
}

// ─── indoor.geojson ─────────────────────────────────────────────
// Unit 3 Coker, in IMDF's shape (level / unit / opening / fixture / occupant).
// IMDF is a data format rather than a renderer — it is GeoJSON underneath — so
// authoring the interior this way means the same map engine draws it, and a real
// IMDF export could replace this file without touching the component.
function buildIndoor() {
  const Z3 = ZONES.find((z) => z.id === 'Z3');
  // Authored in REAL METRES, not viewBox units.
  //
  // The first pass reused the site's unit scale and produced a 290 m "drum
  // deck" — the scale bar read 50 m for a structure that is about 34 m across.
  // An interior has to be dimensionally honest or the plan is decorative.
  const originX = Z3.x + 150;   // viewBox units — where on the site it sits
  const originY = Z3.y + 40;
  const M = VIEW.w / SITE_M.w;  // viewBox units per metre
  /** metres from the structure's south-west corner → viewBox units */
  const mx = (m) => originX + m * M;
  const my = (m) => originY + (34 - m) * M; // flip: metres north-up, SVG y down
  const mrect = (x, y, w, h) => [[
    pt(mx(x), my(y)), pt(mx(x + w), my(y)),
    pt(mx(x + w), my(y + h)), pt(mx(x), my(y + h)), pt(mx(x), my(y)),
  ]];
  const mpoint = (x, y, properties) => feat(
    { type: 'Point', coordinates: pt(mx(x), my(y)) }, properties,
  );

  const features = [];
  features.push(poly(mrect(0, 0, 34, 34), {
    kind: 'footprint', feature_type: 'footprint', category: 'ground',
    name: 'Coker drum structure', widthMetres: 34, depthMetres: 34,
  }));
  features.push(poly(mrect(0, 0, 34, 34), {
    kind: 'level', feature_type: 'level', level_id: 'L0', ordinal: 0,
    name: 'Drum deck (grade + 18 m)',
  }));

  const units = [
    { id: 'U-DRUM', category: 'vessel', name: 'Coker drum C-301 (confined space)', x: 9, y: 9, w: 16, h: 16, restricted: true },
    { id: 'U-DECK', category: 'walkway', name: 'Access deck', x: 2, y: 27, w: 30, h: 5, restricted: false },
    { id: 'U-STAIR', category: 'stairs', name: 'Stair tower', x: 2, y: 9, w: 5, h: 16, restricted: false },
    { id: 'U-CABIN', category: 'room', name: 'Permit cabin', x: 2, y: 2, w: 10, h: 5, restricted: false },
    { id: 'U-LAYDOWN', category: 'nonpublic', name: 'Laydown area', x: 15, y: 2, w: 17, h: 5, restricted: false },
  ];
  units.forEach((u) => {
    features.push(poly(mrect(u.x, u.y, u.w, u.h), {
      kind: 'unit', feature_type: 'unit', level_id: 'L0',
      id: u.id, category: u.category, name: u.name, restricted: u.restricted,
    }));
  });

  // The manway is the entry point every permit condition is written about.
  features.push(mpoint(9, 20, {
    kind: 'opening', feature_type: 'opening', level_id: 'L0',
    id: 'O-MANWAY', category: 'manway', name: 'North manway', accessible: true,
    labelOffset: [0, -14],
  }));

  const fixtures = [
    { id: 'F-STANDBY', category: 'standby-post', name: 'Standby person post', x: 7.5, y: 20, state: 'compliant', detail: 'Confirmed at the entry point by location and camera.', labelOffset: [-96, 0] },
    { id: 'F-GAS', category: 'gas-monitor', name: 'Continuous gas monitor', x: 11, y: 22.5, state: 'attention', detail: 'Within limits, last test 14 min ago. Next due in about 1 minute.', labelOffset: [0, -16] },
    { id: 'F-CAM', category: 'camera', name: 'Entry camera', x: 5, y: 27.5, state: 'compliant', detail: 'Presence confirmed at the manway.', labelOffset: [0, -14] },
    { id: 'F-WINCH', category: 'rescue', name: 'Rescue tripod and winch', x: 6, y: 15, state: 'compliant', detail: 'Rigged over the manway.', labelOffset: [-104, 0] },
  ];
  fixtures.forEach((f) => {
    features.push(mpoint(f.x, f.y, {
      kind: 'fixture', feature_type: 'fixture', level_id: 'L0',
      id: f.id, category: f.category, name: f.name, state: f.state,
      detail: f.detail, labelOffset: f.labelOffset,
    }));
  });

  // The two entrants named in the permit record, inside the drum.
  [
    { id: 'E-1', name: 'Entrant 1', label: 'Contractor crew, tag 41822', x: 14, y: 16 },
    { id: 'E-2', name: 'Entrant 2', label: 'Contractor crew, tag 41823', x: 19.5, y: 13 },
  ].forEach((e) => {
    features.push(mpoint(e.x, e.y, {
      kind: 'occupant', feature_type: 'occupant', level_id: 'L0',
      id: e.id, name: e.name, label: e.label, inside: true,
    }));
  });

  return {
    type: 'FeatureCollection',
    metadata: {
      illustrative: true,
      permitId: 'CS-1182',
      zoneId: 'Z3',
      levelId: 'L0',
      extentMetres: { w: 34, h: 34 },
      note: 'Authored in IMDF feature shape (level / unit / opening / fixture / occupant) at true metre scale, so a real IMDF export could replace it without a component change. Geometry is invented.',
      generatedBy: 'scripts/generate-aramco-geo.mjs',
    },
    features,
  };
}

writeFileSync(join(OUT, 'site.geo.json'), JSON.stringify(buildSite(), null, 1) + '\n');
const workers = buildWorkers();
writeFileSync(join(OUT, 'workers.geo.json'), JSON.stringify(workers) + '\n');
writeFileSync(join(OUT, 'indoor.geo.json'), JSON.stringify(buildIndoor(), null, 1) + '\n');

console.log('site.geojson    ', buildSite().features.length, 'features');
console.log('workers.geojson ', workers.features.length, 'workers (expected 2412)');
console.log('indoor.geojson  ', buildIndoor().features.length, 'features');
