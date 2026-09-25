/**
 * Fiona's cards render, and show the figures the answers quote.
 *
 * The chat prose and the cards read from different places (chatFlows.json vs
 * constants.ts). financeData.test.ts pins the constants; this renders each
 * card and checks the figure the CEO or CFO will read off it, so a card that
 * throws, or rounds differently from the sentence above it, fails here rather
 * than in the room.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import manifest from '@/markets/financial-services/clients/ussfcu/personas/finance/manifest';
import FinanceBriefingSignals from './FinanceBriefingSignals';
import FinanceKpiRow from './FinanceKpiRow';
import { FINANCE_CHIPS, ILLUSTRATIVE_NOTICE } from '@/data/ussfcu/finance/constants';

vi.mock('../../../context/PersonaContext', () => ({ usePersona: () => ({ id: 'ussfcu_finance' }) }));

const P = 'ussfcu_finance_';
const renderTurn = (flowKey) => render(<>{manifest.inlineComponents({ flowKey, id: 't' }, manifest.signals)}</>);
const text = () => document.body.textContent;

describe('Fiona inline cards', () => {
  afterEach(cleanup);

  it('Step 2 flags Home Improvement Loan at 1.8% against 1.5%, 1.1% two quarters ago, first mortgage 0.4% and HELOC 0.6%', () => {
    renderTurn(`${P}turn_delinquency`);
    expect(text()).toContain('eight quarters');
    expect(text()).toContain('Parameter 1.5% · 1.1% two quarters ago');
    expect(text()).toContain('Breach +0.3 pts');
    expect(text()).toContain('0.4%');
    expect(text()).toContain('0.6%');
    expect(text()).toContain('loans originated in the last 18 months, through the contractor channel.');
    expect(text()).toContain('Illustrative data');
  });

  it('Step 3 shows first mortgage at 571% of a 600% cap, $655M, about $33M of headroom, ~2 quarters', () => {
    renderTurn(`${P}turn_limits`);
    expect(text()).toContain('571%');
    expect(text()).toContain('Board cap 600%');
    expect(text()).toContain('$655M');
    expect(text()).toContain('About $33M headroom');
    expect(text()).toContain('~2 quarters');
    expect(text()).toContain('none other within 15 points');
    expect(text()).toContain('+2 qtrs');
  });

  it('Step 4 shows the 30-day shutdown: 27% affected, 18%, 6%, +$4.2M over two quarters, HIL leading', () => {
    renderTurn(`${P}turn_shutdown`);
    expect(text()).toContain('30-day government shutdown');
    expect(text()).toContain('27% of all members · ~14,200');
    expect(text()).toContain('18% of affected members');
    expect(text()).toContain('6% of affected members');
    expect(text()).toContain('+$4.2M');
    expect(text()).toContain('Over two quarters');
    const lead = screen.getByText('Leading').closest('tr');
    expect(within(lead).getByText(/Home Improvement Loan/)).toBeTruthy();
  });

  it('Step 5 moves net worth 7.50% → 7.2%, leaves $35M, loan-to-share 84% → 87% below the 88% trigger, reconciled three ways', () => {
    renderTurn(`${P}turn_cushion`);
    expect(text()).toContain('7.50%');
    expect(text()).toContain('7.2%');
    expect(text()).toContain('$35M');
    expect(text()).toContain('87%');
    expect(text()).toContain('1 pt below the trigger');
    expect(text()).toContain('0.2 pts above the line');
    expect(text()).toContain('Funding-review trigger 88%');
    expect(text()).toContain('Capital position reconciled across three sources');
    expect(screen.getAllByText('Matched')).toHaveLength(3);
    for (const sys of ['Jack Henry Symitar', 'General Ledger and Cornerstone', 'UST Finex']) expect(text()).toContain(sys);
  });

  it('Step 6 lists all five playbook actions and recommends the short band', () => {
    renderTurn(`${P}turn_playbook`);
    for (const a of [
      'Proactive outreach and hardship-deferral offers to the affected payroll groups',
      'Pause Home Improvement Loan marketing to the most exposed segments',
      'Activate the emergency-liquidity line',
      'Tighten unsecured underwriting',
      'Stand up the member relief program the board pre-approved',
    ])
      expect(text()).toContain(a);
    expect(text()).toContain('Modeled: 30 days');
    const rec = screen.getByText(/Recommended ·/).closest('tr');
    expect(within(rec).getByText('Anticipated or short shutdown')).toBeTruthy();
  });

  it('Step 7 totals +0.6%, alerts on one payroll group at −4.2% against the 3% rule, amount and count', () => {
    renderTurn(`${P}turn_seg_deposits`);
    expect(text()).toContain('+0.6%');
    expect(text()).toContain('Alert raised · Payroll group A −4.2%');
    expect(text()).toContain('more than 3%');
    expect(text()).toContain('Detail attached');
    expect(text()).toContain('Month-over-month change by SEG');
    expect(screen.getByRole('columnheader', { name: 'Amount' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Accounts' })).toBeTruthy();
    expect(screen.getAllByText('Alert', { selector: 'span' })).toHaveLength(1);
    expect(screen.getAllByText('Trending down')).toHaveLength(1);
  });
});

describe('Fiona briefing', () => {
  afterEach(cleanup);

  it('states the data posture, badges Critical / Warning / Warning, and opens each signal’s turn', () => {
    const onSignalClick = vi.fn();
    render(<FinanceBriefingSignals signals={manifest.signals} visible onSignalClick={onSignalClick} signalToChip={manifest.ui.signalToChip} />);
    expect(text()).toContain(ILLUSTRATIVE_NOTICE);
    const cards = screen.getAllByRole('button');
    expect(cards.map((c) => within(c).getByText(/^(Critical|Warning)$/).textContent)).toEqual(['Critical', 'Warning', 'Warning']);
    for (const bucket of ['Delinquencies', 'Risk-tolerance threshold', 'Trigger events and liquidity']) expect(text()).toContain(bucket);
    // The shared card's content: sources, one key figure and confidence; no description or action line.
    for (const sig of manifest.signals) {
      expect(text()).toContain(sig.metric_text);
      expect(text()).toContain(`${sig.confidence.score}%`);
      expect(text()).not.toContain(sig.actionShort);
    }
    expect(text()).toContain('Sources:');
    cards.forEach((c) => fireEvent.click(c));
    expect(onSignalClick.mock.calls.map((c) => c[0])).toEqual([FINANCE_CHIPS.delinquency, FINANCE_CHIPS.limits, FINANCE_CHIPS.shutdown]);
  });

  it('shows the eight KPIs as a carousel, four a page, with source and target, each opening its turn', async () => {
    const onStatClick = vi.fn();
    render(<FinanceKpiRow stats={manifest.ui.stats} visible onStatClick={onStatClick} />);
    const tiles = () => screen.getAllByRole('button').filter((b) => !/KPIs$/.test(b.getAttribute('aria-label') ?? ''));
    const prev = screen.getByRole('button', { name: 'Previous KPIs' });
    const next = screen.getByRole('button', { name: 'Next KPIs' });

    // Page 1: net worth ratio → Home Improvement Loan delinquency.
    expect(text()).toContain('1/2');
    expect(prev.disabled).toBe(true);
    expect(tiles()).toHaveLength(4);
    expect(text()).toContain('Net worth ratio');
    expect(screen.getAllByText('Public')).toHaveLength(1);
    expect(text()).toContain('Below the 600% board cap');
    expect(text()).toContain('Symitar + Cornerstone + UST Finex');
    tiles().forEach((t) => fireEvent.click(t));
    expect(onStatClick.mock.calls[3][0]).toBe(FINANCE_CHIPS.delinquency);

    // Page 2: loan growth → SEG deposits.
    fireEvent.click(next);
    expect(await screen.findByText('2/2')).toBeTruthy();
    expect(await screen.findByText('SEG deposits, month over month')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next KPIs' }).disabled).toBe(true);
    expect(screen.queryByText('Public')).toBeNull();
    tiles().forEach((t) => fireEvent.click(t));
    expect(onStatClick).toHaveBeenCalledTimes(8);
    expect(onStatClick.mock.calls[7][0]).toBe(FINANCE_CHIPS.segDeposits);
  });
});

describe('Fiona pages', () => {
  afterEach(cleanup);

  it('Portfolio and Limits renders the KPI row, the limit chart and the delinquency trend', async () => {
    const { default: Page } = await import('./pages/FinancePortfolioRisk');
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(text()).toContain('Portfolio and Limits');
    expect(text()).toContain('Portfolios against board risk-tolerance limits');
    expect(text()).toContain('60-day delinquency by loan segment');
    expect(text()).toContain('1/2');
  });

  it('Scenarios and ALM renders the shutdown impact, the gauges and the playbook', async () => {
    const { default: Page } = await import('./pages/FinanceScenarios');
    render(<MemoryRouter><Page /></MemoryRouter>);
    expect(text()).toContain('Scenarios and ALM');
    expect(text()).toContain('30-day government shutdown');
    expect(text()).toContain('Capital position reconciled across three sources');
    expect(text()).toContain('Board playbook · shutdown trigger');
  });

  it('Data Sources shows the backdrop, the gap, the §8 current state and the §9 journey', async () => {
    const { default: Panel } = await import('./FinanceDataPosturePanel');
    render(<MemoryRouter><Panel /></MemoryRouter>);
    expect(text()).toContain('Real public backdrop');
    expect(text()).toContain('Approximately 52,500');
    expect(text()).toContain('most of the cross-system assembly still happens by hand in Excel');
    expect(await screen.findByText('Current State: Portfolio and Scenario Analysis')).toBeTruthy();
    expect(await screen.findByText(/From the Morning Signal to a Recommendation/)).toBeTruthy();
  });
});
