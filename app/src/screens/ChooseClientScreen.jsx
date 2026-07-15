import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, HeartPulse, Building2, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDomains } from '@core/runtime/registry';

// Per-domain accent + icon for the landing tiles. Falls back gracefully so a
// newly-registered domain shows up without any edit here.
const DOMAIN_META = {
  'financial-services': { icon: Landmark, from: '#3b82f6', to: '#6366f1' },
  healthcare: { icon: HeartPulse, from: '#10b981', to: '#0ea5e9' },
};
const domainMeta = (id) => DOMAIN_META[id] || { icon: Building2, from: '#8b5cf6', to: '#6366f1' };

// Premium product monogram — a gradient badge with a layered "signal" mark.
function UltraMark() {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 rounded-[20px] blur-xl opacity-60"
        style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}
      />
      <div
        className="relative w-[68px] h-[68px] rounded-[20px] flex items-center justify-center shadow-[0_8px_30px_-6px_rgba(59,130,246,0.6)] ring-1 ring-white/20"
        style={{ background: 'linear-gradient(135deg,#60a5fa 0%,#3b82f6 45%,#6366f1 100%)' }}
      >
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <rect x="6" y="18" width="4.5" height="10" rx="2.25" fill="white" fillOpacity="0.55" />
          <rect x="14.75" y="12" width="4.5" height="16" rx="2.25" fill="white" fillOpacity="0.8" />
          <rect x="23.5" y="6" width="4.5" height="22" rx="2.25" fill="white" />
          <path d="M7 16.5 L16 10.5 L25 5.5" stroke="white" strokeOpacity="0.7" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="25" cy="5.5" r="2.4" fill="white" />
        </svg>
      </div>
    </div>
  );
}

export default function ChooseClientScreen() {
  const { adminSelectClient } = useAuth();
  const domains = getDomains();
  const [activeDomainId, setActiveDomainId] = useState(null);
  const activeDomain = domains.find((d) => d.id === activeDomainId) || null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a1633] flex items-center justify-center px-4 py-12">
      {/* Ambient depth */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1e4d] via-[#0a1633] to-[#070f24]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full blur-[120px] opacity-40"
          style={{ background: 'radial-gradient(circle,#2563eb 0%,transparent 62%)' }} />
        <div className="absolute bottom-[-10rem] right-[-6rem] w-[420px] h-[420px] rounded-full blur-[130px] opacity-25"
          style={{ background: 'radial-gradient(circle,#7c3aed 0%,transparent 60%)' }} />
      </div>

      <div className="relative w-full max-w-3xl">
        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-12">
          <UltraMark />
          <h1 className="mt-6 text-5xl sm:text-[3.4rem] font-bold tracking-[-0.03em] leading-none bg-gradient-to-b from-white to-blue-200/70 bg-clip-text text-transparent">
            Ultra App
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/25" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
              {activeDomain ? activeDomain.name : 'Enterprise AI Platform'}
            </p>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/25" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!activeDomain ? (
            /* ─── Level 1: domains ─── */
            <motion.div
              key="domains"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-center text-white/40 text-[13px] mb-6">Choose a domain to get started</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {domains.map((domain) => {
                  const { icon: Icon, from, to } = domainMeta(domain.id);
                  return (
                    <button
                      key={domain.id}
                      onClick={() => setActiveDomainId(domain.id)}
                      className="group relative overflow-hidden rounded-[22px] p-6 text-left border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(37,99,235,0.55)] cursor-pointer"
                    >
                      {/* accent top-edge */}
                      <span className="absolute top-0 left-6 right-6 h-px opacity-70" style={{ background: `linear-gradient(90deg,transparent,${from},transparent)` }} />
                      <div className="flex items-start justify-between">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center ring-1 ring-white/15 shadow-lg transition-transform duration-300 group-hover:scale-105"
                          style={{ background: `linear-gradient(135deg,${from},${to})`, boxShadow: `0 10px 28px -10px ${from}` }}
                        >
                          <Icon className="w-7 h-7 text-white" strokeWidth={1.75} />
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                      </div>
                      <p className="mt-5 text-white font-semibold text-[19px] tracking-tight">{domain.name}</p>
                      <p className="mt-1 text-white/40 text-[13px]">
                        {domain.clients.length} {domain.clients.length === 1 ? 'client' : 'clients'} available
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* ─── Level 2: clients within the domain ─── */
            <motion.div
              key={activeDomain.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => setActiveDomainId(null)}
                className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-white/50 hover:text-white mb-6 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> All domains
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {activeDomain.clients.map(({ id, branding }) => (
                  <button
                    key={id}
                    onClick={() => adminSelectClient(id)}
                    className="group relative rounded-[22px] p-6 flex flex-col items-center gap-4 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-22px_rgba(37,99,235,0.6)] cursor-pointer"
                  >
                    <div className="w-[60px] h-[60px] rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-md ring-1 ring-black/[0.04]">
                      <img src={branding.logo} alt={branding.name} className="w-10 h-10 object-contain" />
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-white font-semibold text-[13.5px] leading-snug">
                        {branding.nameLines.map((line, i) => (
                          <span key={i} className="block">{line}</span>
                        ))}
                      </p>
                      <p className="text-white/35 text-[10px] mt-1.5 uppercase tracking-[0.12em] font-medium">
                        {branding.tagline}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-white/50 group-hover:text-white transition-colors">
                      Launch <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Radiant — monochrome, no chip */}
        <div className="mt-14 flex items-center justify-center gap-2.5">
          <span className="text-[10.5px] uppercase tracking-[0.18em] text-white/30">Powered by</span>
          <img
            src="/radiant-logo.svg"
            alt="Radiant Digital"
            className="h-4 w-auto opacity-70"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
      </div>
    </div>
  );
}
