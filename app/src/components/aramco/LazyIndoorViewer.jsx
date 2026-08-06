/**
 * LazyIndoorViewer — the interior, behind a lazy boundary.
 *
 * Same reasoning as LazySiteMap: the interior renders through MapLibre, and a
 * static import in a persona manifest would pull a WebGL library into the
 * jsdom environment that `manifests.test.ts` uses to validate all 17 personas.
 *
 * Note the double lazy: this boundary defers MapLibre, and IndoorViewer defers
 * three.js again behind its own 3D toggle. Someone who never presses "3D" never
 * downloads it.
 */
import { lazy, Suspense } from 'react';

const IndoorViewer = lazy(() => import('./IndoorViewer'));

function Skeleton({ height }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="h-3 w-52 rounded bg-surface-2 animate-pulse" />
      <div style={{ height }} className="mt-3 w-full rounded-xl bg-surface-2 animate-pulse" />
    </div>
  );
}

export default function LazyIndoorViewer({ height = '380px', ...props }) {
  return (
    <Suspense fallback={<Skeleton height={height} />}>
      <IndoorViewer height={height} {...props} />
    </Suspense>
  );
}
