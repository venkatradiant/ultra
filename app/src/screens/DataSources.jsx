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

export default function DataSources() {
  const persona = usePersona();
  const { clientId } = useBranding();
  const sourcesMap = clientId === 'penfed' ? penfedPersonaDataSources : personaDataSources;
  const dataSources = sourcesMap[persona.id] || sourcesMap.ops;

  return (
    <div className="flex-1 py-8 px-8 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text mb-1">Connected Data Sources</h2>
        <p className="text-sm text-text-subtle">{dataSources.length} integrations powering the AI intelligence layer</p>
      </div>

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
              <p className="text-xs text-text-muted leading-relaxed mb-4">{ds.description}</p>

              {/* Metrics */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="text-[10px] text-text-subtle">
                  <span className="font-medium text-text-muted">{formatRecordCount(ds.recordCount)}</span> records
                </div>
                <div className="text-[10px] text-text-subtle">
                  Last sync: <span className="font-medium text-text-muted">{formatSyncTime(ds.lastSync)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
