/**
 * JourneyMap — one persona's experience across the scenario the demo covers.
 *
 * Tenant-agnostic: it renders whatever `getter` returns. Three specs use the
 * same fixture shape (TrackLynk's HSE §9, the Workbench's operator §9A and
 * admin §9B), so the only per-tenant strings are the title and the idle hint.
 *
 * The emotion line is the spine — its low point is where the demo's payoff
 * sits. The traceability table underneath is the claim that nothing here was
 * invented: every pain point maps to a signal card and a demo step.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Frown, Meh, Lightbulb, AlertCircle, Info } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import MaximizablePanel, { MaximizeButton } from '../common/MaximizablePanel';

const EMOTION_TONE = {
  1: { dot: '#9F1239', text: 'text-rose-800', wrap: 'border-rose-300 bg-rose-50', Icon: Frown },
  2: { dot: '#DC2626', text: 'text-rose-700', wrap: 'border-rose-200 bg-rose-50/60', Icon: Frown },
  3: { dot: '#D97706', text: 'text-amber-700', wrap: 'border-amber-200 bg-amber-50/60', Icon: Meh },
  4: { dot: '#059669', text: 'text-emerald-700', wrap: 'border-emerald-200 bg-emerald-50/60', Icon: Meh },
  5: { dot: '#059669', text: 'text-emerald-700', wrap: 'border-emerald-200 bg-emerald-50/60', Icon: Meh },
};

function Chip() {
  return (
    <span
      title="Illustrative figure."
      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-text-subtle whitespace-nowrap"
    >
      <Info className="w-3 h-3" />
      Illustrative data
    </span>
  );
}

/** Emotion sparkline across the phases — the shape IS the story. */
function EmotionLine({ phases, activeId, onSelect }) {
  const w = 100;
  const h = 34;
  const stepX = w / (phases.length - 1 || 1);
  const y = (e) => h - ((e - 1) / 4) * (h - 8) - 4;
  const points = phases.map((p, i) => `${i * stepX},${y(p.emotion)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="#CBD5E1" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      {phases.map((p, i) => (
        <circle
          key={p.id}
          cx={i * stepX}
          cy={y(p.emotion)}
          r={activeId === p.id ? 3.4 : 2.4}
          fill={EMOTION_TONE[p.emotion]?.dot || '#94A3B8'}
          stroke="#fff"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => onSelect(p.id)}
        />
      ))}
    </svg>
  );
}

export default function JourneyMap({ getter, title = 'Journey', idleHint = '' }) {
  const journey = useAsyncData(getter);
  const [activeId, setActiveId] = useState(null);

  if (!journey) return null;

  const active = journey.phases.find((p) => p.id === activeId) || null;
  const railCols = journey.phases.length >= 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4';

  return (
    <MaximizablePanel className="p-4 sm:p-5" label="Journey map">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text">{title}</h3>
          <p className="text-[11.5px] text-text-muted mt-1 leading-relaxed max-w-3xl">
            {journey.scenario} {journey.timeframe}
          </p>
        </div>
        <span className="flex items-center gap-2"><Chip /><MaximizeButton /></span>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-4 text-[11px]">
        <span className="text-text-muted">
          Baseline satisfaction{' '}
          <span className="font-bold text-rose-700">{journey.baselineSatisfaction}/10</span>{' '}
          <span className="text-text-subtle">— {journey.baselineNote.toLowerCase()}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-text-subtle">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Moment of truth
        </span>
      </div>

      {/* Emotion spine */}
      <EmotionLine phases={journey.phases} activeId={activeId} onSelect={setActiveId} />

      {/* Phase rail */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${railCols} gap-2.5 mt-2 mb-4`}>
        {journey.phases.map((phase, i) => {
          const tone = EMOTION_TONE[phase.emotion] || EMOTION_TONE[3];
          const Icon = tone.Icon;
          const isActive = activeId === phase.id;
          return (
            <motion.button
              type="button"
              key={phase.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              onMouseEnter={() => setActiveId(phase.id)}
              onFocus={() => setActiveId(phase.id)}
              onClick={() => setActiveId(isActive ? null : phase.id)}
              className={`text-left rounded-xl border p-3 min-w-0 transition-shadow cursor-pointer ${tone.wrap} ${
                isActive ? 'shadow-md ring-2 ring-brand/30' : 'hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-text-subtle">
                  Phase {phase.index}
                </span>
                {phase.momentOfTruth && <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />}
              </div>
              <p className="text-[12px] font-semibold text-text leading-snug mb-1.5">{phase.name}</p>
              <p className={`inline-flex items-center gap-1 text-[10.5px] font-semibold ${tone.text}`}>
                <Icon className="w-3 h-3" /> {phase.emotion}/5 · {phase.emotionLabel}
              </p>
              <p className="text-[9.5px] text-text-subtle mt-1.5">{phase.demoStep}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Detail for the hovered/selected phase */}
      <div className="rounded-xl border border-border-subtle bg-surface-2 p-3.5 mb-5 min-h-[120px]">
        {active ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="text-[13px] font-semibold text-text">
                Phase {active.index} — {active.name}
              </p>
              {active.momentOfTruth && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-amber-800">
                  <Star className="w-2.5 h-2.5 fill-amber-600 text-amber-600" /> Moment of truth
                </span>
              )}
            </div>
            {active.momentLabel && (
              <p className="text-[11.5px] italic text-amber-800 mb-2">{active.momentLabel}</p>
            )}
            <p className="text-[12px] text-text-muted leading-relaxed mb-2">{active.action}</p>
            <p className="text-[12px] text-text italic leading-relaxed mb-2.5">“{active.thought}”</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-1">
                  <AlertCircle className="w-3 h-3 text-rose-600" /> Pain points
                </p>
                <ul className="space-y-0.5">
                  {active.painPoints.map((p, i) => (
                    <li key={i} className="text-[11.5px] text-text-muted leading-snug">• {p}</li>
                  ))}
                </ul>
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-1">
                  <Lightbulb className="w-3 h-3 text-emerald-600" /> Opportunity
                </p>
                <p className="text-[11.5px] text-text-muted leading-snug">{active.opportunity}</p>
              </div>
            </div>

            <p className="text-[10px] text-text-subtle mt-2.5">
              Touchpoints today: {active.touchpoints.join(' · ')}
            </p>
          </motion.div>
        ) : (
          <p className="text-xs text-text-muted leading-relaxed">
            {idleHint || 'Hover a phase for its pain points, the persona’s own words, and the opportunity that answers them.'}
          </p>
        )}
      </div>

      {/* Traceability — the "nothing here was invented" claim */}
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2">
        Journey → signal → demo traceability
      </p>
      <div className="overflow-x-auto scrollbar-sleek">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="pb-2 pr-3 text-[10px] font-bold uppercase tracking-wider text-text-subtle">Phase</th>
              <th className="pb-2 pr-3 text-[10px] font-bold uppercase tracking-wider text-text-subtle">Pain point</th>
              <th className="pb-2 pr-3 text-[10px] font-bold uppercase tracking-wider text-text-subtle">Signal card</th>
              <th className="pb-2 text-[10px] font-bold uppercase tracking-wider text-text-subtle">Demo step</th>
            </tr>
          </thead>
          <tbody>
            {journey.traceability.map((row, i) => (
              <tr key={i} className="border-b border-border-subtle/60 last:border-0">
                <td className="py-2 pr-3 text-[11.5px] font-medium text-text align-top whitespace-nowrap">{row.phase}</td>
                <td className="py-2 pr-3 text-[11.5px] text-text-muted align-top">{row.painPoint}</td>
                <td className="py-2 pr-3 text-[11.5px] text-text-muted align-top">{row.signal}</td>
                <td className="py-2 text-[11.5px] font-medium text-text-muted align-top whitespace-nowrap">{row.demoStep}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MaximizablePanel>
  );
}
