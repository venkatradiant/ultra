import DoitCard from '../shared/DoitCard';

/**
 * Verbatim resident comments, anonymised.
 *
 * Each quote carries the channel it arrived on, because the mixed-channel story
 * is part of the concept: one survey definition, several delivery formats, one
 * analysis set. A quote with no provenance is just a pull-quote.
 */
const QUOTES = {
  waitTimes: {
    theme: 'Wait times — in-person centers',
    items: [
      {
        text: 'I waited over two hours at the Glen Burnie service center. The staff were great but the queue system was broken.',
        respondent: 'R-0412',
        audience: 'In-person respondent',
        channel: 'Conversational',
      },
      {
        text: 'The online portal said my renewal was submitted and then nothing. I called and they had no record of it. Had to start over.',
        respondent: 'R-0177',
        audience: 'Online respondent',
        channel: 'Web form',
      },
      {
        text: 'Every step took longer than it should. I took a half day off work for this. It is not acceptable for something this routine.',
        respondent: 'R-0298',
        audience: 'In-person respondent',
        channel: 'Conversational',
      },
    ],
  },
  portal: {
    theme: 'New online renewal portal',
    items: [
      {
        text: 'The new portal looks cleaner but I could not find where to upload my supporting documents. There is no help text anywhere on that page.',
        respondent: 'R-0033',
        audience: 'Online respondent',
        channel: 'Web form',
      },
      {
        text: 'I kept getting a "session expired" error even though I was actively filling things out. Lost my work twice.',
        respondent: 'R-0151',
        audience: 'Online respondent',
        channel: 'Conversational',
      },
      {
        text: 'After I submitted I had no idea if it went through. My old application gave me a confirmation number at least.',
        respondent: 'R-0206',
        audience: 'Online respondent',
        channel: 'Web form',
      },
    ],
  },
};

export default function ResidentQuoteCard({ variant = 'waitTimes' }) {
  const set = QUOTES[variant] || QUOTES.waitTimes;

  return (
    <DoitCard
      eyebrow={`Resident quotes — ${set.theme}`}
      intro="Verbatim and anonymised. Quoted exactly as submitted."
    >
      <ul className="divide-y divide-border-subtle">
        {set.items.map((quote) => (
          <li key={quote.respondent} className="py-3 first:pt-0 last:pb-0">
            <blockquote className="border-l-2 border-brand/25 pl-3 text-[13px] italic leading-relaxed text-text">
              “{quote.text}”
            </blockquote>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 pl-3 text-[11px] text-text-muted">
              <span className="font-semibold text-text-muted">{quote.respondent}</span>
              <span className="text-text-subtle" aria-hidden="true">·</span>
              <span>{quote.audience}</span>
              <span className="text-text-subtle" aria-hidden="true">·</span>
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10.5px] font-medium">
                {quote.channel}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </DoitCard>
  );
}
