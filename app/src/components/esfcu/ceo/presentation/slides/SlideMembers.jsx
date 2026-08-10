import pres from '../../../../../data/esfcu/ceo/presentation.json';
import DeckPhoto from './DeckPhoto';
import { askProps } from '../askAbout';

// ESFCU's own member photography, from the "Why ESFCU" panel on esfcu.org.
// Served from /public for the same reasons as the cover portrait.
const MEMBER_PHOTO = '/esfcu/members.webp';

// Render the pull-quote with its emphasized word styled in the warm accent.
function Quote({ text, em }) {
  if (!em || !text.includes(em)) return <>&ldquo;{text}&rdquo;</>;
  const [before, after] = text.split(em);
  return (<>&ldquo;{before}<em>{em}</em>{after}&rdquo;</>);
}

export default function SlideMembers({ active }) {
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
            <div className="mline">{s.line}</div>
            <div className="mmarks">
              {s.marks.map((m) => (
                <span key={m} {...askProps('mem_awards', 'mmark')}>&#9733; {m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
