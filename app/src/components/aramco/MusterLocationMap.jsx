/**
 * MusterLocationMap — where the unaccounted were last seen.
 *
 * "28 outstanding" is a number. Three pins on the site, sized and coloured by
 * priority, is a search plan — and it is the moment the muster board stops
 * being a scoreboard and becomes something a warden can act on.
 *
 * Statically importable by a manifest: it holds no map code of its own, only the
 * data lookup and a `LazySiteMap` behind which MapLibre stays deferred.
 */
import useAsyncData from '../../hooks/useAsyncData';
import { getMuster } from '../../data/aramco/hse-gm';
import LazySiteMap from './LazySiteMap';

export default function MusterLocationMap({ getter = getMuster, height = '360px' }) {
  const muster = useAsyncData(getter);
  if (!muster) return null;

  const groups = (muster.unaccountedGroups || []).filter((g) => g.lastKnownPoint);
  if (!groups.length) return null;

  return (
    <LazySiteMap
      variant="muster"
      lastKnown={groups}
      height={height}
      title={`Last known positions — ${muster.unaccounted} unaccounted`}
      compact
    />
  );
}
