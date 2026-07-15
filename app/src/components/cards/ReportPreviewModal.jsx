import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, TrendingDown, Users, Download, Send, Share2 } from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';

const sectionIcons = {
  'alert-triangle': AlertTriangle,
  'trending-down': TrendingDown,
  'users': Users,
};

const severityColors = {
  critical: 'border-l-red-500 bg-red-50/50',
  warning: 'border-l-amber-500 bg-amber-50/50',
};

const reportData = {
  title: 'Member Friction Intelligence Brief',
  sections: [
    {
      icon: 'alert-triangle',
      heading: 'Mortgage Application Drop-Off',
      body: '41% drop at Step 4 (income verification). Root cause: UiPath document upload exception. 847 members affected. JIRA ticket PF-2847 created.',
      severity: 'critical',
    },
    {
      icon: 'trending-down',
      heading: 'Auto Loan Abandonment Trend',
      body: '3x increase over 4 weeks. Primary driver: rate perception. 68% of related calls mention competitive rates.',
      severity: 'warning',
    },
    {
      icon: 'users',
      heading: 'CD Complaint Cluster',
      body: '214 interactions in 5 days from military retirees. NPS declined 13 points. Highest-tenure, highest-value segment at risk.',
      severity: 'critical',
    },
  ],
  recommended_actions: [
    'Resolve UiPath document upload exception (JIRA PF-2847)',
    'Conduct auto loan rate competitiveness review',
    'Launch targeted outreach to military retiree CD holders',
  ],
  footer: 'Prepared by Radiant AI Intelligence Layer | Powered by Radiant Digital',
};

export default function ReportPreviewModal({ isOpen, onClose }) {
  const { client } = useBranding();
  const subtitle = `${client?.name || 'United States Senate Federal Credit Union'} — March 27, 2026`;
  const logo = client?.logo || '/ussfcu-seal.png';
  const alt = client?.shortName || 'Client';
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-surface rounded-2xl w-[860px] max-w-[92vw] relative"
            style={{ boxShadow: '0px 24px 48px rgba(0,0,0,0.20)' }}
          >
            {/* Header bar */}
            <div className="bg-brand px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <img src={logo} alt={alt} className="w-6 h-6" />
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-brand mb-1">{reportData.title}</h2>
              <p className="text-xs text-text-subtle mb-6">{subtitle}</p>

              {/* Sections */}
              <div className="space-y-4 mb-6">
                {reportData.sections.map((section, idx) => {
                  const Icon = sectionIcons[section.icon] || AlertTriangle;
                  return (
                    <div
                      key={idx}
                      className={`border-l-4 rounded-r-lg px-4 py-3 ${severityColors[section.severity]}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          section.severity === 'critical' ? 'text-red-500' : 'text-amber-500'
                        }`} />
                        <div>
                          <h4 className="text-sm font-semibold text-text mb-1">{section.heading}</h4>
                          <p className="text-xs text-text-muted leading-relaxed">{section.body}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommended Actions */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Recommended Actions</h4>
                <ul className="space-y-2">
                  {reportData.recommended_actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-text-muted">
                      <span className="w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <p className="text-[10px] text-text-subtle mb-5 pt-3 border-t border-border-subtle">{reportData.footer}</p>

              {/* CTA Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-brand/90 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-text-muted bg-surface-2 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Send to team
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-text-muted bg-surface-2 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Share via Slack
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
