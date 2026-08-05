import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, HeartPulse, Building2, Globe, Factory, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useClient } from '../context/ClientContext';
import { getMarkets } from '@core/runtime/registry';
import UltraMark from '../components/brand/UltraMark';

// Per-market accent + icon for the landing tiles. Falls back gracefully so a
// newly-registered market shows up without any edit here.
//
// These are wayfinding colours, NOT client brand colours — a market tile has to
// be told apart from its neighbours at a glance, which matters more than
// matching the tenant inside it. Keep every entry in a distinct hue family:
// blue, green, warm, and dark-to-gold are taken.
const MARKET_META = {
  'financial-services': { icon: Landmark, from: '#3b82f6', to: '#6366f1' }, // blue → indigo
  healthcare: { icon: HeartPulse, from: '#10b981', to: '#0ea5e9' }, // emerald → sky
  commercial: { icon: Globe, from: '#F27121', to: '#E94057' }, // orange → red
  // Graphite → amber. Reads industrial, and stays clear of Healthcare's
  // emerald→sky (Aramco's own green→blue was near-identical to it here) and of
  // Commercial's warm orange.
  oil_gas: { icon: Factory, from: '#475569', to: '#F59E0B' },
};
const marketMeta = (id) => MARKET_META[id] || { icon: Building2, from: '#8b5cf6', to: '#6366f1' };

export default function ChooseClientScreen() {
  const { selectClient } = useClient();
  const markets = getMarkets();
  const [activeMarketId, setActiveMarketId] = useState(null);
  const activeMarket = markets.find((d) => d.id === activeMarketId) || null;

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
              {activeMarket ? activeMarket.name : 'Enterprise AI Platform'}
            </p>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/25" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!activeMarket ? (
            /* ─── Level 1: markets ─── */
            <motion.div
              key="markets"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-center text-white/40 text-[13px] mb-6">Choose a market to get started</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {markets.map((market) => {
                  const { icon: Icon, from, to } = marketMeta(market.id);
                  return (
                    <button
                      key={market.id}
                      onClick={() => setActiveMarketId(market.id)}
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
                      <p className="mt-5 text-white font-semibold text-[19px] tracking-tight">{market.name}</p>
                      <p className="mt-1 text-white/40 text-[13px]">
                        {market.clients.length} {market.clients.length === 1 ? 'client' : 'clients'} available
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* ─── Level 2: clients within the market ─── */
            <motion.div
              key={activeMarket.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => setActiveMarketId(null)}
                className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-white/50 hover:text-white mb-6 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> All markets
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {activeMarket.clients.map(({ id, branding }) => (
                  <button
                    key={id}
                    onClick={() => selectClient(id)}
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
