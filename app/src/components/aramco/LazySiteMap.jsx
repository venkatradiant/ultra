/**
 * LazySiteMap — the map, behind a lazy boundary.
 *
 * Persona manifests must not statically import MapLibre. Two reasons, both real:
 *
 *  1. `manifests.test.ts` loads all 17 persona manifests to validate them. A
 *     static import would pull a WebGL library into a jsdom environment that has
 *     no WebGL, and the suite would break on a test that is not about maps.
 *  2. The eager entry chunk is already oversized. Anything a manifest imports at
 *     module scope lands in that manifest's chunk whether or not the map ever
 *     renders.
 *
 * This module is deliberately tiny — `lazy()` plus a `Suspense` boundary — so
 * manifests can import it normally while MapLibre stays behind a dynamic import
 * that only resolves when a turn actually renders a map. The chat tree has no
 * Suspense boundary of its own, so the boundary has to live here.
 */
import { lazy, Suspense } from 'react';

const SiteMapPanel = lazy(() => import('./SiteMapPanel'));

function Skeleton({ height }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="h-3 w-40 rounded bg-surface-2 animate-pulse" />
      <div
        style={{ height }}
        className="mt-3 w-full rounded-xl bg-surface-2 animate-pulse"
      />
    </div>
  );
}

export default function LazySiteMap({ height = '440px', ...props }) {
  return (
    <Suspense fallback={<Skeleton height={height} />}>
      <SiteMapPanel height={height} {...props} />
    </Suspense>
  );
}
