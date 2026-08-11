import PresentationMode from '../../shared/presentation/PresentationMode';
import pres from '../../../../data/esfcu/cro/presentation.json';
import narrationData from '../../../../data/esfcu/cro/presentationNarration.json';
import chatBank from '../../../../data/esfcu/cro/presentationChat.json';
import lineage from '../../../../data/esfcu/cro/lineage.json';

import SlideCover from './slides/SlideCover';
import SlideIssue from './slides/SlideIssue';
import SlideExposure from './slides/SlideExposure';
import SlideMembers from './slides/SlideMembers';
import SlideAssurance from './slides/SlideAssurance';
import SlideOptions from './slides/SlideOptions';
import SlideNextSteps from './slides/SlideNextSteps';

/**
 * The CRO's risk briefing — the shared deck shell bound to her seven slides.
 *
 * Spec §15a's sequence, and the same navy/paper alternation as the CEO deck:
 * cover and assurance are full-bleed navy, the rest are paper.
 *
 * The slide ids are deliberately DIFFERENT from the CEO's where they can be
 * (`cover`/`issue`/`exposure`/`options` rather than `situational`/`evidence`/
 * `trajectory`/`resolution`). `members`, `assurance` and `nextSteps` still
 * collide, which is why the TTS proxy is keyed by persona as well as tenant —
 * its responses are CDN-cached for a year by URL, so a shared id and a shared
 * URL would mean one deck narrating the other's script until the cache expired.
 * Distinct ids are the second line of defence, not the first.
 */
const SLIDES = [
  SlideCover,
  SlideIssue,
  SlideExposure,
  SlideMembers,
  SlideAssurance,
  SlideOptions,
  SlideNextSteps,
];

const SLIDE_IDS = ['cover', 'issue', 'exposure', 'members', 'assurance', 'options', 'nextSteps'];

export default function CroPresentationMode({ onClose }) {
  return (
    <PresentationMode
      onClose={onClose}
      slides={SLIDES}
      slideIds={SLIDE_IDS}
      pres={pres}
      narrationData={narrationData}
      chatBank={chatBank}
      lineageFigures={lineage.figures}
      eventNamespace="esfcu-cro-deck"
      ttsPersona="cro"
    />
  );
}
