/**
 * SiteMap — plan view of the complex with people, permits and hazard zones.
 *
 * The picture the GM cannot get today: authorized work and actual work on the
 * same canvas. Zones are tinted by hazard level, each carries its live headcount
 * and permit load, and every job running outside its permit pulses on top.
 *
 * Reads as a site plan rather than a card grid: a fenced perimeter with named
 * gates, blocks laid out on their real relative positions, a north arrow and a
 * scale bar. Built for a projector — large type, high contrast, risk-bucket
 * colour coding.
 *
 * Zone labels come from `labelLines` in the fixture rather than being wrapped at
 * render time. SVG has no text wrapping, so a long name like "Unit 4 — Sulphur
 * Recovery" silently overflows its block; pre-splitting the label in the data
 * keeps every label inside its zone at every width.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, FileText, Flame } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getSiteData } from '../../data/aramco/hse-gm';
import RiskBucketBadge from './RiskBucketBadge';
import IllustrativeDataChip, { ProvenanceLine } from './IllustrativeDataChip';

const HAZARD_STYLE = {
  high: { fill: '#FEF2F2', stroke: '#B91C1C', label: '#991B1B', sub: '#B45C5C', tag: 'High hazard' },
  medium: { fill: '#FFFBEB', stroke: '#B45309', label: '#92400E', sub: '#A9793C', tag: 'Medium hazard' },
  low: { fill: '#F1F5F9', stroke: '#64748B', label: '#334155', sub: '#7A8699', tag: 'Low hazard' },
};

/** Density bar: share of the busiest zone, so relative crowding reads instantly. */
function densityWidth(people, max, zoneWidth) {
  const usable = zoneWidth - 28;
  return Math.max(6, Math.round((people / max) * usable));
}

