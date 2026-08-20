import { motion } from 'framer-motion';
import { usePersona } from '../context/PersonaContext';
import SavedReportsPanel from '../components/doit/shared/SavedReportsPanel';

/**
 * My Reports — where a saved report actually goes.
 *
 * Both DoIT personas were offered a "save to my reports" chip whose only effect
 * was a sentence saying it had happened. There was no reports surface anywhere
 * in the app, so the chip was a claim about a feature that did not exist. This
 * screen is the destination.
 *
 * Structured like the other generic screens: the route is global, but only
 * personas that list `myReports` in `features.navSlots` can reach it from the
 * sidebar, and only DoIT does. A persona with nothing to show gets an explicit
 * empty state rather than a blank page.
 */
const PANELS = {
  doit_author: {
    title: 'My Reports',
    subtitle: 'Findings reports you have saved, ready to edit or send to your manager.',
    emptyHint:
      'Draft a findings report from your survey results and choose “Save to my reports”. It will wait here until you send it.',
  },
  amisa_director: {
    title: 'My Reports',
    subtitle: 'Association summaries you have saved, ready to edit or publish to participating schools.',
    emptyHint:
      'Draft the association summary from a benchmark answer and choose "Save to my reports". It will wait here until you publish it.',
  },
  doit_admin: {
    title: 'My Reports',
    subtitle: 'Leadership briefs you have saved, ready to edit or send.',
    emptyHint:
      'Draft a brief for leadership from a cross-survey question and choose “Save to reports”. It will wait here until you send it.',
  },
};

export default function MyReports() {
  const persona = usePersona();
  const config = PANELS[persona?.id];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-sleek px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="mb-1 text-lg font-semibold text-text">{config?.title ?? 'My Reports'}</h2>
        <p className="text-sm text-text-subtle">
          {config?.subtitle ?? 'Reports you have saved.'}
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {config ? (
          <SavedReportsPanel personaId={persona.id} emptyHint={config.emptyHint} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <p className="text-[13.5px] font-semibold text-text">Nothing saved here</p>
            <p className="mt-1 text-[12.5px] text-text-muted">
              This persona does not save reports.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
