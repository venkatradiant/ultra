import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PersonaProvider } from './context/PersonaContext';
import { BrandingProvider } from './context/BrandingContext';
import { ThemeProvider } from '@core/providers/ThemeProvider';
import AppShell from './components/layout/AppShell';
import LoginScreen from './screens/LoginScreen';
import ChooseClientScreen from './screens/ChooseClientScreen';
import AskTheAI from './screens/AskTheAI';
import MemberJourney from './screens/MemberJourney';
import RiskSignals from './screens/RiskSignals';
import DataSources from './screens/DataSources';
import Governance from './screens/Governance';
import { ADMIN_ACCESS_KEY } from './config/access';

// Lazy: this route pulls in recharts-heavy observability components for a single
// persona. The main chunk is already oversized (NVL + mermaid land in the eager
// Governance route); a new heavy route shouldn't add to that.
const AgentObservability = lazy(() => import('./screens/AgentObservability'));

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
  const { isAuthenticated } = useAuth();

  // Default document title is "Ultra App" (the home/landing identity). Once a
  // client is selected and the user enters the app, BrandingProvider overrides
  // it with the client's name; on logout this resets it back to "Ultra App".
  useEffect(() => {
    if (!isAuthenticated) document.title = 'Ultra App';
  }, [isAuthenticated]);

  // Admin access is ONLY granted when ?access=rdvr@9705 is present in the URL.
  // It is never stored — navigating without the param always shows Login.
  const [adminAccess] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('access') === ADMIN_ACCESS_KEY) {
      // Clean the token from the URL immediately
      params.delete('access');
      const clean = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (clean ? `?${clean}` : ''));
      return true;
    }
    return false;
  });

  // Not yet authenticated → show the right entry screen
  if (!isAuthenticated) {
    return adminAccess ? <ChooseClientScreen /> : <LoginScreen />;
  }

  // Authenticated → full app
  return (
    <BrowserRouter>
      <BrandingProvider>
        <ThemeProvider>
          <PersonaProvider>
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
                <Route path="/data-sources" element={<DataSources />} />
              </Route>
            </Routes>
          </PersonaProvider>
        </ThemeProvider>
      </BrandingProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
