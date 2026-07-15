import { useEffect } from 'react';
import { usePersona } from '../context/PersonaContext';
import { useIntraday } from '../context/IntradayContext';
import nfcuSupIntradayBaseline from '../data/nfcu/supervisor/intraday.json';
import nfcuDirIntradayBaseline from '../data/nfcu/director/intraday.json';

// Per-persona intraday baseline data. Keys map to personaId.
const intradayBaselineByPersona = {
  nfcu_supervisor: nfcuSupIntradayBaseline,
  nfcu_director: nfcuDirIntradayBaseline,
};

// Mounted at AppShell scope so the Sticky Intelligence Widget can render the
// briefing data on every route — not just on /ask. Watches the active persona
// and pushes the matching baseline into IntradayContext; clears for personas
// that don't have an intraday dataset so the widget unmounts cleanly.
export default function useNfcuBaselineLoader() {
  const persona = usePersona();
  const { setBaseline, resetSnapshot } = useIntraday();

  useEffect(() => {
    const baseline = intradayBaselineByPersona[persona?.id] || null;
    setBaseline(baseline);
    resetSnapshot();
  }, [persona?.id, setBaseline, resetSnapshot]);
}
