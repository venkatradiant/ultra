import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import DoitCard from '../shared/DoitCard';
import { StatusBadge } from '../shared/TrustBits';
import { useAuthorState } from '../shared/authorState';
import { DISTRIBUTION_LISTS, SURVEY_2 } from '../../../data/doit/_shared/constants';

/**
 * Live status for the just-published survey.
 *
 * The ring is a real radial chart rather than a rotated border: the prototype's
 * "progress ring" was a static div whose borderTopColor was rotated by an
 * arithmetic that broke on non-integer steps, and it never actually indicated
 * progress.
 */
const DELIVERED_PCT = 34;

export default function SurveyStatusCard() {
  const { distributionList } = useAuthorState();
  const list = DISTRIBUTION_LISTS.find((l) => l.name === distributionList) || DISTRIBUTION_LISTS[0];
  const delivered = Math.round((list.contacts * DELIVERED_PCT) / 100);

  return (
    <DoitCard eyebrow="Survey status" title={SURVEY_2.name}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative h-[104px] w-[104px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="72%"
              outerRadius="100%"
              data={[{ name: 'delivered', value: DELIVERED_PCT, fill: 'var(--color-chart-1)' }]}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background={{ fill: 'var(--color-surface-2)' }} dataKey="value" cornerRadius={8} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[19px] font-bold leading-none text-text">{DELIVERED_PCT}%</span>
            <span className="text-[9.5px] uppercase tracking-[0.06em] text-text-muted">delivered</span>
          </div>
        </div>

        <dl className="min-w-0 flex-1 space-y-1.5">
          <Row label="Status" value={<StatusBadge label="Live" variant="live" />} />
          <Row label="Distribution list" value={list.name} />
          <Row label="Invitations sent" value={`${delivered.toLocaleString()} of ${list.contacts.toLocaleString()}`} />
          <Row label="Responses so far" value="0 — too early for patterns" />
        </dl>
      </div>
    </DoitCard>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-[11.5px] text-text-muted">{label}</dt>
      <dd className="text-[12px] font-medium text-text">{value}</dd>
    </div>
  );
}
