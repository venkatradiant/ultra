import { useEffect, useRef, useState, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Download } from 'lucide-react';
import mermaid from 'mermaid';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getRoutingMermaid, ROUTING_NODE_META } from '@/data/nfcu/platform-admin/governanceData';

/**
 * Turn 4 — Routing Logic Diagram. The two-gate model rendered as an inline
 * Mermaid flowchart: field tagging → sovereignty gate (PII → SLM) → capability
 * gate (complex and safe → frontier, else SLM). Enhanced to read as a self-
 * explanatory journey: branded semantic colors, a legend, continuously flowing
 * directional edges (see .routing-diagram in index.css), and hover-to-highlight
 * with plain-language tooltips. Exportable to SVG.
 */

// Monotonic counter so every mermaid.render() call gets a unique DOM id.
let RENDER_SEQ = 0;

// Forward edges of the routing graph, used to light up a node's downstream
// route on hover. Kept in sync with ROUTING_MERMAID in governanceData.ts.
const EDGES = [
  ['A', 'B'],
  ['B', 'S'],
  ['B', 'C'],
  ['C', 'S'],
  ['C', 'D'],
  ['D', 'S'],
  ['D', 'L'],
];

// Role → semantic token pair (strong stroke, subtle fill). Resolved to concrete
// colors at render time so it tracks the active client's brand tokens.
const ROLE_TOKENS = {
  entry: { fill: 'var(--color-brand-subtle)', stroke: 'var(--color-brand)' },
  gate: { fill: 'var(--color-warning-subtle)', stroke: 'var(--color-warning)' },
  local: { fill: 'var(--color-success-subtle)', stroke: 'var(--color-success)' },
  frontier: { fill: 'var(--color-info-subtle)', stroke: 'var(--color-info)' },
};

const ROLE_SWATCH = {
  entry: 'bg-brand',
  gate: 'bg-warning',
  local: 'bg-success',
  frontier: 'bg-info',
};

const LEGEND = [
  { role: 'entry', label: 'Start', shape: 'stadium' },
  { role: 'gate', label: 'Decision gate', shape: 'diamond' },
  { role: 'local', label: 'Stays local (SLM)', shape: 'stadium' },
  { role: 'frontier', label: 'Frontier LLM', shape: 'stadium' },
];

/** Convert a computed color to `#rrggbb` (Mermaid's classDef parser splits on
 *  commas, so rgb() values would corrupt it — hex is safe). Handles both
 *  `rgb(0-255 …)` and the `color(srgb 0-1 …)` form browsers return for
 *  `color-mix()` results. */
