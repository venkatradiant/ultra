import { Siren } from 'lucide-react';
import HomeSignals from '../shared/HomeSignals';

/**
 * The CRO's home signals. Her primary signal is the scam surge, so the hero
 * eyebrow names that beat rather than the CEO's funding watch.
 */
export default function CroHomeSignals(props) {
  return (
    <HomeSignals
      {...props}
      eyebrow="Critical · Scam & impersonation"
      eyebrowIcon={Siren}
      briefingLabel="View Full Risk Briefing"
    />
  );
}
