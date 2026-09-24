/**
 * The Finance Team's cards render, and show the figures the answers quote.
 *
 * The chat prose and the cards read from different places (chatFlows.json vs
 * constants.ts). financeData.test.ts pins the constants; this renders each
 * card and checks the figure the CEO or CFO will read off it, so a card that
 * throws, or rounds differently from the sentence above it, fails here rather
 * than in the room.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import manifest from '@/markets/financial-services/clients/ussfcu/personas/finance/manifest';
import FinanceBriefingSignals from './FinanceBriefingSignals';
import FinanceKpiRow from './FinanceKpiRow';
import { FINANCE_CHIPS } from '@/data/ussfcu/finance/constants';

const P = 'ussfcu_finance_';
const renderTurn = (flowKey) => render(<>{manifest.inlineComponents({ flowKey, id: 't' }, manifest.signals)}</>);
const text = () => document.body.textContent;

describe('Finance Team inline cards', () => {
  afterEach(cleanup);

  it('Q1 flags indirect auto at 1.80% against its 1.50% parameter, and the last-18-months vintage', () => {
    renderTurn(`${P}turn_delinquency`);
    const row = screen.getByText('Indirect auto', { selector: 'td' }).closest('tr');
    expect(within(row).getByText('1.80%')).toBeTruthy();
    expect(within(row).getByText('1.50%')).toBeTruthy();
    expect(within(row).getByText('Outside')).toBeTruthy();
    expect(screen.getAllByText('Outside')).toHaveLength(1);
    expect(text()).toContain('Originated in the last 18 months');
    expect(text()).toContain('Illustrative data');
  });

  it('Q2 shows first mortgage at 571% of a 600% cap, about $33M of headroom, ~2 quarters', () => {
    renderTurn(`${P}turn_limits`);
    expect(text()).toContain('571%');
    expect(text()).toContain('about $33M');
    expect(text()).toContain('~2 quarters');
    expect(text()).toContain('$655M');
  });

  it('Q3 covers ±25/50/100 bp, with the $18M mark and 7.10% at +100', () => {
    renderTurn(`${P}turn_rate_shock`);
    for (const h of ['−100 bp', '−50 bp', '−25 bp', '+25 bp', '+50 bp', '+100 bp']) expect(screen.getByRole('columnheader', { name: h })).toBeTruthy();
    expect(text()).toContain('−$18.0M');
    expect(text()).toContain('+$18.0M');
    expect(text()).toContain('7.10%');
    expect(screen.getAllByText('Watch')).toHaveLength(1);
  });

  it('Q4 moves net worth 7.50% → ~7.1%, leaves ~$40M, and loan-to-share 84% → 88%', () => {
    renderTurn(`${P}turn_dry_powder`);
    expect(text()).toContain('7.50%');
    expect(text()).toContain('~7.1%');
    expect(text()).toContain('~$40M');
    expect(text()).toContain('84%');
    expect(text()).toContain('88%');
    expect(text()).toContain('Funding review is triggered at 88%');
  });

  it('Q5 quotes the three playbook actions and marks +100 as the modelled scenario', () => {
    renderTurn(`${P}turn_playbook`);
    expect(text()).toContain('Hold deposit rates and monitor.');
    expect(text()).toContain('12- and 18-month terms');
    expect(text()).toContain('Launch the deposit-gathering campaign');
    expect(screen.getAllByText('Scenario modelled')).toHaveLength(1);
  });

  it('Q6 totals +0.6%, alerts on one payroll group at −4.2% against the 3% rule', () => {
    renderTurn(`${P}turn_seg_deposits`);
    expect(text()).toContain('+0.6%');
    expect(text()).toContain('Alert raised · Payroll group A −4.2%');
    expect(text()).toContain('more than 3%');
    expect(screen.getAllByText('Alert', { selector: 'span' })).toHaveLength(1);
    expect(screen.getAllByText('Trending down')).toHaveLength(1);
  });
});

describe('Finance Team briefing', () => {
  afterEach(cleanup);

  it('badges the three signals ACT NOW, WATCH, WATCH and opens each one’s question', () => {
    const onSignalClick = vi.fn();
    render(<FinanceBriefingSignals signals={manifest.signals} visible onSignalClick={onSignalClick} signalToChip={manifest.ui.signalToChip} />);
    const cards = screen.getAllByRole('button');
    expect(cards.map((c) => within(c).getByText(/ACT NOW|WATCH/).textContent)).toEqual(['ACT NOW', 'WATCH', 'WATCH']);
    cards.forEach((c) => fireEvent.click(c));
    expect(onSignalClick.mock.calls.map((c) => c[0])).toEqual([FINANCE_CHIPS.delinquency, FINANCE_CHIPS.limits, FINANCE_CHIPS.rateShock]);
  });

  it('shows six KPI tiles, the three public-profile ones marked, each opening its question', () => {
    const onStatClick = vi.fn();
    render(<FinanceKpiRow stats={manifest.ui.stats} visible onStatClick={onStatClick} />);
    const tiles = screen.getAllByRole('button');
    expect(tiles).toHaveLength(6);
    expect(screen.getAllByText('Public')).toHaveLength(3);
    tiles.forEach((t) => fireEvent.click(t));
    expect(onStatClick).toHaveBeenCalledTimes(6);
    expect(onStatClick.mock.calls[3][0]).toBe(FINANCE_CHIPS.delinquency);
  });
});