function rgbToHex(color) {
  const nums = color.match(/[\d.]+/g);
  if (!nums || nums.length < 3) return color;
  let [r, g, b] = nums.map(Number);
  // color(srgb …) channels are 0–1; scale them to 0–255.
  if (/^color\(/i.test(color) || (r <= 1 && g <= 1 && b <= 1)) {
    r *= 255; g *= 255; b *= 255;
  }
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

/** Resolve a CSS color expression (var/color-mix) to a concrete #hex string. */
function resolveColor(expr) {
  const el = document.createElement('span');
  el.style.color = expr;
  el.style.display = 'none';
  document.body.appendChild(el);
  const value = getComputedStyle(el).color;
  el.remove();
  return rgbToHex(value);
}

/** Append classDefs (from resolved brand tokens) so the :::role tags get color. */
function styleDefinition(definition) {
  const text = resolveColor('var(--color-text)');
  const defs = Object.entries(ROLE_TOKENS)
    .map(
      ([role, { fill, stroke }]) =>
        `  classDef ${role} fill:${resolveColor(fill)},stroke:${resolveColor(stroke)},stroke-width:2px,color:${text};`,
    )
    .join('\n');
  return `${definition}\n${defs}`;
}

/** Nodes reachable from `start` (inclusive), following forward edges. */
function reachableFrom(start) {
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift();
    for (const [from, to] of EDGES) {
      if (from === cur && !seen.has(to)) {
        seen.add(to);
        queue.push(to);
      }
    }
  }
  return seen;
}

export default function RoutingDiagram() {
  const definition = useAsyncData(getRoutingMermaid);
  const [svg, setSvg] = useState('');
  const [hovered, setHovered] = useState(null); // { id, left, top, below }
  const boxRef = useRef(null);
  // mermaid.render() needs a DOM-safe id; useId's colons aren't valid there.
  const baseIdRef = useRef(`routing-${useId().replace(/:/g, '')}`);

  // Render the diagram — branded base theme + token-driven node colors.
  useEffect(() => {
    if (!definition) return undefined;
    let active = true;
    // A fresh id per render call — never reuse one that might still be in the
    // DOM (e.g. StrictMode's double-invoke), which makes mermaid.render throw.
    RENDER_SEQ += 1;
    const renderId = `${baseIdRef.current}-${RENDER_SEQ}`;
    try {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        flowchart: { curve: 'basis', useMaxWidth: true },
        themeVariables: {
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: '14px',
          lineColor: resolveColor('var(--color-brand-muted)'),
          primaryColor: resolveColor('var(--color-surface-2)'),
          primaryBorderColor: resolveColor('var(--color-border)'),
          primaryTextColor: resolveColor('var(--color-text)'),
          edgeLabelBackground: resolveColor('var(--color-surface)'),
        },
      });
      mermaid
        .render(renderId, styleDefinition(definition))
        .then((res) => { if (active) setSvg(res.svg); })
        // Keep the last good render on a transient failure — never blank out
        // an already-visible diagram.
        .catch(() => {});
    } catch {
      // Defensive: a synchronous Mermaid parse error must not crash the tree.
    }
    return () => { active = false; };
  }, [definition]);

  // Hover-to-highlight + tooltips are wired with React's own onMouseOver /
  // onMouseLeave on the container (below), NOT manual addEventListener. Mermaid
  // re-renders swap the SVG DOM (and React can re-create the container div), so
  // hand-attached listeners get silently dropped — that's the "interactivity
  // stops after a moment" bug. React re-binds these synthetic handlers on every
  // render, so they always work; nodes/edges are re-queried fresh per event.
  const currentIdRef = useRef(null);

  const clearHighlight = useCallback(() => {
    const svgEl = boxRef.current?.querySelector('svg');
    svgEl?.closest('.routing-diagram')?.classList.remove('rd-dim');
    svgEl?.querySelectorAll('.rd-hl').forEach((e) => e.classList.remove('rd-hl'));
    currentIdRef.current = null;
    setHovered(null);
  }, []);

  const handleHover = useCallback((e) => {
    const g = e.target?.closest?.('g.node');
    if (!g) return;
    const m = g.id.match(/flowchart-([A-Za-z]+)-\d+$/);
    if (!m || m[1] === currentIdRef.current) return;
    const id = m[1];
    const box = boxRef.current;
    const svgEl = box?.querySelector('svg');
    if (!svgEl) return;
    currentIdRef.current = id;
    const reach = reachableFrom(id);
    svgEl.closest('.routing-diagram')?.classList.add('rd-dim');
    svgEl.querySelectorAll('g.node').forEach((n) => {
      const nm = n.id.match(/flowchart-([A-Za-z]+)-\d+$/);
      n.classList.toggle('rd-hl', !!nm && reach.has(nm[1]));
    });
    svgEl.querySelectorAll('g.edgePaths .flowchart-link').forEach((el) => {
      const em = el.id.match(/L_([A-Za-z]+)_[A-Za-z]+_\d+$/);
      el.classList.toggle('rd-hl', !!em && reach.has(em[1]));
    });
    // Clamp the (centered) tooltip so it never spills past the card edges.
    const nrect = g.getBoundingClientRect();
    const brect = box.getBoundingClientRect();
    const TIP_W = 224; // matches w-56
    const PAD = 8;
    const half = TIP_W / 2;
    const centerX = nrect.left - brect.left + nrect.width / 2;
    const left = Math.max(half + PAD, Math.min(centerX, brect.width - half - PAD));
    // Flip below the node when there isn't room to sit above it.
    const topRel = nrect.top - brect.top;
    const below = topRel < 84;
    setHovered({ id, left, top: below ? nrect.bottom - brect.top + 8 : topRel - 8, below });
  }, []);

  const handleExport = useCallback(() => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nfcu-routing-logic.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [svg]);

  if (!definition) return null;

  const tip = hovered ? ROUTING_NODE_META[hovered.id] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-brand" />
          <h3 className="text-sm font-semibold text-text">Routing Logic — two gates</h3>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={!svg}
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-text-muted hover:text-brand border border-border hover:border-brand/30 rounded-lg px-2 py-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-3 h-3" /> SVG
        </button>
      </div>
      <p className="text-xs text-text-subtle mb-3">
        Follow the flow left to right: tag the field, clear two gates, and it either stays local or reaches the frontier.
        Hover any step for detail.
      </p>

      {/* Legend — what the colors and shapes mean */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
        {LEGEND.map((item) => (
          <span key={item.role} className="inline-flex items-center gap-1.5 text-[10.5px] text-text-muted">
            <span
              className={`inline-block ${ROLE_SWATCH[item.role]} ${
                item.shape === 'diamond' ? 'w-2.5 h-2.5 rotate-45 rounded-[2px]' : 'w-3.5 h-2.5 rounded-full'
              }`}
            />
            {item.label}
          </span>
        ))}
      </div>

      <div
        ref={boxRef}
        onMouseOver={handleHover}
        onMouseLeave={clearHighlight}
        onFocus={handleHover}
        onBlur={clearHighlight}
        className="relative rounded-lg bg-surface-2 px-2 py-4"
      >
        {svg
          ? (
            // mermaid emits a fixed-width SVG; force it to fill the card so the
            // two gates stay legible on a projector.
            <div
              className="routing-diagram w-full [&_svg]:!w-full [&_svg]:!max-w-none [&_svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )
          : <div className="text-[11px] text-text-subtle py-8 text-center">Rendering diagram…</div>}

        {/* Hover tooltip — plain-language explanation of the focused node */}
        <AnimatePresence>
          {tip && (
            <motion.div
              key={hovered.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className={`pointer-events-none absolute z-10 w-56 -translate-x-1/2 ${hovered.below ? '' : '-translate-y-full'}`}
              style={{ left: hovered.left, top: hovered.top }}
            >
              <div className="rounded-lg border border-border bg-surface shadow-lg px-3 py-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`w-2 h-2 rounded-full ${ROLE_SWATCH[tip.role]}`} />
                  <span className="text-[11px] font-semibold text-text">{tip.title}</span>
                </div>
                <p className="text-[10.5px] text-text-muted leading-snug">{tip.body}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 pt-3 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-lg bg-surface-2 px-3 py-2">
          <div className="text-[10px] font-bold text-text uppercase tracking-wide">Gate 1 · Safe to send</div>
          <p className="text-[10.5px] text-text-muted leading-snug mt-0.5">
            Any field carrying PII stays in the in-environment SLM. A hard constraint, not a preference.
          </p>
        </div>
        <div className="rounded-lg bg-surface-2 px-3 py-2">
          <div className="text-[10px] font-bold text-text uppercase tracking-wide">Gate 2 · Worth sending</div>
          <p className="text-[10.5px] text-text-muted leading-snug mt-0.5">
            The SLM is the default. A task reaches the frontier only when it needs reasoning the SLM can't do reliably —
            and only if it's within budget.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