export default function SiteMap({ getter = getSiteData, onFlaggedJobClick = null }) {
  const site = useAsyncData(getter);
  const [activeZone, setActiveZone] = useState(null);
  const [activeJob, setActiveJob] = useState(null);

  if (!site) return null;

  const { viewBox, zones, flaggedJobs, perimeter, gates = [], scaleBar } = site;
  const selected = zones.find((z) => z.id === activeZone) || null;
  const selectedJob = flaggedJobs.find((j) => j.id === activeJob) || null;
  const maxPeople = Math.max(...zones.map((z) => z.people));
  const flaggedZoneIds = new Set(flaggedJobs.map((j) => j.zoneId));

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text">Site Plan — People, Permits and Hazard Zones</h3>
          <ProvenanceLine
            className="mt-1"
            source="Location and tag data (vendor-agnostic), Permit-to-work system, Gate access-control"
            freshness={site.freshness}
            reconciled
          />
        </div>
        <IllustrativeDataChip />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 text-[10.5px] text-text-muted">
        {Object.entries(HAZARD_STYLE).map(([key, s]) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border" style={{ background: s.fill, borderColor: s.stroke }} />
            {s.tag}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-700 ring-2 ring-rose-200" />
          Job outside permit conditions
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-6 h-1.5 rounded-full bg-slate-400" />
          Relative headcount
        </span>
      </div>

      {/* The map scrolls inside itself — the page body never scrolls sideways. */}
      <div className="overflow-x-auto scrollbar-sleek -mx-1 px-1">
        <svg
          viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
          className="w-full min-w-[640px] h-auto"
          role="img"
          aria-label="Site plan showing zones, headcount, permit load and jobs running outside their permit conditions"
        >
          <defs>
            <pattern id="tl-site-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0 L0 0 0 40" fill="none" stroke="#E9EDF2" strokeWidth="1" />
            </pattern>
          </defs>

          <rect x="0" y="0" width={viewBox.width} height={viewBox.height} fill="#FBFCFD" rx="14" />
          <rect x="0" y="0" width={viewBox.width} height={viewBox.height} fill="url(#tl-site-grid)" rx="14" opacity="0.7" />

          {/* Perimeter fence */}
          {perimeter && (
            <rect
              x={perimeter.x}
              y={perimeter.y}
              width={perimeter.w}
              height={perimeter.h}
              rx="16"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2.5"
              strokeDasharray="10 7"
            />
          )}

          {/* Named gates on the fence line */}
          {gates.map((g) => (
            <g key={g.id}>
              <rect x={g.x - 34} y={g.y - 11} width="68" height="22" rx="11" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
              <text x={g.x} y={g.y + 5} fontSize="12" fontWeight="700" fill="#475569" textAnchor="middle">
                {g.label}
              </text>
            </g>
          ))}

          {/* North arrow */}
          <g transform={`translate(${viewBox.width - 62}, 96)`}>
            <path d="M0 -26 L9 8 L0 1 L-9 8 Z" fill="#64748B" />
            <text x="0" y="26" fontSize="12" fontWeight="700" fill="#64748B" textAnchor="middle">N</text>
          </g>

          {/* Scale bar */}
          {scaleBar && (
            <g>
              <line x1={scaleBar.x} y1={scaleBar.y} x2={scaleBar.x + scaleBar.w} y2={scaleBar.y} stroke="#94A3B8" strokeWidth="2.5" />
              <line x1={scaleBar.x} y1={scaleBar.y - 6} x2={scaleBar.x} y2={scaleBar.y + 6} stroke="#94A3B8" strokeWidth="2.5" />
              <line x1={scaleBar.x + scaleBar.w} y1={scaleBar.y - 6} x2={scaleBar.x + scaleBar.w} y2={scaleBar.y + 6} stroke="#94A3B8" strokeWidth="2.5" />
              <text x={scaleBar.x + scaleBar.w + 10} y={scaleBar.y + 5} fontSize="12.5" fill="#64748B" fontWeight="600">
                {scaleBar.label}
              </text>
            </g>
          )}

          {zones.map((z) => {
            const s = HAZARD_STYLE[z.hazard];
            const isActive = activeZone === z.id;
            const dimmed = (activeZone && !isActive) || (activeJob && !flaggedZoneIds.has(z.id));
            const lines = z.labelLines || [z.name];
            return (
              <g
                key={z.id}
                onMouseEnter={() => setActiveZone(z.id)}
                onMouseLeave={() => setActiveZone(null)}
                style={{ cursor: 'pointer' }}
                opacity={dimmed ? 0.42 : 1}
              >
                <rect
                  x={z.x}
                  y={z.y}
                  width={z.w}
                  height={z.h}
                  rx="10"
                  fill={s.fill}
                  stroke={s.stroke}
                  strokeWidth={isActive ? 3.5 : 1.75}
                />

                {/* Zone name — pre-split in the fixture so it always fits. */}
                {lines.map((line, i) => (
                  <text
                    key={i}
                    x={z.x + 14}
                    y={z.y + 26 + i * 19}
                    fontSize="15.5"
                    fontWeight="700"
                    fill={s.label}
                  >
                    {line}
                  </text>
                ))}

                {/* Headcount */}
                <text x={z.x + 14} y={z.y + 26 + lines.length * 19 + 24} fontSize="26" fontWeight="800" fill="#0F172A">
                  {z.people.toLocaleString()}
                </text>
                <text x={z.x + 14} y={z.y + 26 + lines.length * 19 + 42} fontSize="12" fill={s.sub}>
                  people on site
                </text>

                {/* Relative-density bar */}
                <rect x={z.x + 14} y={z.y + z.h - 38} width={z.w - 28} height="5" rx="2.5" fill="#E2E8F0" />
                <rect
                  x={z.x + 14}
                  y={z.y + z.h - 38}
                  width={densityWidth(z.people, maxPeople, z.w)}
                  height="5"
                  rx="2.5"
                  fill={s.stroke}
                  opacity="0.65"
                />

                <text x={z.x + 14} y={z.y + z.h - 14} fontSize="12" fill={s.sub}>
                  {z.permits} permits
                  {z.highRiskPermits > 0 ? ` · ${z.highRiskPermits} high-risk` : ''}
                </text>
              </g>
            );
          })}

          {/* Flagged jobs on top of everything — these are the point of the view. */}
          {flaggedJobs.map((job) => {
            const isActive = activeJob === job.id;
            return (
              <g
                key={job.id}
                onMouseEnter={() => setActiveJob(job.id)}
                onMouseLeave={() => setActiveJob(null)}
                onClick={() => onFlaggedJobClick?.(job)}
                style={{ cursor: onFlaggedJobClick ? 'pointer' : 'default' }}
              >
                <circle cx={job.x} cy={job.y} r="26" fill="#9F1239" opacity="0.16">
                  <animate attributeName="r" values="20;32;20" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.24;0.04;0.24" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={job.x} cy={job.y} r={isActive ? 17 : 15} fill="#9F1239" stroke="#FFFFFF" strokeWidth="3.5" />
                <text x={job.x} y={job.y + 6} fontSize="15" fontWeight="800" fill="#FFFFFF" textAnchor="middle">
                  {job.rank}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail strip — reflects whatever the pointer is over, else the summary. */}
      <div className="mt-4 rounded-xl border border-border-subtle bg-surface-2 p-3.5 min-h-[76px]">
        {selectedJob ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0" />
              <span className="text-[13px] font-semibold text-text">
                {selectedJob.id} · {selectedJob.permitId} — {selectedJob.title}
              </span>
              <RiskBucketBadge bucket={selectedJob.bucket} size="sm" />
            </div>
            <p className="text-xs text-text-muted leading-relaxed">{selectedJob.reason}</p>
            <p className="text-[11px] text-text-subtle mt-1">
              {selectedJob.zoneName} · {selectedJob.location} · {selectedJob.workersOnSite} workers on location
            </p>
          </motion.div>
        ) : selected ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
            <p className="text-[13px] font-semibold text-text mb-1.5">{selected.name}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> {selected.people.toLocaleString()} people
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> {selected.permits} open permits
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> {selected.highRiskPermits} high-risk
              </span>
              <span>{HAZARD_STYLE[selected.hazard].tag}</span>
            </div>
          </motion.div>
        ) : (
          <p className="text-xs text-text-muted leading-relaxed">
            Hover a zone for its live headcount and permit load, or a numbered marker for the job running outside its
            permit conditions. {flaggedJobs.length} jobs are flagged right now, all inside high-hazard process areas.
          </p>
        )}
      </div>
    </div>
  );
}
