import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  getSystemOverview,
  getComponents,
  getComponent,
  getRootCause,
  getComponentStateHistory,
} from '@/data/nfcu/platform-admin/observabilityData';
import SystemHealthOverview from './SystemHealthOverview';
import ComponentFleetTable from './ComponentFleetTable';
import ComponentDetailPanel from './ComponentDetailPanel';
import ComponentPicker from './ComponentPicker';

/**
 * Agent Observability — the Platform Admin's live view of the AI platform.
 *
 * This is data source ds-pa-07 ("Grafana (via API)") finally rendered: the
 * telemetry pulled through an API and re-drawn as Gen UI in Ultra, rather than
 * an embedded Grafana panel.
 *
 * Three bands, one page:
 *   1. Platform overview  — totals, health split, trend, layer gauges
 *   2. Components         — the fleet; the row is the picker
 *   3. Detail             — live metrics, root cause, event log, state history
 *
 * DEFAULT SELECTION: card-disputes-assist. The turn-6 chat dashboard reports
 * "Card Disputes: Watch" and never explains it; the page opens already showing
 * the diagnosis, so a presenter lands on the story instead of hunting for it.
 * The selection lives in the URL (?c=), so re-clicking the nav item is a clean
 * reset mid-demo.
 */
const DEFAULT_COMPONENT = 'card-disputes-assist';

export default function PlatformAdminObservability() {
  const overview = useAsyncData(getSystemOverview);
  const components = useAsyncData(getComponents);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('c') || DEFAULT_COMPONENT;

  const [detail, setDetail] = useState(null);
  const [rootCause, setRootCause] = useState(null);
  const [stateHistory, setStateHistory] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getComponent(selectedId),
      getRootCause(selectedId),
      getComponentStateHistory(selectedId),
    ])
      .then(([c, rca, history]) => {
        if (!alive) return;
        setDetail(c);
        setRootCause(rca);
        setStateHistory(history);
      })
      .catch(() => {
        if (alive) { setDetail(null); setRootCause(null); setStateHistory(null); }
      });
    return () => { alive = false; };
  }, [selectedId]);

  const handleSelect = useCallback(
    (id) => { setSearchParams({ c: id }, { replace: true }); },
    [setSearchParams],
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50">
      <div className="max-w-[1400px] mx-auto px-6 py-5 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-start justify-between gap-3"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand" />
              <h1 className="text-lg font-bold text-text">Agent Observability</h1>
            </div>
            <p className="text-[12px] text-text-muted mt-0.5">
              Live health of the AI platform — what each agent did, why, and what it recommends next.
              Agents diagnose and recommend; a human approves.
            </p>
          </div>

          <ComponentPicker components={components} value={selectedId} onChange={handleSelect} />
        </motion.div>

        <SystemHealthOverview overview={overview} />

        <ComponentFleetTable components={components} selectedId={selectedId} onSelect={handleSelect} />

        <ComponentDetailPanel component={detail} rootCause={rootCause} stateHistory={stateHistory} />
      </div>
    </div>
  );
}
