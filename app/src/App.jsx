import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { SessionProvider, useSession } from './context/SessionContext';
import { ClientProvider, useClient } from './context/ClientContext';
import { PersonaProvider } from './context/PersonaContext';
import { BrandingProvider } from './context/BrandingContext';
import { BrandProvider } from './context/BrandContext';
import { ThemeProvider } from '@core/providers/ThemeProvider';
import AppShell from './components/layout/AppShell';
import LoginScreen from './screens/LoginScreen';
import ChooseClientScreen from './screens/ChooseClientScreen';
import AskTheAI from './screens/AskTheAI';
import MemberJourney from './screens/MemberJourney';
import RiskSignals from './screens/RiskSignals';
import DataSources from './screens/DataSources';
import Governance from './screens/Governance';

// Lazy: this route pulls in recharts-heavy observability components for a single
// persona. The main chunk is already oversized (NVL + mermaid land in the eager
// Governance route); a new heavy route shouldn't add to that.
const AgentObservability = lazy(() => import('./screens/AgentObservability'));
const AgentInventory = lazy(() => import('./screens/AgentInventory'));

// Oil & Gas / HSE routes (TrackLynk.AI). Lazy for the same reason: they pull in
// the site-map, permit and muster components that only one market renders.
const LiveSitePicture = lazy(() => import('./screens/LiveSitePicture'));
const PermitJobDetail = lazy(() => import('./screens/PermitJobDetail'));
const MusterStatus = lazy(() => import('./screens/MusterStatus'));

// Telecom / AI Billing Workbench routes. Lazy for the same reason again: the
// Dashboard alone pulls recharts plus the heatmap, explorer and micro-agent
// tables that only this market renders.
const PatternResolution = lazy(() => import('./screens/PatternResolution'));
const BillingDashboard = lazy(() => import('./screens/BillingDashboard'));
const ResolutionHistory = lazy(() => import('./screens/ResolutionHistory'));
const PlatformAdminConsole = lazy(() => import('./screens/PlatformAdminConsole'));

// Expose navigate() for the demo runner
function DemoNavigateBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    window.demoNavigate = navigate;
    return () => { window.demoNavigate = null; };
  }, [navigate]);
  return null;
}

function AppContent() {
  const { isUnlocked } = useSession();
  const { hasClient } = useClient();

  // Default document title is "Ultra App" (the platform identity, used by both
  // pre-app screens). Once a client is selected, BrandingProvider overrides it
  // with that client's name; signing out resets it back.
  useEffect(() => {
    if (!hasClient) document.title = 'Ultra App';
  }, [hasClient]);

  // Two gates, in order. Signing in gets you through the door; choosing a
  // market and client is the separate step after it. `?access=` skips the
  // first gate only — it still lands on the picker.
  if (!isUnlocked) return <LoginScreen />;
  if (!hasClient) return <ChooseClientScreen />;

  return (
    <BrowserRouter>
      <BrandingProvider>
        <ThemeProvider>
          <PersonaProvider>
            <BrandProvider>
            <DemoNavigateBridge />
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/ask" replace />} />
                <Route path="/ask" element={<AskTheAI />} />
                <Route path="/journey" element={<MemberJourney />} />
                <Route path="/risk" element={<RiskSignals />} />
                <Route path="/governance" element={<Governance />} />
                <Route
                  path="/agent-observability"
                  element={(
                    <Suspense fallback={<div className="flex-1 bg-gray-50/50" />}>
                      <AgentObservability />
                    </Suspense>
                  )}
                />
                <Route
                  path="/agent-inventory"
                  element={(
                    <Suspense fallback={<div className="flex-1 bg-gray-50/50" />}>
                      <AgentInventory />
                    </Suspense>
                  )}
                />
                <Route
                  path="/live-site"
                  element={(
                    <Suspense fallback={<div className="flex-1 bg-gray-50/50" />}>
                      <LiveSitePicture />
                    </Suspense>
                  )}
                />
                <Route
                  path="/permits"
                  element={(
                    <Suspense fallback={<div className="flex-1 bg-gray-50/50" />}>
                      <PermitJobDetail />
                    </Suspense>
                  )}
                />
                <Route
                  path="/muster"
                  element={(
                    <Suspense fallback={<div className="flex-1 bg-gray-50/50" />}>
                      <MusterStatus />
                    </Suspense>
                  )}
                />
                <Route
                  path="/patterns"
                  element={(
                    <Suspense fallback={<div className="flex-1 bg-gray-50/50" />}>
                      <PatternResolution />
                    </Suspense>
                  )}
                />
                <Route
                  path="/dashboard"
                  element={(
                    <Suspense fallback={<div className="flex-1 bg-gray-50/50" />}>
                      <BillingDashboard />
                    </Suspense>
                  )}
                />
                <Route
                  path="/history"
                  element={(
                    <Suspense fallback={<div className="flex-1 bg-gray-50/50" />}>
                      <ResolutionHistory />
                    </Suspense>
                  )}
                />
                <Route
                  path="/admin"
                  element={(
                    <Suspense fallback={<div className="flex-1 bg-gray-50/50" />}>
                      <PlatformAdminConsole />
                    </Suspense>
                  )}
                />
                <Route path="/data-sources" element={<DataSources />} />
              </Route>
            </Routes>
            </BrandProvider>
          </PersonaProvider>
        </ThemeProvider>
      </BrandingProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    // SessionProvider sits above ClientProvider on purpose: its initialiser
    // runs first, so an `?access=` unlock can drop the stored client id before
    // ClientProvider reads it — which is what makes the admin key land on the
    // picker rather than resuming whichever client was open last.
    <SessionProvider>
      <ClientProvider>
        <AppContent />
      </ClientProvider>
    </SessionProvider>
  );
}
