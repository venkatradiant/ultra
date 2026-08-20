/**
 * The survey a member school asks to send to the membership.
 *
 * Shared by both personas deliberately. Ana Lucía builds and submits this
 * request; Dr. Rhoads approves it. If each held its own copy, the two halves of
 * the demo could describe the same four questions differently — and the whole
 * beat depends on the committee recognising, on the association's screen, the
 * request they watched a school create ninety seconds earlier.
 *
 * The two questions Dr. Rhoads gave as his own listserv examples on the
 * August 6 call are the first two, verbatim in substance: the kindergarten wait
 * list and the planned tuition increase.
 */

export interface RequestedQuestion {
  id: string;
  text: string;
  type: string;
}

export const REQUESTED_SURVEY = {
  name: 'Kindergarten Demand and Tuition Planning',
  requestedBy: 'Ana Lucía Restrepo',
  requestedByRole: 'Human Resources Director',
  audience: 'All participating schools (31)',
  requestedWindow: 'Opens Monday · 3 weeks',
  scheduledWindow: 'Opens Monday · closes in 3 weeks',
  reminders: 'Day 7 and day 14',
  questions: [
    { id: 'rq1', text: 'How many students are currently on your kindergarten wait list?', type: 'Number' },
    { id: 'rq2', text: 'What tuition increase are you planning for next year?', type: 'Percentage' },
    { id: 'rq3', text: 'Has your kindergarten wait list grown or shrunk since last year?', type: 'Single-select' },
    { id: 'rq4', text: 'What is driving the change, if you know?', type: 'Open text' },
  ] as RequestedQuestion[],
} as const;
