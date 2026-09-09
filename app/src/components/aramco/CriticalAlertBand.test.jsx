/**
 * The band is the only chrome that follows Gina to every page the alert sends
 * her to, which makes it the one place a way back can live. Before it had one,
 * "View Live Camera" was a one-way door: the only controls left on the camera
 * wall were the ones that had opened the camera.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

const alertState = {
  active: true,
  alert: {
    id: 'unit3-man-down',
    title: 'Worker Fall Detected — Unit 3 Confined Space',
    detectedLabel: '2 min ago',
    location: { vesselName: 'Coker drum C-301', zoneName: 'Unit 3 — Coker' },
    permit: { id: 'CS-1182' },
  },
  status: 'new',
  statusMeta: { label: 'New' },
  expanded: false,
  setExpanded: vi.fn(),
};

vi.mock('../../context/CriticalAlertContext', () => ({
  useCriticalAlert: () => alertState,
}));
// The panel pulls the site and indoor fixtures; the band's own controls are what
// is under test here.
vi.mock('./CriticalAlertPanel', () => ({ default: () => <div data-testid="panel" /> }));

const { default: CriticalAlertBand } = await import('./CriticalAlertBand');

function Here() {
  const { pathname } = useLocation();
  return <span data-testid="pathname">{pathname}</span>;
}

function mountAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CriticalAlertBand />
      <Routes>
        <Route path="*" element={<Here />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  alertState.expanded = false;
  alertState.setExpanded = vi.fn();
});

describe('CriticalAlertBand — the way back', () => {
  it('offers a return once the alert has sent her off /ask', () => {
    mountAt('/live-site?tab=cameras&camera=CAM-U3-CK-04');
    expect(screen.getByRole('button', { name: /back to conversation/i })).toBeTruthy();
  });

  it('does not offer one on /ask, where she already is', () => {
    mountAt('/ask');
    expect(screen.queryByRole('button', { name: /back to conversation/i })).toBeNull();
  });

  it('navigates to /ask and collapses the panel on the way', () => {
    mountAt('/live-site');

    fireEvent.click(screen.getByRole('button', { name: /back to conversation/i }));

    expect(screen.getByTestId('pathname').textContent).toBe('/ask');
    // Collapsed on arrival, so she lands on the conversation rather than on a
    // panel covering it.
    expect(alertState.setExpanded).toHaveBeenCalledWith(false);
  });

  it('still exposes the details toggle alongside the return', () => {
    mountAt('/muster');
    expect(screen.getByRole('button', { name: /view details/i })).toBeTruthy();
  });

  it('renders nothing at all when no alert is active', () => {
    alertState.active = false;
    const { container } = mountAt('/live-site');
    expect(container.querySelector('section')).toBeNull();
    alertState.active = true;
  });
});
