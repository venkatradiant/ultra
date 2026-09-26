import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { usePolledData } from '@/hooks/usePolledData';
import {
  getSystemOverview,
  getComponents,
  getComponent,
  getComponentStateHistory,
  getCorrelationSummary,
  getRemediationStats,
} from '@/data/nfcu/platform-admin/observabilityData';
import SystemHealthOverview from './SystemHealthOverview';
import ComponentFleetTable from './ComponentFleetTable';
import ComponentDetailPanel from './ComponentDetailPanel';
import ComponentPicker from './ComponentPicker';
import CorrelationSummaryCard from './CorrelationSummaryCard';
import RemediationStatsCard from './RemediationStatsCard';

/**
 * Agent Observability — the Platform Admin's live view of the AI platform.
 *
 * Polls all data automatically:
 *   - overview + components every 5s (health summary + fleet table)
 *   - detail + rootCause + stateHistory every 5s (selected component)
 *
 * ComponentDetailPanel polls metrics (5s) and activity (3s) itself.
 */
const DEFAULT_COMPONENT = null;

// Stable getter wrappers so usePolledData's dep check stays satisfied.
// usePolledData takes (getter, key) — for no-key getters we pass a fixed key.
const getOverview = () => getSystemOverview();
const getAllComponents = () => getComponents();
const getCorrelation = () => getCorrelationSummary();
const getRemediation = () => getRemediationStats();

export default function PlatformAdminObservability() {
  // Poll overview and full component fleet every 5 seconds
  const overview = usePolledData(getOverview, 'overview', { intervalMs: 5000 });
  const components = usePolledData(getAllComponents, 'components', { intervalMs: 5000 });
  const correlationData = usePolledData(getCorrelation, 'correlation', { intervalMs: 60000 });
  const remediationData = usePolledData(getRemediation, 'remediation', { intervalMs: 60000 });

  const [searchParams, setSearchParams] = useSearchParams();
  // Use URL param or first live component — never a hardcoded static component
  const firstLiveComponent = components?.[0]?.component ?? null;
  const selectedId = searchParams.get('c') || firstLiveComponent;

  const [detail, setDetail] = useState(null);
  const [stateHistory, setStateHistory] = useState(null);

  // Poll selected component detail every 5 seconds
  useEffect(() => {
    let alive = true;

    const fetchDetail = async () => {
      try {
        const [c, history] = await Promise.all([
          getComponent(selectedId),
          getComponentStateHistory(selectedId),
        ]);
        if (!alive) return;
        setDetail(c);
        setStateHistory(history);
      } catch {
        if (alive) { setDetail(null); setStateHistory(null); }
      }
    };

    // Fetch immediately then poll every 5 seconds
    fetchDetail();
    const timer = setInterval(fetchDetail, 5000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [selectedId]);

  const detailRef = useRef(null);

  const handleLayerClick = useCallback((layerId) => {
    const el = document.getElementById(`fleet-layer-${layerId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleSelect = useCallback(
    (id) => {
      setSearchParams({ c: id }, { replace: true });
      // Scroll to detail panel smoothly
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    },
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

        <SystemHealthOverview overview={overview} onLayerClick={handleLayerClick} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <CorrelationSummaryCard data={correlationData} />
          <RemediationStatsCard data={remediationData} />
        </div>

        <ComponentFleetTable components={components} selectedId={selectedId} onSelect={handleSelect} />

        <div ref={detailRef}><ComponentDetailPanel component={detail} rootCause={null} stateHistory={stateHistory} /></div>
      </div>
    </div>
  );
}