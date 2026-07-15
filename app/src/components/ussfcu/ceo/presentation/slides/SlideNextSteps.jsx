import pres from '../../../../../data/ussfcu/ceo/presentation.json';
import { closeProps } from '../askAbout';

function ChipIcon({ kind }) {
  if (kind === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  );
}

export default function SlideNextSteps({ active }) {
  const s = pres.slides.nextSteps;
  return (
    <section className={`slide paper2${active ? ' active' : ''}`}>
      <div className="shead">
        <div><div className="eyebrow dark">{s.eyebrow}</div><hr className="kline" /></div>
        <div className="note">{s.note}</div>
      </div>
      <div className="sbody">
        <div className="nsteps">
          {s.steps.map((step, i) => (
            <div key={step.n} {...closeProps('nstep', i)}>
              <div className="nn">{step.n}</div>
              <div className="nbody">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
                <div className="otags">
                  {step.owners.map((o) => <span className="otag" key={o}>{o}</span>)}
                </div>
              </div>
              <span className="nchip"><ChipIcon kind={step.chipIcon} />{step.chip}</span>
              <span className="narrow">&rarr;</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
