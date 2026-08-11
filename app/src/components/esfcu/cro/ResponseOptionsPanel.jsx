import { motion } from 'framer-motion';
import { CheckCircle2, Users, Clock, TrendingDown } from 'lucide-react';
import ExhibitCard from '../shared/ExhibitCard';
import response from '../../../data/esfcu/cro/response.json';
import { STATE_COLOR, NAVY_HEX } from '../tokens';

/**
 * Spec §15a's resolution options, rendered in Conversation Mode as well as on
 * the deck — three paths, each with the same three rated attributes, one marked
 * Recommended.
 *
 * The attributes are what make this a decision rather than a recommendation to
 * rubber-stamp. The blanket hold contains fastest and is still not recommended,
 * because its member-friction rating is the one that reads critical. A CRO who
 * can see why the fast option was rejected trusts the one that was chosen.
 */

const ATTR_ICON = { 'Speed to contain': Clock, 'Member friction': Users, 'Loss reduction': TrendingDown };

export default function ResponseOptionsPanel() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ExhibitCard
        title="Three ways to bend the curve"
        note="Rated on the three things that decide it. One is recommended; none are mutually exclusive."
        source={response.source}
        asOf={response.as_of}
        confidence={response.confidence}
        provenance={response.provenance}
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {response.options.map((o) => (
            <div
              key={o.id}
              className={`flex min-w-0 flex-col rounded-xl border p-3 ${
                o.recommended ? 'border-brand/40 bg-brand/[0.04]' : 'border-border-subtle bg-surface'
              }`}
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <h4 className="text-[12px] font-bold text-text">{o.title}</h4>
                {o.recommended ? (
                  <span className="inline-flex items-center gap-1 rounded bg-brand px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-white">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Recommended
                  </span>
                ) : null}
              </div>
              <p className="mb-2.5 flex-1 text-[10.5px] leading-relaxed text-text-muted">{o.description}</p>

              <div className="space-y-1 border-t border-border-subtle pt-2">
                {o.attributes.map((a) => {
                  const Icon = ATTR_ICON[a.label] || Clock;
                  return (
                    <div key={a.label} className="flex items-center justify-between gap-2">
                      <span className="inline-flex min-w-0 items-center gap-1 text-[9.5px] text-text-subtle">
                        <Icon className="h-2.5 w-2.5 flex-shrink-0" /> {a.label}
                      </span>
                      {/* Text plus colour, never colour alone — same rule the
                          trust strip follows, for the same projector. */}
                      <span
                        className="flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold"
                        style={{ color: STATE_COLOR[a.state], background: `${STATE_COLOR[a.state]}14` }}
                      >
                        {a.rating}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[9.5px] font-semibold" style={{ color: o.recommended ? NAVY_HEX : '#7A8A99' }}>
                {o.loss_effect}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-3 border-t border-border-subtle pt-2 text-[10.5px] leading-relaxed text-text-muted">
          {response.closing_note}
        </p>
      </ExhibitCard>
    </motion.div>
  );
}
