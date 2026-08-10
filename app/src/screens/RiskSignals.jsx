import { useState } from 'react';
import RiskSignalsTable from '../components/tables/RiskSignalsTable';
import { AMLClustersCard, CreditRiskCard, RegulatoryReadinessCard } from '../components/cards/RiskSignalCard';
import ComplaintTrajectory from '../components/charts/ComplaintTrajectory';
import NFCUQualitySignalsTable from '../components/nfcu/NFCUQualitySignalsTable';
import { NFCUQualityPostureCard, NFCUComplianceCard, NFCUFCRTrendChart } from '../components/nfcu/NFCUQualityCards';
import GovernanceSignalsTable from '../components/ussfcu/cfo/GovernanceSignalsTable';
import GovernanceKpiCards from '../components/ussfcu/cfo/GovernanceKpiCards';
import PrioritySignalsView from '../components/ussfcu/ceo/PrioritySignalsView';
import EsfcuPrioritySignalsView from '../components/esfcu/ceo/PrioritySignalsView';
import DisclosureCalendarPage from '../components/ussfcu/compliance/DisclosureCalendarPage';
import QualitySignalsPage from '../components/newfold/quality/QualitySignalsPage';
import ChatInput from '../components/chat/ChatInput';
import ChatDrawer from '../components/chat/ChatDrawer';
import riskExtras from '../data/riskScreenExtras.json';
import evelynChecklist from '../data/ussfcu/evelyn/disclosureChecklist.json';
import evelynCalendar from '../data/ussfcu/evelyn/disclosureCalendar.json';
import nadiaChecklist from '../data/ussfcu/nadia/fileChecklist.json';
import nadiaCalendar from '../data/ussfcu/nadia/fileCalendar.json';
import { usePersona } from '../context/PersonaContext';

const nfcuQualityChips = [
  "Show me quality scores by team this week",
  "Which agents need coaching?",
  "Show me sentiment trends by queue",
  "Walk me through the compliance issue",
  "Show me the repeat contact data",
  "Generate a quality scorecard",
  "Compare FCR this month vs. last month",
];

const cfoGovernanceChips = [
  "Show me where the numbers break",
  "Show me the CFO and Lending parity gap",
  "Which board figures have no lineage?",
  "Generate the audit evidence package",
  "Draft the data-governance remediation plan",
];

