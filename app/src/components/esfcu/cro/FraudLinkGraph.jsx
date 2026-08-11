import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Landmark, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import ExhibitCard from '../shared/ExhibitCard';
import graph from '../../../data/esfcu/cro/linkGraph.json';
import { NAVY_HEX, STATE_COLOR } from '../tokens';

/**
 * Spec §10 Steps 2 and 5: the receiving-account link graph — "a small link
 * graph of repeating receiving accounts", and the mule cluster with evidence.
 *
 * Hand-rolled SVG rather than a graph library, and that was a decision, not
 * laziness. `@neo4j-nvl` is already in this bundle so it would have been free
 * byte-wise, but it renders to canvas/WebGL, and a canvas cannot carry the aria
 * labels this needs — every node here is a fact a reader has to be able to get
 * at without seeing it. It also would not survive the deck's long-form PDF
 * export, which matters less today than it might: §15a's seven slides do not
 * include a link graph, so this lives in Conversation Mode and on
 * /fraud-operations. Building it as SVG means putting it on a slide later is a
 * placement decision rather than a rewrite.
 *
 * The layout is deterministic rather than force-simulated — three columns,
 * members → receivers → second hop — because the shape of this data IS the
 * finding. A force layout would scatter the same information into a hairball
 * and re-scatter it on every render, and a two-hop funnel is exactly what a
 * mule signature looks like. Deterministic also means the deck slide and the
 * conversation exhibit are the same picture every time it is shown.
 */

const W = 660;
const H = 400;
// The receiver column carries nine nodes, so it sets the height: below ~400 the
// labels start landing on the node beneath them.
const COL = { member: 72, receiver: W / 2 - 20, hop: W - 78 };

const NODE_STYLE = {
  member: { r: 15, fill: '#FFFFFF', stroke: '#B9C6D2', Icon: User },
  // The receiver label sits beside the node rather than under it — nine of them
  // in one column leaves no vertical room for a caption.
  receiver: { r: 17, fill: '#FFF7ED', stroke: STATE_COLOR.warning, Icon: Landmark, labelBeside: true },
  hop: { r: 14, fill: '#F1F5F9', stroke: '#94A3B8', Icon: ArrowRightLeft },
};

/** Spreads a column's nodes evenly down the canvas with a margin at each end. */
function layoutColumn(nodes, x) {
  const pad = 34;
  const span = H - pad * 2;
  return nodes.map((n, i) => ({
    ...n,
    x,
    y: nodes.length === 1 ? H / 2 : pad + (span / (nodes.length - 1)) * i,
  }));
}

