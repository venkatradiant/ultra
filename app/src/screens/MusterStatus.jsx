/**
 * Muster Status — live accounting by zone.
 *
 * Light-surfaced like every other page. The alarm state lives in the board's
 * one dark critical panel rather than in the page background, so a muster reads
 * as "one number is wrong" instead of "everything is loud".
 */
import { usePersona } from '../context/PersonaContext';
import useAsyncData from '../hooks/useAsyncData';
import { getMuster } from '../data/aramco/hse-gm';
import HsePageHeader from '../components/aramco/HsePageHeader';
import MusterBoard from '../components/aramco/MusterBoard';

export default function MusterStatus() {
  const persona = usePersona();
  const muster = useAsyncData(getMuster);

  if (!persona?.id?.startsWith('aramco_')) {
    return (
      <div className="flex-1 py-8 px-6 lg:px-8 overflow-y-auto">
        <p className="text-sm text-text-muted">This view is not available for the active persona.</p>
      </div>
    );
  }

  if (!muster) return <div className="flex-1 bg-bg" />;

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto scrollbar-sleek">
      <HsePageHeader
        title="Muster Status"
        subtitle={`${muster.accounted.toLocaleString()} of ${muster.total.toLocaleString()} accounted for in the first ${muster.elapsedSeconds} seconds. The ${muster.unaccounted} outstanding all trace to the earlier headcount reconciliation, so the muster inherits a defended number rather than starting an argument about which system to believe.`}
        asOf="live"
      />

      <MusterBoard />
    </div>
  );
}
