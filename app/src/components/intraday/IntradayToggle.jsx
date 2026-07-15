import { Activity } from 'lucide-react';
import { useIntraday } from '../../context/IntradayContext';

export default function IntradayToggle() {
  const { intradayMode, setIntradayMode, baseline } = useIntraday();

  // Self-hide when the current persona has no intraday support — keeps this
  // safe to render anywhere in the chrome (TopHeader, chat strip, etc.).
  if (!baseline) return null;

  return (
    <button
      type="button"
      onClick={() => setIntradayMode((v) => !v)}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
        intradayMode
          ? 'bg-brand text-white border-brand hover:bg-brand/90'
          : 'border-brand/25 text-brand hover:bg-brand/[0.04] hover:border-brand/40'
      }`}
      title={intradayMode ? 'Hide intraday dashboard' : 'Show intraday dashboard'}
    >
      <Activity className="w-3.5 h-3.5" />
      Intraday Dashboard
    </button>
  );
}
