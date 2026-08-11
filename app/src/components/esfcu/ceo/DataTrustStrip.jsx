import trust from '../../../data/esfcu/ceo/trustStrip.json';
import DataTrustStrip from '../shared/DataTrustStrip';
import ceoWidgets from './trustStripWidgets';

/**
 * The CEO's trust strip: the shared strip bound to his trustStrip.json and his
 * four widgets. Every variant — card, compact, expanded and the deck's navy
 * ribbon — comes from this one dataset, so Conversation Mode and Presentation
 * Mode can never disagree.
 *
 * The consolidated deposit figure is the one Girado cannot cite yet, so it is
 * the one the lineage trace opens on.
 */
export default function CeoDataTrustStrip(props) {
  return (
    <DataTrustStrip
      {...props}
      trust={trust}
      widgets={ceoWidgets}
      lineageFigureId="consolidated_deposits"
    />
  );
}
