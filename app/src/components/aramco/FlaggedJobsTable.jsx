/**
 * FlaggedJobsTable — one row per job running outside its permit conditions.
 *
 * Each row expands to the evidence behind the flag: the permit record, the
 * location trail and the time stamps. That expansion is the whole argument —
 * none of these would surface in the permit system alone, because an expired
 * permit looks like a closed record until live location sits next to it.
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, AlertTriangle, FileText, MapPin, Clock } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getSiteData } from '../../data/aramco/hse-gm';
import RiskBucketBadge from './RiskBucketBadge';
import IllustrativeDataChip, { ProvenanceLine } from './IllustrativeDataChip';

function EvidenceBlock({ evidence }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-3">
      {/* Permit record */}
      <div className="rounded-lg border border-border-subtle bg-surface p-3 min-w-0">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2">
          <FileText className="w-3 h-3" /> Permit record
        </p>
        <dl className="space-y-1">
          {Object.entries(evidence.permitRecord).map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-3 text-[11px]">
              <dt className="text-text-subtle capitalize flex-shrink-0">{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</dt>
              <dd className="text-text font-medium text-right min-w-0">{String(v)}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Location trail */}
      <div className="rounded-lg border border-border-subtle bg-surface p-3 min-w-0">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2">
          <MapPin className="w-3 h-3" /> Location trail
        </p>
        <ol className="space-y-1.5">
          {evidence.locationTrail.map((step, i) => (
            <li key={i} className="flex gap-2 text-[11px] min-w-0">
              <span className="font-mono font-semibold text-text-muted flex-shrink-0">{step.time}</span>
              <span className="text-text-muted min-w-0">{step.event}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Time stamps */}
      <div className="rounded-lg border border-border-subtle bg-surface p-3 min-w-0">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-2">
          <Clock className="w-3 h-3" /> Time stamps
        </p>
        <dl className="space-y-1">
          {Object.entries(evidence.timeStamps).map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-3 text-[11px]">
              <dt className="text-text-subtle flex-shrink-0">{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</dt>
              <dd className="text-text font-semibold text-right">{String(v)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export default function FlaggedJobsTable({ getter = getSiteData }) {
  const site = useAsyncData(getter);
  const [openId, setOpenId] = useState(null);

  if (!site) return null;
  const jobs = site.flaggedJobs;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
            <AlertTriangle className="w-4 h-4 text-rose-700" />
            Jobs in a Hazard Zone Without a Valid Permit
          </h3>
          <ProvenanceLine
            className="mt-1"
            source="Permit-to-work system, Location and tag data (vendor-agnostic)"
            freshness={site.freshness}
            reconciled
            note="Detected by fusing permit validity with live worker position. Neither source produces this on its own."
          />
        </div>
        <IllustrativeDataChip />
      </div>

      <div className="space-y-2">
        {jobs.map((job) => {
          const isOpen = openId === job.id;
          return (
            <div key={job.id} className="rounded-xl border border-rose-200 bg-rose-50/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : job.id)}
                className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-rose-50 transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="w-7 h-7 rounded-lg bg-rose-700 text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                  {job.rank}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-text">{job.title}</span>
                    <RiskBucketBadge bucket={job.bucket} size="sm" />
                  </span>
                  <span className="block text-[11.5px] text-text-muted leading-relaxed">{job.reason}</span>
                  <span className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[10.5px] text-text-subtle">
                    <span>Job {job.id}</span>
                    <span>Permit {job.permitId}</span>
                    <span>{job.zoneName}</span>
                    <span className="hidden sm:inline">{job.location}</span>
                    <span>{job.workersOnSite} workers on location</span>
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-text-subtle flex-shrink-0 mt-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-3.5 pb-3.5 border-t border-rose-200/70">
                      <EvidenceBlock evidence={job.evidence} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
