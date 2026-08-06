import { motion } from 'framer-motion';
import { Database, Brain, Headphones, Cog, Users, Monitor, MessageCircle, Shield, TrendingUp, Cpu, Star, AlertTriangle } from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import opsDataSources from '../data/dataSources.json';
import cxDataSources from '../data/cx/dataSources.json';
import retDataSources from '../data/retention/dataSources.json';
import riskDataSources from '../data/risk/dataSources.json';
import nfcuSupDataSources from '../data/nfcu/supervisor/dataSources.json';
import nfcuAnaDataSources from '../data/nfcu/analyst/dataSources.json';
import nfcuWfDataSources from '../data/nfcu/workforce/dataSources.json';
import nfcuDirDataSources from '../data/nfcu/director/dataSources.json';
import nfcuMemberDataSources from '../data/nfcu/member/dataSources.json';
import nfcuAgentDataSources from '../data/nfcu/agent/dataSources.json';
import nfcuPaDataSources from '../data/nfcu/platform-admin/dataSources.json';
import penfedOpsDataSources from '../data/penfed/dataSources.json';
import penfedRetDataSources from '../data/penfed/retention/dataSources.json';
import penfedCapmDataSources from '../data/penfed/capmarkets/dataSources.json';
import ussfcuCfoDataSources from '../data/ussfcu/cfo/dataSources.json';
import ussfcuCeoDataSources from '../data/ussfcu/ceo/dataSources.json';
import ussfcuEvelynDataSources from '../data/ussfcu/evelyn/dataSources.json';
import ussfcuNadiaDataSources from '../data/ussfcu/nadia/dataSources.json';
import newfoldDataSources from '../data/newfold-digital/_shared/dataSources.json';
import aramcoDataSources from '../data/aramco/_shared/dataSources.json';
import attDataSources from '../data/att/_shared/dataSources.json';
import AramcoBackdropPanel from '../components/aramco/AramcoBackdropPanel';
import { useBranding } from '../context/BrandingContext';

const personaDataSources = {
  ops: opsDataSources,
  cx: cxDataSources,
  retention: retDataSources,
  risk: riskDataSources,
  nfcu_supervisor: nfcuSupDataSources,
  nfcu_analyst: nfcuAnaDataSources,
  nfcu_workforce: nfcuWfDataSources,
  nfcu_director: nfcuDirDataSources,
  nfcu_member: nfcuMemberDataSources,
  nfcu_agent: nfcuAgentDataSources,
  nfcu_platform_admin: nfcuPaDataSources,
  // USSFCU-only CFO persona (gated to clientId === 'ussfcu' in PersonaContext).
  ussfcu_cfo: ussfcuCfoDataSources,
  // USSFCU-only CEO persona (gated to clientId === 'ussfcu' in PersonaContext).
  ussfcu_ceo: ussfcuCeoDataSources,
  // USSFCU-only Risk & Compliance personas (gated to clientId === 'ussfcu').
  ussfcu_evelyn: ussfcuEvelynDataSources,
  ussfcu_nadia: ussfcuNadiaDataSources,
  // Commercial market — Newfold Digital. Both personas share the same eight
  // connected sources (Genesys Cloud primary + Billing, Domains, Hosting, CRM,
  // Marketing, IT, Snowflake).
  newfold_director: newfoldDataSources,
  newfold_ops: newfoldDataSources,
  // Oil & Gas market — Aramco (TrackLynk.AI). Eight sources; location and
  // presence telemetry is deliberately vendor-agnostic.
  aramco_hse_gm: aramcoDataSources,
  aramco_complex_manager: aramcoDataSources,
  aramco_shift_supervisor: aramcoDataSources,
  aramco_permit_issuer: aramcoDataSources,
  // Telecom — AT&T (AI Billing Workbench). Both personas read the same ten
  // systems; the operator acts on them and the admin tunes the agents over them.
  att_billing_operator: attDataSources,
  att_platform_admin: attDataSources,
};

const penfedPersonaDataSources = {
  ...personaDataSources,
  ops: penfedOpsDataSources,
  retention: penfedRetDataSources,
  // PenFed-only: capmarkets persona's seven capital-markets sources
  // (Bloomberg, Snowflake, Salesforce Data Cloud, Internal Risk Models,
  // NCUA Reporting, S&P/Fitch Portals, Credit Monitoring Feed).
  capmarkets: penfedCapmDataSources,
};

const iconMap = {
  database: Database,
  brain: Brain,
  headphones: Headphones,
  cog: Cog,
  users: Users,
  monitor: Monitor,
  'message-circle': MessageCircle,
  shield: Shield,
  // Additional icons used by the PenFed capmarkets data sources.
  'trending-up': TrendingUp,
  cpu: Cpu,
  star: Star,
  'alert-triangle': AlertTriangle,
};

function formatSyncTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  return `${diffHours}h ago`;
}

function formatRecordCount(count) {
  if (count == null) return '—';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
}

// Oil & Gas / TrackLynk.AI data posture. Aramco is an archetypal target, not a
// customer, and the demo must say so on the screen that lists its "sources".
const ARAMCO_DISCLOSURES = [
  'Aramco is used here as an illustrative target example — an archetypal downstream refining and petrochemical operator. It is not a current customer.',
  'This prototype does not use confidential Aramco data. No proprietary, internal, or restricted information is present in any view.',
  'All operational figures — permit counts, headcounts, near-misses, muster times — are mock and illustrative. Company-level facts shown elsewhere are public and sourced to the Aramco FY2025 Annual Report.',
  'Tracking and telemetry integrations are vendor-agnostic. TrackLynk reads whatever tags, beacons, readers and cameras a site already runs; no specific tracking vendor is named or required.',
];

// Telecom / AI Billing Workbench data posture. The chrome is AT&T-branded but
// the data is not AT&T's, and that gap is exactly what this panel exists to
// close — spec §2 states the demo models a representative consumer telecom.
// This is the one screen a presenter must read before demoing.
const ATT_DISCLOSURES = [
  'The interface is AT&T-branded; the data is not AT&T data. This demo models a representative consumer telecom billing operation, and no figure on any screen describes AT&T\'s actual billing, systems, or error rates.',
  'Every value is illustrative: account numbers, customer names, dollar amounts, confidence scores, agent metrics and KPIs are representative and were authored for this prototype.',
  'The subject matter is billing errors. Say the previous two points out loud when presenting — an AT&T-branded screen showing 207 anomalies and $4,850 at risk will otherwise be read as a claim about AT&T rather than a demonstration of the workbench.',
  'Source-system naming is vendor-agnostic. The workbench reads whatever billing, rate-card, tax and rebilling systems an operation already runs; no specific vendor is named or required.',
];

export default function DataSources() {
  const persona = usePersona();
  const { clientId } = useBranding();
  const sourcesMap = clientId === 'penfed' ? penfedPersonaDataSources : personaDataSources;
  const dataSources = sourcesMap[persona.id] || sourcesMap.ops;
  const isAramco = persona.id?.startsWith('aramco_');
  const isAtt = persona.id?.startsWith('att_');

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto scrollbar-sleek">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text mb-1">Connected Data Sources</h2>
        <p className="text-sm text-text-subtle">{dataSources.length} integrations powering the AI intelligence layer</p>
      </div>

      {/* Spec §2 — the real, public, sourced frame the whole demo sits on. */}
      {isAramco && <AramcoBackdropPanel />}

      {isAramco && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-800 mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            Data posture — read before demoing
          </p>
          <ul className="space-y-2">
            {ARAMCO_DISCLOSURES.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] text-amber-900 leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isAtt && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-800 mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            Data posture — read before demoing
          </p>
          <ul className="space-y-2">
            {ATT_DISCLOSURES.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] text-amber-900 leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {dataSources.map((ds, idx) => {
          const Icon = iconMap[ds.icon] || Database;
          return (
            <motion.div
              key={ds.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              className="bg-surface rounded-xl border border-border-subtle p-5 hover:shadow-md hover:border-border transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand/5 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <span className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                  ds.status === 'connected' ? 'text-[#00897B]' : 'text-[#F59E0B]'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    ds.status === 'connected' ? 'bg-[#00897B]' : 'bg-[#F59E0B]'
                  }`} />
                  {ds.status === 'connected' ? 'Connected' : 'Partial'}
                </span>
              </div>

              {/* Name + Description */}
              <h3 className="text-sm font-semibold text-text mb-1.5 leading-tight">{ds.name}</h3>
              {ds.vendorAgnostic && (
                <span className="inline-block mb-1.5 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-text-muted">
                  Vendor-agnostic
                </span>
              )}
              <p className="text-xs text-text-muted leading-relaxed mb-4">{ds.description}</p>

              {/* Metrics */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="text-[10px] text-text-subtle">
                  <span className="font-medium text-text-muted">{formatRecordCount(ds.recordCount)}</span> records
                </div>
                <div className="text-[10px] text-text-subtle">
                  {/* Prefer an authored freshness string when the fixture supplies
                      one — a scripted demo shouldn't drift as the wall clock moves. */}
                  Last sync: <span className="font-medium text-text-muted">{ds.freshness || formatSyncTime(ds.lastSync)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