export default function FraudLinkGraph({ compact = false }) {
  const [selectedId, setSelectedId] = useState(null);

  const positioned = useMemo(() => {
    const by = (t) => graph.nodes.filter((n) => n.type === t);
    return [
      ...layoutColumn(by('member'), COL.member),
      ...layoutColumn(by('receiver'), COL.receiver),
      ...layoutColumn(by('hop'), COL.hop),
    ];
  }, []);

  const pos = useMemo(() => Object.fromEntries(positioned.map((n) => [n.id, n])), [positioned]);
  const selected = selectedId ? pos[selectedId] : null;

  // Selecting a node dims everything it does not touch. That is the whole
  // interaction: "which cases does this receiver sit behind?"
  const neighbours = useMemo(() => {
    if (!selectedId) return null;
    const set = new Set([selectedId]);
    for (const e of graph.edges) {
      if (e.from === selectedId) set.add(e.to);
      if (e.to === selectedId) set.add(e.from);
    }
    return set;
  }, [selectedId]);

  const isLit = (id) => !neighbours || neighbours.has(id);
  const edgeLit = (e) => !neighbours || (neighbours.has(e.from) && neighbours.has(e.to));

  const selectedCases = selected?.type === 'receiver'
    ? graph.edges.filter((e) => e.to === selected.id).map((e) => e.from)
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ExhibitCard
        title="Receiving accounts — the mule signature"
        note={graph.summary}
        source={graph.source}
        asOf={graph.as_of}
        confidence={graph.confidence}
        provenance={graph.provenance}
      >
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
          {graph.legend.map((l) => {
            const s = NODE_STYLE[l.type];
            return (
              <span key={l.type} className="inline-flex items-center gap-1.5 text-[9.5px] text-text-muted" title={l.hint}>
                <span
                  className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full border-2"
                  style={{ background: s.fill, borderColor: s.stroke }}
                />
                {l.label}
              </span>
            );
          })}
        </div>

        <div className="w-full min-w-0 overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ minWidth: compact ? 440 : 500, height: compact ? 270 : 340 }}
            role="img"
            aria-label={`Link graph. ${graph.summary}. ${graph.members_note} Members flow to nine repeating receiving accounts, which flow on to five second-hop accounts.`}
          >
            <g>
              {graph.edges.map((e) => {
                const a = pos[e.from];
                const b = pos[e.to];
                if (!a || !b) return null;
                const lit = edgeLit(e);
                const mid = (a.x + b.x) / 2;
                return (
                  <path
                    key={`${e.from}-${e.to}`}
                    d={`M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`}
                    fill="none"
                    stroke={lit ? '#94A3B8' : '#E2E8F0'}
                    strokeWidth={lit ? 1.4 : 1}
                    opacity={lit ? 0.9 : 0.35}
                  />
                );
              })}
            </g>

            {positioned.map((n) => {
              const s = NODE_STYLE[n.type];
              const lit = isLit(n.id);
              const isSelected = n.id === selectedId;
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x} ${n.y})`}
                  opacity={lit ? 1 : 0.3}
                  onClick={() => setSelectedId(isSelected ? null : n.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(isSelected ? null : n.id); }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${n.label}, ${n.sublabel}${isSelected ? ', selected' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  {isSelected ? (
                    <circle r={s.r + 5} fill="none" stroke={NAVY_HEX} strokeWidth="2" />
                  ) : null}
                  <circle
                    r={s.r}
                    fill={s.fill}
                    stroke={n.state === 'critical' ? STATE_COLOR.critical : s.stroke}
                    strokeWidth={n.state === 'critical' ? 2.5 : 1.8}
                  />
                  {/* Case count doubles as the "repeating" cue — a receiver that
                      appears once is not a signature, one that appears four
                      times is. */}
                  {n.cases ? (
                    <text textAnchor="middle" dy="4" fontSize="11" fontWeight="700" fill={STATE_COLOR.warning}>
                      {n.cases}
                    </text>
                  ) : null}
                  <text
                    textAnchor={s.labelBeside ? 'start' : 'middle'}
                    x={s.labelBeside ? s.r + 6 : 0}
                    y={s.labelBeside ? 0 : s.r + 12}
                    dy={s.labelBeside ? 3 : 0}
                    fontSize="9"
                    fill="#5A6B7B"
                    fontWeight={s.labelBeside ? 700 : 500}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {selected ? (
          <div className="mt-2 rounded-xl border border-brand/15 bg-brand/[0.03] p-3">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0 text-brand" />
              <span className="text-[12px] font-bold text-text">{selected.label}</span>
              <span className="text-[10px] text-text-muted">{selected.sublabel}</span>
              {selected.opened ? (
                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[9px] font-semibold text-text-subtle">{selected.opened}</span>
              ) : null}
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="ml-auto text-[10px] font-semibold text-brand hover:underline"
              >
                Clear
              </button>
            </div>
            {selected.amount ? (
              <p className="text-[10.5px] text-text-muted">
                Received <span className="font-semibold tabular-nums text-text">${selected.amount.toLocaleString()}</span> across the campaign window.
              </p>
            ) : null}
            {selectedCases.length ? (
              <p className="mt-0.5 text-[10.5px] text-text-muted">
                Linked members: <span className="font-semibold text-text">{selectedCases.join(', ')}</span>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-[10px] text-text-subtle">
            Select an account to see what it connects to. {graph.members_note}
          </p>
        )}
      </ExhibitCard>
    </motion.div>
  );
}
