import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { IntradayProvider, useIntraday } from '../../context/IntradayContext';
import { usePersona } from '../../context/PersonaContext';
import useNfcuBaselineLoader from '../../hooks/useNfcuBaselineLoader';
import StickyIntelligenceWidget from '../intelligence/StickyIntelligenceWidget';

// Personas that own the Sticky Intelligence Widget. Kept in sync with the
// matching set inside StickyIntelligenceWidget.jsx so we reserve layout
// space only when the widget is actually rendered.
const PERSONAS_WITH_BRIEFING_PANEL = new Set(['nfcu_supervisor', 'nfcu_director']);

// Inner shell — runs *inside* IntradayProvider so it can mount hooks/components
// that consume the intraday context (baseline loader, sticky widget).
function ShellInner() {
  const location = useLocation();
  const persona = usePersona();
  const { baseline, widgetExpanded, briefingActive } = useIntraday();
  useNfcuBaselineLoader();

  // Mobile off-canvas sidebar. Closes automatically on route change.
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  // Mirror StickyIntelligenceWidget's gating so <main> reserves space for the
  // exact widget state on screen. The widget itself is desktop-only (lg+), so
  // the reserved margin is `lg:` — on mobile the main column is full-width.
  const personaAllowed = persona?.id && PERSONAS_WITH_BRIEFING_PANEL.has(persona.id);
  const widgetVisible = personaAllowed && !!baseline;
  const widgetIsRail = widgetVisible && (!widgetExpanded || briefingActive);
  const widgetIsExpanded = widgetVisible && !widgetIsRail;
  const mainMargin = widgetIsExpanded
    ? 'lg:mr-[360px]'
    : widgetIsRail
    ? 'lg:mr-11'
    : '';

  return (
    <div className="h-[100dvh] bg-bg flex overflow-hidden">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopHeader onMenuClick={() => setNavOpen(true)} />
        <main
          className={`flex-1 overflow-y-auto transition-[margin] duration-200 ease-out ${mainMargin}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <StickyIntelligenceWidget />
      </div>
    </div>
  );
}

export default function AppShell() {
  return (
    <IntradayProvider>
      <ShellInner />
    </IntradayProvider>
  );
}
