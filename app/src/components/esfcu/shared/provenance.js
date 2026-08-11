/**
 * How a figure earned the right to be on screen.
 *
 * The CEO build only needed two states, so it used a `real` boolean. The CRO
 * breaks that: her attrition KPI ("members are ~31% more likely to leave after
 * a fraud incident") is a *real published* figure — but it is Abrigo's,
 * industry-wide, and ESFCU has never measured it. A boolean forces that number
 * to claim either more than it can (rendered "Real" beside NCUA call-report
 * figures, it reads as something ESFCU measured) or less (rendered
 * "Illustrative", it throws away a real citation).
 *
 * So there are three states, and the middle one is the whole point:
 *
 *   esfcu        — a real, published figure about ESFCU (NCUA, esfcu.org)
 *   industry     — a real, published figure that is NOT about ESFCU
 *   illustrative — invented for the demo
 *
 * The pill keeps the CEO's "Real" wording for `esfcu` so his tiles are
 * unchanged, and only spends the extra width where the distinction is load-
 * bearing. The long-form citation always rides alongside in `sourceCitation`.
 */
export const PROVENANCE = {
  esfcu: {
    label: 'Real',
    className: 'bg-[#00897B]/10 text-[#00897B]',
    title: 'Real, published ESFCU figure',
  },
  industry: {
    label: 'Real · industry',
    className: 'bg-[#00897B]/10 text-[#00897B]',
    title: 'Real published figure, industry-wide — not an ESFCU measurement',
  },
  illustrative: {
    label: 'Illustrative',
    className: 'bg-surface-2 text-text-subtle',
    title: 'Invented for this demo',
  },
};

/** Falls back to the most cautious state rather than the most flattering one. */
export function provenanceOf(value) {
  return PROVENANCE[value] || PROVENANCE.illustrative;
}
