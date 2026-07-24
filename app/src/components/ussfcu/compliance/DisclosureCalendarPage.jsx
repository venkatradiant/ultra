import DisclosureChecklist from './DisclosureChecklist';
import DisclosureCalendar from './DisclosureCalendar';

// Disclosure Calendar nav page: the member-specific checklist (what is required)
// beside the calendar (when it is due, and what is at risk). Prop-driven so
// Evelyn (portfolio / representative file) and Nadia (single file) both reuse it.
export default function DisclosureCalendarPage({ heading, description, checklist, calendar }) {
  return (
    <div className="max-w-4xl">
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">{heading}</h2>
      {description && <p className="text-[12px] text-text-muted mb-4 max-w-2xl">{description}</p>}
      <div className="grid md:grid-cols-2 gap-4 items-start">
        {checklist && <DisclosureChecklist data={checklist} />}
        {calendar && <DisclosureCalendar data={calendar} />}
      </div>
    </div>
  );
}
