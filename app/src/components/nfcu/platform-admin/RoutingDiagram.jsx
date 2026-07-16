import { useEffect, useRef, useState, useCallback, useId } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Download } from 'lucide-react';
import mermaid from 'mermaid';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getRoutingMermaid } from '@/data/nfcu/platform-admin/governanceData';

/**
 * Turn 4 — Routing Logic Diagram. The two-gate model rendered as an inline
 * Mermaid flowchart: field tagging → sovereignty gate (PII → SLM) → capability
 * gate (complex and safe → frontier, else SLM). Exportable to SVG.
 */
mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' });

export default function RoutingDiagram() {
  const definition = useAsyncData(getRoutingMermaid);
  const [svg, setSvg] = useState('');
  // mermaid.render() needs a unique DOM-safe id; useId's colons aren't valid there.
  const idRef = useRef(`routing-${useId().replace(/:/g, '')}`);

  useEffect(() => {
    if (!definition) return undefined;
    let active = true;
    mermaid
      .render(idRef.current, definition)
      .then((res) => { if (active) setSvg(res.svg); })
      .catch(() => { if (active) setSvg(''); });
    return () => { active = false; };
  }, [definition]);

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
      <p className="text-xs text-text-subtle mb-4">
        Safe to send (PII stays local), then worth sending (only complex tasks reach the frontier)
      </p>

      <div className="rounded-lg bg-surface-2 px-2 py-4">
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
            The SLM is the default. A task reaches the frontier only when it needs reasoning the SLM can't do reliably.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
