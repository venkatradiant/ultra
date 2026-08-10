import { motion } from 'framer-motion';
import { Database, Brain, Headphones, Cog, Users, Monitor, MessageCircle, Shield, TrendingUp, Cpu, Star, AlertTriangle, Route, FileText, ShieldCheck } from 'lucide-react';
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
import esfcuCeoDataSources from '../data/esfcu/ceo/dataSources.json';
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
  // ESFCU-only CEO persona (gated to clientId === 'esfcu' in PersonaContext).
  // Seven vendor-neutral sources; the Howard University division ledger is the
  // one that is only partially connected, which is the whole point of it.
  esfcu_ceo: esfcuCeoDataSources,
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
  // Additional icons used by the ESFCU CEO data sources.
  route: Route,
  'file-text': FileText,
  'shield-check': ShieldCheck,
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

// ESFCU data posture. The public backdrop is real and sourced; everything
// operational is illustrative. Spec §15 asks for the illustrative-branding note
// to live on this screen specifically.
const ESFCU_REAL_FACTS = [
  ['CEO', 'Girado Smith, CPA — President & CEO since January 2023; 27 years at ESFCU, 18 as EVP & CFO'],
  ['Organization', 'Educational Systems Federal Credit Union, Greenbelt, Maryland — founded 1955'],
  ['Field of membership', 'Maryland\'s education community — teachers, educators, staff and their families'],
  ['Scale (NCUA, Dec 2025)', '≈$1.36B assets · ≈84,000 members · 9.62% net worth ratio · ≈89% loan-to-share · 13 branches'],
  ['Merger', 'Howard University Employees FCU merged effective November 30, 2024; operates as Howard University Federal Credit Union, a division of ESFCU'],
  ['Governance', 'Volunteer Board of Directors, Chair Alonia C. Sharps · federally insured by NCUA'],
  ['Recognition', 'AACUC Hall of Fame (March 2025) · Washington Business Journal 2025 Diversity in Business Award'],
];

const ESFCU_DISCLOSURES = [
  'The public backdrop is real and sourced: the CEO\'s biography, ESFCU\'s assets, membership, net worth ratio, loan-to-share ratio, branch count, founding year, governance and the Howard University merger all come from esfcu.org, NCUA call report data, and public announcements.',
  'Everything operational is illustrative: the priority-signal values, the reconciliation delta and member gap, the trust and pipeline states, the internal policy ceiling and liquidity floor, the deposit and loan composition, the seasonality shape, the owner names, and every figure on the projection.',
  'Platform names are deliberately vendor-neutral. ESFCU\'s actual core banking, lending, data warehouse and BI platforms are not public, so this build names capabilities rather than vendors — confirm them with ESFCU technology leadership before the working session.',
  'The Howard University merger\'s asset and member figures were never publicly disclosed. The $2.7M share delta and 490-member gap that drive the reconciliation centerpiece are illustrative constructions on a real merger.',
  'Brand assets are ESFCU\'s own, used to make the demo recognisable: the mortarboard mark is cropped from the lockup at esfcu.org, the navy (#003768) is sampled from it, and the two photographs in the board briefing are the President/CEO portrait and the member image published on esfcu.org. They are reproduced here for an ESFCU-facing demonstration only. Exact hex values, typography and the approved lockup still need confirming against the ESFCU brand kit.',
];

export default function DataSources() {
  const persona = usePersona();
  const { clientId } = useBranding();
  const sourcesMap = clientId === 'penfed' ? penfedPersonaDataSources : personaDataSources;
  const dataSources = sourcesMap[persona.id] || sourcesMap.ops;
  const isAramco = persona.id?.startsWith('aramco_');
  const isAtt = persona.id?.startsWith('att_');
  const isEsfcu = persona.id?.startsWith('esfcu_');

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

      {/* Spec §2 — the real, public, sourced frame the ESFCU demo sits on. */}
      {isEsfcu && (
        <div className="mb-6 rounded-2xl border border-border-subtle bg-surface p-5">
          <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand">
            <ShieldCheck className="h-3.5 w-3.5" />
            Real public backdrop — verified and safe to show
          </p>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2">
            {ESFCU_REAL_FACTS.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5 border-b border-border-subtle pb-2 last:border-0">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-text-subtle">{label}</dt>
                <dd className="text-[12.5px] leading-relaxed text-text-muted">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] text-text-subtle">
            Sources: esfcu.org · NCUA call report data via public aggregators · CUInsight · MD|DC Credit Union Association · CU Times · AACUC
          </p>
        </div>
      )}

      {isEsfcu && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5" />
            Data posture — read before demoing
          </p>
          <ul className="space-y-2">
            {ESFCU_DISCLOSURES.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-amber-900">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600" />
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
