import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
