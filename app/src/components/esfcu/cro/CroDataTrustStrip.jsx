import trust from '../../../data/esfcu/cro/trustStrip.json';
import lineage from '../../../data/esfcu/cro/lineage.json';
import DataTrustStrip from '../shared/DataTrustStrip';
import croWidgets from './trustStripWidgets';

/**
 * The CRO's trust strip: the shared strip bound to her trustStrip.json, her
 * four widgets and her lineage figures. Card, compact, expanded and the deck's
 * navy ribbon all render from this one dataset.
 *
 * The trace opens on fraud-model coverage — the figure she cannot yet put in
 * front of the supervisory committee, which is the whole reason the tile exists.
 */
export default function CroDataTrustStrip(props) {
  return (
    <DataTrustStrip
      {...props}
      trust={trust}
      widgets={croWidgets}
      lineageFigureId="model_coverage"
      lineageFigures={lineage.figures}
    />
  );
}
