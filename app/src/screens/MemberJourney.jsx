import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JourneyRail from '../components/journey/JourneyRail';
import FrictionHotspot from '../components/journey/FrictionHotspot';
import ChatInput from '../components/chat/ChatInput';
import ChatDrawer from '../components/chat/ChatDrawer';
import journeyMap from '../data/journeyMap.json';
import penfedJourneyMap from '../data/penfed/journeyMap.json';
import nfcuWorkforceMap from '../data/nfcu/nfcuWorkforceMap.json';
import DataFlowLineageMap from '../components/ussfcu/cfo/DataFlowLineageMap';
import BusinessPerformanceView from '../components/ussfcu/ceo/performance/BusinessPerformanceView';
import { usePersona } from '../context/PersonaContext';
import { useBranding } from '../context/BrandingContext';

const journeyChips = [
  "What's driving the mortgage drop-off?",
  "Show me the member sentiment",
  "Which members are most at risk of leaving?",
];

const nfcuWorkforceChips = [
  "What's our biggest workforce risk this week?",
  "Show me the queue coverage gap",
  "Which agents are showing burnout signals?",
];

const cfoLineageChips = [
  "Show me the data flow from the core to Tableau",
  "Which board figures have no lineage?",
  "What would full lineage do for the audit?",
];

export default function MemberJourney() {
  const [activePhaseId, setActivePhaseId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState(null);
  const persona = usePersona();
  const { clientId } = useBranding();

  const isNFCU = persona?.id?.startsWith('nfcu_');
  const isCfo = persona?.id === 'ussfcu_cfo';
  const isCeo = persona?.id === 'ussfcu_ceo';
  const baseJourneyMap = clientId === 'penfed' ? penfedJourneyMap : journeyMap;
  const mapData = isNFCU ? nfcuWorkforceMap : baseJourneyMap;
  const chips = isNFCU ? nfcuWorkforceChips : journeyChips;

  // USSFCU CEO — Business Performance is the executive roll-up: assets and
  // growth, loan portfolio, deposits, membership and geography, and capital,
  // each exhibit shown with its source, as-of date, and confidence.
  if (isCeo) {
    return <BusinessPerformanceView />;
  }

  // USSFCU CFO — the journey page becomes the Data Flow & Lineage view: how
  // figures move from the Jack Henry core and Thought Machine ledger into the
  // GL, the warehouse, and Tableau, with the undocumented transform points and
  // lineage-gap figures highlighted.
  if (isCfo) {
    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
        <div className="flex-1 overflow-y-auto scrollbar-sleek px-6 pt-6 pb-28">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Data Flow &amp; Lineage</h2>
          <p className="text-[12px] text-text-muted mb-4 max-w-2xl">
            How every reported figure moves from the Jack Henry core and the Thought Machine ledger into the GL,
            Snowflake, and Tableau — with the undocumented transformation points and untraced figures the audit flagged.
          </p>
          <div className="max-w-4xl">
            <DataFlowLineageMap />
          </div>
        </div>

        {/* Persistent Chat Input */}
        <div className="fixed bottom-0 left-[260px] right-0 bg-surface border-t border-border px-6 py-4 z-30">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSend={(text) => { setInitialQuery(text); setDrawerOpen(true); }}
              placeholder="Ask about lineage, transformations, or untraced figures…"
              suggestions={cfoLineageChips}
            />
          </div>
        </div>

        <ChatDrawer
          isOpen={drawerOpen}
          onClose={() => { setDrawerOpen(false); setInitialQuery(null); }}
          preloadedChips={cfoLineageChips}
          initialQuery={initialQuery}
        />
      </div>
    );
  }

  const railLabel = isNFCU ? 'Workforce Planning View' : 'Member Journey Map';
  const allHotspotsLabel = isNFCU ? 'All Workforce Issues' : 'All Friction Hotspots';
  const phaseHotspotsLabel = isNFCU ? 'Issues — ' : 'Friction Points — ';
  const emptyLabel = isNFCU ? 'No issues in this phase' : 'No friction hotspots in this phase';
  const inputPlaceholder = isNFCU ? 'Ask about workforce planning…' : 'Ask about this journey…';

  const activePhase = mapData.phases.find((p) => p.id === activePhaseId);

  const hotspots = activePhase
    ? activePhase.frictionHotspots
    : mapData.phases.flatMap((p) =>
        p.frictionHotspots.map((h) => ({ ...h, phaseName: p.name }))
      );

  const handlePhaseClick = (phase) => {
    setActivePhaseId(activePhaseId === phase.id ? null : phase.id);
  };

  const openDrawerWithQuery = (query) => {
    setInitialQuery(query);
    setDrawerOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
      {/* Rail */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">{railLabel}</h2>
        <JourneyRail
          phases={mapData.phases}
          activePhaseId={activePhaseId}
          onPhaseClick={handlePhaseClick}
        />
      </div>

      {/* Hotspots / Issues */}
      <div className="flex-1 overflow-y-auto scrollbar-sleek px-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-muted">
            {activePhase ? `${phaseHotspotsLabel}${activePhase.name}` : allHotspotsLabel}
          </h3>
          {activePhase && (
            <button
              onClick={() => setActivePhaseId(null)}
              className="text-xs text-brand font-medium hover:underline cursor-pointer"
            >
              Show all
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activePhaseId || 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {hotspots.length > 0 ? (
              hotspots.map((hotspot, idx) => (
                <FrictionHotspot key={idx} hotspot={hotspot} index={idx} />
              ))
            ) : (
              <div className="text-center py-12 text-sm text-text-subtle">
                {emptyLabel}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Persistent Chat Input */}
      <div className="fixed bottom-0 left-[260px] right-0 bg-surface border-t border-border px-6 py-4 z-30">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={(text) => openDrawerWithQuery(text)}
            placeholder={inputPlaceholder}
            suggestions={chips}
          />
        </div>
      </div>

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setInitialQuery(null); }}
        preloadedChips={chips}
        initialQuery={initialQuery}
      />
    </div>
  );
}
