import pres from '../../../../../data/esfcu/cro/presentation.json';
import DeckPhoto from '../../../shared/presentation/DeckPhoto';
import { useDeck } from '../../../shared/presentation/deckContext';

// ESFCU's own member photography, from the "Why ESFCU" panel on esfcu.org.
// Served from /public so the deck renders in a boardroom with no network, and
// so the client's CDN is not carrying load for our demo.
const MEMBER_PHOTO = '/esfcu/members.webp';

const MARK_SEEDS = ['mem_impact', 'exp_attrition'];

// Render the pull-quote with its emphasized words styled in the warm accent.
function Quote({ text, em }) {
  if (!em || !text.includes(em)) return <>&ldquo;{text}&rdquo;</>;
  const [before, after] = text.split(em);
  return (<>&ldquo;{before}<em>{em}</em>{after}&rdquo;</>);
}

// Slide 4 — members and trust. Spec §15a: "what this means for members
// (authorized-transfer losses, the retention stake), tied to ESFCU's real
// member-protection posture". The quote is ESFCU's real published mission
// statement, attributed — no words are put in anyone's mouth.
export default function SlideMembers({ active }) {
  const { askProps } = useDeck();
  const s = pres.slides.members;
  return (
    <section className={`slide paper2${active ? ' active' : ''}`}>
      <div className="shead">
        <div><div className="eyebrow dark">{s.eyebrow}</div><hr className="kline" /></div>
        <div className="note">{s.note}</div>
      </div>
      <div className="sbody">
        <div className="members">
          <DeckPhoto
            className="mphoto"
            src={MEMBER_PHOTO}
            alt="Educational Systems Federal Credit Union members at home reviewing their accounts"
            caption={s.photoCaption}
            capClass="mcap"
          />
          <div>
            <div {...askProps('mem_mission', 'mquote')}><Quote text={s.quote} em={s.quoteEm} /></div>
            <div className="mattr">{s.attribution}</div>
            <div {...askProps('mem_authorized', 'mline')}>{s.line}</div>
            <div className="mmarks">
              {s.marks.map((m, i) => (
                <span key={m} {...askProps(MARK_SEEDS[i], 'mmark')}>&#9733; {m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
