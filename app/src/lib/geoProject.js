/**
 * Flat-earth projection from lon/lat to local metres, centred on a feature set.
 *
 * Both 3D scenes need this and neither can use MapLibre's projection: three.js
 * works in metres on a flat plane, and a site 3.2 km across is far too small for
 * the curvature error to matter — at this scale the difference between a proper
 * projection and a scaled equirectangular one is under a centimetre.
 *
 * Written once here because the interior scene had it first and the site scene
 * is the second caller. The returned function also carries:
 *
 *   • `extent`  — the scene's half-size in metres, so a camera can be placed
 *     from the geometry rather than from a constant. A fixture that grows then
 *     frames itself instead of overflowing the viewport.
 *   • `invert`  — metres back to [lon, lat], which is what lets a 3D view keep
 *     the coordinate readout the 2D map shows along its foot. Without it the
 *     footer would have to go blank in 3D, and on a location product a blank
 *     coordinate readout is a small lie about what the view knows.
 */

const M_PER_DEG_LAT = 110574;

/**
 * @param {Array<{geometry: {coordinates: any}}>} features
 * @returns {((lngLat: number[]) => number[]) & {extent: number, invert: (xz: number[]) => number[]}}
 */
export default function projector(features) {
  let minX = 180, minY = 90, maxX = -180, maxY = -90;
  const visit = (c) => {
    if (typeof c[0] === 'number') {
      minX = Math.min(minX, c[0]); maxX = Math.max(maxX, c[0]);
      minY = Math.min(minY, c[1]); maxY = Math.max(maxY, c[1]);
      return;
    }
    c.forEach(visit);
  };
  features.forEach((f) => visit(f.geometry.coordinates));

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const mPerLon = 111320 * Math.cos((cy * Math.PI) / 180);

  const project = ([lon, lat]) => [(lon - cx) * mPerLon, (lat - cy) * M_PER_DEG_LAT];
  project.extent = Math.max((maxX - minX) * mPerLon, (maxY - minY) * M_PER_DEG_LAT) / 2;
  // Note the sign: scenes lay the ground out on X/Z with Z growing south, so a
  // caller passing [x, z] gets north back by negating. Callers project
  // `[x, y] → [x, z]` on the way in, so this is the exact inverse of that.
  project.invert = ([x, z]) => [cx + x / mPerLon, cy - z / M_PER_DEG_LAT];
  return project;
}
