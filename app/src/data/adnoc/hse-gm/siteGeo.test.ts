import { describe, it, expect } from 'vitest';
import siteGeo from './site.geo.json';

/**
 * Guards the site fixture's third dimension.
 *
 * The 3D view extrudes `heightM` straight out of this file rather than guessing
 * from `kind` at render time, which is what makes the skyline reviewable — but
 * it also means a solid that loses its height does not fail loudly. It renders
 * as a flat smear on the ground, in a view most people only open during a demo.
 * These assertions are the loud failure.
 *
 * The clickable point features (gates, muster points, flagged jobs, RTLS
 * devices) are deliberately excluded: the scene gives those markers a fixed
 * size, because a beacon's job is to be findable rather than to be to scale.
 */

interface Props {
  kind: string;
  heightM?: number;
  radiusM?: number;
  [k: string]: unknown;
}
const features = (siteGeo as { features: { properties: Props }[] }).features;
const of = (kind: string) => features.filter((f) => f.properties.kind === kind);

/** Every solid the 3D scene raises off the ground. */
const EXTRUDED = ['perimeter', 'piperack', 'tank', 'structure', 'building', 'berth', 'jetty', 'flare'];

describe('site geometry heights', () => {
  it.each(EXTRUDED)('every %s carries a positive heightM', (kind) => {
    const found = of(kind);
    expect(found.length).toBeGreaterThan(0);
    found.forEach((f) => {
      expect(f.properties.heightM, `${kind} ${String(f.properties.id ?? f.properties.name)}`)
        .toBeGreaterThan(0);
    });
  });

  it('gives the cylinders a radius, since the scene raises a cylinder rather than extruding the polygon', () => {
    [...of('tank'), ...of('structure')].forEach((f) => {
      expect(f.properties.radiusM).toBeGreaterThan(0);
    });
  });

  it('keeps the skyline in proportion — the flare is the tallest thing on site', () => {
    const flare = of('flare')[0].properties.heightM!;
    const tallestElse = Math.max(
      ...features
        .filter((f) => f.properties.kind !== 'flare' && typeof f.properties.heightM === 'number')
        .map((f) => f.properties.heightM!),
    );
    expect(flare).toBeGreaterThan(tallestElse);
  });

  it('keeps process columns taller than the tanks they tower over', () => {
    const minStructure = Math.min(...of('structure').map((f) => f.properties.heightM!));
    const maxTank = Math.max(...of('tank').map((f) => f.properties.heightM!));
    expect(minStructure).toBeGreaterThan(maxTank);
  });
});
