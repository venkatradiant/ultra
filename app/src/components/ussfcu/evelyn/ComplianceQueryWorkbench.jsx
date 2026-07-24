import { motion } from 'framer-motion';
import { Search, MapPin, Users, CalendarClock, MessageSquare, Sparkles } from 'lucide-react';
import ComplianceDeepQueryResult from './ComplianceDeepQueryResult';
import RegulatoryTestPanel from '../compliance/RegulatoryTestPanel';
import regulatoryTests from '../../../data/ussfcu/evelyn/regulatoryTests.json';

// Compliance Query nav page (population altitude): build a question by
// characteristic, see the counts, and the regulatory tests applied per result.
const characteristics = [
  { id: 'product', icon: Search, label: 'Product', value: 'Mortgage', tests: 'Product-level risk & resource application' },
  { id: 'location', icon: MapPin, label: 'Location', value: 'Colorado', tests: 'State privacy & lending requirements' },
  { id: 'age', icon: Users, label: 'Age', value: 'Under 30', tests: 'Fair lending · ECOA & Reg B (protected basis)' },
  { id: 'origination', icon: Sparkles, label: 'Origination', value: 'Chose to originate', tests: 'Member attrition — did we lose them' },
  { id: 'channel', icon: MessageSquare, label: 'Channel', value: 'Majority electronic', tests: 'ESIGN consent for electronic delivery' },
  { id: 'window', icon: CalendarClock, label: 'Days & interactions', value: 'App → closing', tests: 'Lender efficiency; stepping outside procedure' },
];

export default function ComplianceQueryWorkbench() {
  return (
    <div className="max-w-4xl">
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Compliance Deep Query</h2>
      <p className="text-[12px] text-text-muted mb-4 max-w-2xl">
        Build a question by characteristic across the core, origination, and the contact center. The layer returns one
        reconciled count with breakdowns, then applies the regulatory test each characteristic triggers — the question that
        used to take days of manual pulls across systems that do not talk.
      </p>

      {/* Query builder */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-surface-2 rounded-xl p-4 border border-border-subtle mb-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-brand" />
          <p className="text-xs font-semibold text-text-muted">Query characteristics</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {characteristics.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.id} className="bg-surface rounded-lg border border-border-subtle px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-brand" />
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-text-subtle">{c.label}</span>
                </div>
                <p className="text-[12px] font-semibold text-text leading-tight">{c.value}</p>
                <p className="text-[9.5px] text-text-subtle leading-snug mt-1">{c.tests}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Result + tests */}
      <div className="space-y-4">
        <ComplianceDeepQueryResult />
        <RegulatoryTestPanel data={regulatoryTests} />
      </div>
    </div>
  );
}