export default function RiskSignals() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState(null);
  const persona = usePersona();

  const isNFCU = persona.id.startsWith('nfcu_');
  const isCfo = persona.id === 'ussfcu_cfo';
  const isCeo = persona.id === 'ussfcu_ceo';
  const isEsfcuCeo = persona.id === 'esfcu_ceo';
  const isEvelyn = persona.id === 'ussfcu_evelyn';
  const isNadia = persona.id === 'ussfcu_nadia';
  const screenChips = isCfo ? cfoGovernanceChips : isNFCU ? nfcuQualityChips : riskExtras.riskScreenChips;
  const inputPlaceholder = isCfo ? 'Ask about reconciliation breaks, parity, or lineage…' : isNFCU ? 'Ask about quality signals...' : 'Ask about risk signals...';
  const leftColLabel = isCfo ? 'Active Governance Signals' : isNFCU ? 'Active Quality Signals' : 'Active Risk Signals';
  const rightColLabel = isCfo ? 'Governance Posture' : isNFCU ? 'Compliance & Experience Summary' : 'Forward-Looking Summary';

  // Newfold Digital — the Quality Signals page: compliance posture (PCI,
  // auto-renewal disclosure), disclosure-adherence timeline, repeat-contact
  // drivers, sentiment by brand, and quality-score distribution.
  if (persona.id.startsWith('newfold_')) {
    return <QualitySignalsPage />;
  }

  // USSFCU CEO — the state-of-the-business signals surface: the primary
  // liquidity watch as a hero (with View Full Briefing + trace), the two steady
  // signals, and the executive posture panel.
  if (isCeo) {
    return <PrioritySignalsView />;
  }

  // ESFCU CEO — the same executive altitude on ESFCU's own signal set: the
  // liquidity watch as hero, the Howard University reconciliation gap, the
  // seasonality window, membership, and capital as the assurance line.
  if (isEsfcuCeo) {
    return <EsfcuPrioritySignalsView />;
  }

  const openDrawerWithQuery = (query) => {
    setInitialQuery(query);
    setDrawerOpen(true);
  };

  // USSFCU Evelyn / Nadia — the Disclosure Calendar: the member-specific
  // checklist (what is required) beside the calendar (when it is due, and what is
  // at risk). Evelyn sees a representative file across the population; Nadia sees
  // the single file she is working.
  if (isEvelyn || isNadia) {
    const disclosureChips = isEvelyn
      ? ["What is on the disclosure clock this week?", "Build a member's disclosure checklist and calendar", "Generate the exam evidence package"]
      : ["Build the disclosure checklist and calendar", "Document the cure", "Generate the daily exception report"];
    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
        <div className="flex-1 overflow-y-auto scrollbar-sleek px-6 pt-6 pb-28">
          <DisclosureCalendarPage
            heading={isEvelyn ? 'Disclosure Calendar — Portfolio' : 'Disclosure Calendar — File 20-4471'}
            description={
              isEvelyn
                ? 'Every disclosure a member is owed, on its required date under the rules. Past-due and at-risk items are flagged; the same engine surfaces the batch — 20 mortgages waiting on a disclosure — for a single human-in-the-loop approval.'
                : 'The disclosure checklist and calendar for the file you are working. The late Loan Estimate is flagged for a documented cure and the Closing Disclosure is plotted at least 3 business days before closing.'
            }
            checklist={isEvelyn ? evelynChecklist : nadiaChecklist}
            calendar={isEvelyn ? evelynCalendar : nadiaCalendar}
          />
        </div>

        {/* Persistent Chat Input */}
        <div className="fixed bottom-0 left-[260px] right-0 bg-surface border-t border-border px-6 py-4 z-30">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSend={(text) => openDrawerWithQuery(text)}
              placeholder={isEvelyn ? 'Ask about the disclosure clock or a checklist…' : 'Ask about this file’s disclosures or the cure…'}
              suggestions={disclosureChips}
            />
          </div>
        </div>

        <ChatDrawer
          isOpen={drawerOpen}
          onClose={() => { setDrawerOpen(false); setInitialQuery(null); }}
          preloadedChips={disclosureChips}
          initialQuery={initialQuery}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 px-6 py-6 pb-24">
          {/* Left Column */}
          <div className="w-1/2 space-y-5">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">{leftColLabel}</h2>
            {isCfo ? (
              <GovernanceSignalsTable />
            ) : isNFCU ? (
              <NFCUQualitySignalsTable />
            ) : (
              <>
                <RiskSignalsTable />
                <AMLClustersCard />
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="w-1/2 space-y-5">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">{rightColLabel}</h2>
            {isCfo ? (
              <GovernanceKpiCards />
            ) : isNFCU ? (
              <>
                <NFCUQualityPostureCard />
                <NFCUComplianceCard />
                <NFCUFCRTrendChart />
              </>
            ) : (
              <>
                <CreditRiskCard />
                <RegulatoryReadinessCard />
                <ComplaintTrajectory />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Persistent Chat Input with pre-loaded chips */}
      <div className="fixed bottom-0 left-[260px] right-0 bg-surface border-t border-border px-6 py-4 z-30">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            {screenChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => openDrawerWithQuery(chip)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-brand/20 text-brand bg-surface hover:bg-brand/5 transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
          <ChatInput
            onSend={(text) => openDrawerWithQuery(text)}
            placeholder={inputPlaceholder}
            suggestions={screenChips}
          />
        </div>
      </div>

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setInitialQuery(null); }}
        preloadedChips={screenChips}
        initialQuery={initialQuery}
      />
    </div>
  );
}
