import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Play, ChevronDown, LogOut, Menu } from 'lucide-react';
import { RUN_GUIDED_DEMO } from '../../demo.config';
import DemoRunner from '../../demo/DemoRunner';
import DemoOverlay from '../../demo/DemoOverlay';
import { usePersona, usePersonaList } from '../../context/PersonaContext';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';

export default function TopHeader({ onMenuClick }) {
  const persona = usePersona();
  const personaList = usePersonaList();
  const { logout } = useAuth();
  const { client } = useBranding();
  const location = useLocation();
  const navigate = useNavigate();
  // Persona-specific nav relabels (USSFCU CFO reframes journey/risk as the
  // data-governance story); generic personas keep the client defaults.
  const personaNavLabels = {
    ussfcu_cfo: { journey: 'Data Flow & Lineage', risk: 'Governance Signals' },
    // USSFCU CEO — pure executive altitude. Business Performance is the roll-up
    // view; Priority Signals is the state-of-the-business signal set.
    ussfcu_ceo: { journey: 'Business Performance', risk: 'Priority Signals' },
    // NFCU Platform Admin — governance persona. Observability is its own page
    // now, so Governance no longer claims it. Keep in sync with the persona
    // manifest's navLabels; this map duplicates them.
    nfcu_platform_admin: { governance: 'Governance', agentObservability: 'Agent Observability' },
  };
  const labels = personaNavLabels[persona?.id] ?? client?.navLabels ?? { journey: 'Member Journey', risk: 'Risk Signals' };
  const pageTitles = {
    '/': 'Ask the AI',
    '/ask': 'Ask the AI',
    '/journey': labels.journey,
    '/risk': labels.risk,
    '/governance': labels.governance || client?.navLabels?.governance || 'Model Governance',
    '/agent-observability': labels.agentObservability || 'Agent Observability',
    '/data-sources': 'Data Sources',
  };
  const title = pageTitles[location.pathname] || 'Ask the AI';
  const [demoRunning, setDemoRunning] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handlePersonaSwitch = (personaId) => {
    setDropdownOpen(false);
    const params = new URLSearchParams(location.search);
    params.set('persona', personaId);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleStartDemo = useCallback(() => {
    setDemoRunning(true);
    DemoRunner.start();
  }, []);

  const handleStopDemo = useCallback(() => {
    setDemoRunning(false);
    DemoRunner.stop();
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <>
      <header className="h-16 bg-surface border-b border-border-subtle flex items-center justify-between px-4 sm:px-6 lg:px-8 relative z-50 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-xl text-text-muted hover:bg-surface-2 transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-text tracking-tight truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Run Guided Demo button — hidden via flag; functionality preserved for later re-enable */}
          {RUN_GUIDED_DEMO === 'yes' && !demoRunning && (
            <button
              onClick={handleStartDemo}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-brand/25 text-brand text-xs font-semibold hover:bg-brand/[0.04] hover:border-brand/40 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              Run Guided Demo
            </button>
          )}

          {/* Notification Bell */}
          <button className="relative p-2 rounded-xl hover:bg-surface-2 transition-colors">
            <Bell className="w-5 h-5 text-text-subtle" />
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full min-w-[18px] min-h-[18px]">
              3
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-surface-2" />

          {/* User / Persona Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-3 px-2 py-1.5 -mx-2 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                {persona.initials}
              </div>
              <div className="text-right hidden sm:block max-w-[160px]">
                <p className="text-sm font-semibold text-text leading-tight truncate">{persona.name}</p>
                <p className="text-[10px] text-text-subtle leading-tight font-medium truncate">{persona.role}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-text-subtle transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-surface rounded-xl border border-border shadow-xl z-[60] overflow-hidden">
                <div className="px-3 py-2 border-b border-border-subtle">
                  <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider">Switch Persona</p>
                </div>
                <div className="py-1">
                  {personaList.map((p) => {
                    const isActive = p.id === persona.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => !isActive && handlePersonaSwitch(p.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          isActive
                            ? 'bg-brand/[0.06] cursor-default'
                            : 'hover:bg-surface-2 cursor-pointer'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                          isActive
                            ? 'bg-brand text-white'
                            : 'bg-surface-2 text-text-muted'
                        }`}>
                          {p.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-brand' : 'text-text'}`}>
                            {p.name}
                          </p>
                          <p className="text-[10px] text-text-subtle leading-tight">{p.role}</p>
                        </div>
                        {isActive && (
                          <span className="text-[9px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded">ACTIVE</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sign Out */}
                <div className="border-t border-border-subtle p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-red-50 transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface-2 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors">
                      <LogOut className="w-3.5 h-3.5 text-text-muted group-hover:text-red-500 transition-colors" />
                    </div>
                    <span className="text-xs font-semibold text-text-muted group-hover:text-red-600 transition-colors">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <DemoOverlay
        isRunning={demoRunning}
        onStart={handleStartDemo}
        onStop={handleStopDemo}
      />
    </>
  );
}
