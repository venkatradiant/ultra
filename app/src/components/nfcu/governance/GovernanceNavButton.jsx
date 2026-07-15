import { Gauge, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GovernanceNavButton({
  label = 'Open Model Governance',
  description = 'View the audit trail and model performance live.',
  to = '/governance',
}) {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.demoNavigate) {
      window.demoNavigate(to);
    } else if (typeof window !== 'undefined') {
      window.location.href = to;
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      className="w-full text-left rounded-xl border border-brand/15 bg-gradient-to-r from-brand/[0.05] to-white p-3.5 hover:border-brand/30 hover:from-brand/[0.08] transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
          <Gauge className="w-4 h-4 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-brand">{label}</p>
          <p className="text-[11px] text-text-muted leading-snug mt-0.5">{description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-brand/50 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </motion.button>
  );
}
