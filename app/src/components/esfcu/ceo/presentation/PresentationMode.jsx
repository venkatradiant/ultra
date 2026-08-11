import PresentationMode from '../../shared/presentation/PresentationMode';
import pres from '../../../../data/esfcu/ceo/presentation.json';
import narrationData from '../../../../data/esfcu/ceo/presentationNarration.json';
import chatBank from '../../../../data/esfcu/ceo/presentationChat.json';
import lineage from '../../../../data/esfcu/ceo/lineage.json';

import SlideSituational from './slides/SlideSituational';
import SlideEvidence from './slides/SlideEvidence';
import SlideTrajectory from './slides/SlideTrajectory';
import SlideAssurance from './slides/SlideAssurance';
import SlideMembers from './slides/SlideMembers';
import SlideResolution from './slides/SlideResolution';
import SlideNextSteps from './slides/SlideNextSteps';

/**
 * The CEO's board briefing — the shared deck shell bound to his seven slides
 * and his data.
 *
 * Spec §15a slide sequence. Members sits BEFORE assurance (unlike the USSFCU
 * deck) so the full-bleed navy slides — cover and assurance — alternate with
 * paper slides for the rhythm the spec asks for, and so the emotional beat
 * (members and mission) lands before the governance beat.
 *
 * SLIDES and SLIDE_IDS are parallel arrays and must stay in step: the id is how
 * a slide finds its narration, its Q&A bank and its transcript row.
 */
const SLIDES = [
  SlideSituational,
  SlideEvidence,
  SlideTrajectory,
  SlideMembers,
  SlideAssurance,
  SlideResolution,
  SlideNextSteps,
];

const SLIDE_IDS = ['situational', 'evidence', 'trajectory', 'members', 'assurance', 'resolution', 'nextSteps'];

export default function CeoPresentationMode({ onClose }) {
  return (
    <PresentationMode
      onClose={onClose}
      slides={SLIDES}
      slideIds={SLIDE_IDS}
      pres={pres}
      narrationData={narrationData}
      chatBank={chatBank}
      lineageFigures={lineage.figures}
      eventNamespace="esfcu-ceo-deck"
      ttsPersona="ceo"
    />
  );
}
