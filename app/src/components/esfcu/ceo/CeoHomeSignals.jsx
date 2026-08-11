import { TrendingDown } from 'lucide-react';
import HomeSignals from '../shared/HomeSignals';

/**
 * The CEO's home signals: the shared hero bound to his beat. His primary signal
 * is the funding and liquidity watch. See EsfcuKpiCarousel for why the binding
 * lives in a wrapper rather than at the call site.
 */
export default function CeoHomeSignals(props) {
  return <HomeSignals {...props} eyebrow="Watch · Funding & liquidity" eyebrowIcon={TrendingDown} />;
}
