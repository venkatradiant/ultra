import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { SessionProvider, useSession, readLastClient } from './context/SessionContext';
import { ClientProvider, useClient } from './context/ClientContext';
import { PersonaProvider } from './context/PersonaContext';
import { BrandingProvider } from './context/BrandingContext';
import { BrandProvider } from './context/BrandContext';
import { ThemeProvider } from '@core/providers/ThemeProvider';
import { clientIdForSlug, loginPathForClientId, ULTRA_SLUG } from './config/access';
import { CLIENTS } from './config/clients';
import AppShell from './components/layout/AppShell';
import LoginScreen from './screens/LoginScreen';
import ClientLoginScreen from './screens/ClientLoginScreen';
import AccessDeniedScreen from './screens/AccessDeniedScreen';
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

/**
 * Where an unauthenticated visitor gets sent.
 *
 * The last tenant this browser was in, if there was one; the platform door
 * otherwise. That is what makes a client's bookmark of `/live-site` come back
 * to *their* sign-in page rather than to the Ultra picker, which they should
 * never see — and what makes signing out land on the same page.
 *
 * It reads `ultra_last_client`, not `selected_client`. The latter is cleared by
 * sign-out, which is correct and also exactly the moment we most need to know
 * whose door to show.
 */
function lockedRedirectPath() {
  const last = readLastClient();
  if (last && CLIENTS[last]) return loginPathForClientId(last);
  return `/login/${ULTRA_SLUG}`;
}

/**
 * `/login/ultra` — the platform gate, and the market picker behind it.
 *
 * Three ways this route resolves, and only two of them reach the picker:
 *
 *   `?access=…`        unlocked as platform scope before this even renders
 *                      (SessionContext consumes the token), so → picker.
 *   no session         → the platform sign-in form. Correct credentials unlock
 *                      platform scope and land on the picker.
 *   client scope       → refused. Signed in, but at somebody else's door.
 */
function UltraGateRoute() {
  const { isUnlocked, isPlatformScope, scopedClientId } = useSession();
  const { hasClient } = useClient();

  // A client-scoped session has no business at the platform picker. This used
  // to redirect quietly into their own tenant, which hid the refusal — a user
  // who typed this URL deserves to be told it is not theirs rather than to
  // wonder why the address bar changed.
  if (isUnlocked && !isPlatformScope) {
    return <AccessDeniedScreen clientId={scopedClientId} />;
  }
  if (!isUnlocked) return <LoginScreen />;
  // Picking a market and client is the last thing this route does; once a
  // client is chosen the app takes over. The picker used to be a branch rather
  // than a route, so selecting simply re-rendered — now it has to navigate.
  if (hasClient) return <Navigate to="/ask" replace />;
  return <ChooseClientScreen />;
}

/** `/login/<slug>` — one client's own gate. */
function ClientGateRoute() {
  const { slug } = useParams();
  const { isUnlocked, scope } = useSession();
  const clientId = clientIdForSlug(slug);

  // Unknown slug: no such tenant, so fall back to the platform door rather than
  // rendering a blank branded page for a client that does not exist.
  if (!clientId) return <Navigate to={`/login/${ULTRA_SLUG}`} replace />;
  // Already signed in as this client — nothing to do here.
  if (isUnlocked && scope === clientId) return <Navigate to="/ask" replace />;

  return <ClientLoginScreen clientId={clientId} />;
}

/**
 * Everything behind the gates: the guard and the client-branded provider stack,
 * as a single pathless layout route.
 *
 * A layout route rather than a wrapper around a nested `<Routes>`, because a
 * descendant `<Routes>` resolves its paths relative to the parent and React
 * Router rejects the absolute `/ask`-style paths the app already uses. This
 * keeps every route absolute and declared in one list.
 */
function ProtectedShell() {
  const { isUnlocked } = useSession();
  const { hasClient } = useClient();

  if (!isUnlocked) return <Navigate to={lockedRedirectPath()} replace />;
  // Signed in at the platform door but no client picked yet — the picker is a
  // route now, so this is a redirect rather than a branch.
  if (!hasClient) return <Navigate to={`/login/${ULTRA_SLUG}`} replace />;

  return (
    <BrandingProvider>
      <ThemeProvider>
        <PersonaProvider>
          <BrandProvider>
            <DemoNavigateBridge />
            <Outlet />
          </BrandProvider>
        </PersonaProvider>
      </ThemeProvider>
    </BrandingProvider>
  );
}

function AppRoutes() {
  const { hasClient } = useClient();

  // Default document title is "Ultra App" (the platform identity, used by both
  // pre-app screens). Once a client is selected, BrandingProvider overrides it
  // with that client's name; signing out resets it back.
  useEffect(() => {
    if (!hasClient) document.title = 'Ultra App';
  }, [hasClient]);

  return (
    <Routes>
      {/* The two doors. Both live above BrandingProvider — there is no client
          selected yet, so there are no brand tokens to inherit. */}
      <Route path={`/login/${ULTRA_SLUG}`} element={<UltraGateRoute />} />
      <Route path="/login/:slug" element={<ClientGateRoute />} />
      <Route path="/login" element={<Navigate to={`/login/${ULTRA_SLUG}`} replace />} />

      {/* The signed-in application. Mounts only once a client is resolved. */}
      <Route element={<ProtectedShell />}>
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
          {/* Anything unrecognised inside the app goes to the briefing
              rather than to the gate — you are signed in, you just typed
              a route that does not exist. */}
          <Route path="*" element={<Navigate to="/ask" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    // SessionProvider sits above ClientProvider on purpose: its initialiser
    // runs first, so an `?access=` unlock can drop the stored client id before
    // ClientProvider reads it — which is what makes the admin key land on the
    // picker rather than resuming whichever client was open last.
    //
    // BrowserRouter sits above BOTH. It used to mount inside the app, after the
    // gates had already passed, which meant the sign-in screen and the picker
    // had no URLs at all — they could not, there was no router above them. Per-
    // client sign-in needs `/login/<slug>` to be a real address, so the router
    // moved to the top and the gates became routes.
    <BrowserRouter>
      <SessionProvider>
        <ClientProvider>
          <AppRoutes />
        </ClientProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}
