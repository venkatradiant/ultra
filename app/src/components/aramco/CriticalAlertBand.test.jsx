/**
 * The strip is the only chrome that follows Gina to every page the incident
 * sends her to, which makes it the one place a way back can live. Before it had
 * one, "View Live Camera" was a one-way door: the only controls left on the
 * camera wall were the ones that had opened the camera.
 *
 * The other thing pinned here is what the strip is *not*. It used to hold the
 * whole incident and expand to two thirds of the screen; the detail now lives
 * in the drawer, and the return no longer has to shut anything on the way — the
 * drawer is a column beside the page, so it costs the destination nothing and
 * she arrives with the incident exactly as she left it.
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
  open: false,
  setOpen: vi.fn(),
};

vi.mock('../../context/CriticalAlertContext', () => ({
  useCriticalAlert: () => alertState,
}));

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
  alertState.active = true;
  alertState.open = false;
  alertState.setOpen = vi.fn();
});

describe('CriticalAlertBand — the way back', () => {
  it('offers a return once the incident has sent her off /ask', () => {
    mountAt('/live-site?tab=cameras&camera=CAM-U3-CK-04');
    expect(screen.getByRole('button', { name: /back to conversation/i })).toBeTruthy();
  });

  it('does not offer one on /ask, where she already is', () => {
    mountAt('/ask');
    expect(screen.queryByRole('button', { name: /back to conversation/i })).toBeNull();
  });

  it('navigates to /ask without disturbing the drawer', () => {
    alertState.open = true;
    mountAt('/live-site');

    fireEvent.click(screen.getByRole('button', { name: /back to conversation/i }));

    expect(screen.getByTestId('pathname').textContent).toBe('/ask');
    // The return is navigation and nothing else. Closing the incident on her
    // behalf is what the old band had to do to avoid burying the page, and it
    // meant every trip cost her the panel she was working in.
    expect(alertState.setOpen).not.toHaveBeenCalled();
  });

  it('still exposes the details toggle alongside the return', () => {
    mountAt('/muster');
    expect(screen.getByRole('button', { name: /view details/i })).toBeTruthy();
  });
});

describe('CriticalAlertBand — staying one line', () => {
  it('never renders the incident detail itself', () => {
    alertState.open = true;
    const { container } = mountAt('/ask');
    // The strip's entire job is the summary line. If the panel ever renders in
    // here again the layout is back to being pushed down by two thirds of a
    // screen, which is the bug this rewrite removed.
    expect(container.querySelector('[data-testid="panel"]')).toBeNull();
    expect(screen.getByRole('button', { name: /hide details/i })).toBeTruthy();
  });

  it('opens the drawer from the strip', () => {
    mountAt('/ask');
    fireEvent.click(screen.getByRole('button', { name: /view details/i }));
    expect(alertState.setOpen).toHaveBeenCalledWith(true);
  });

  it('goes quiet, and hands the alarm to the drawer, once the drawer is open', () => {
    alertState.open = true;
    mountAt('/ask');

    // Both surfaces rose, adjacent, carrying the same six words was the
    // complaint: two red banners with nothing to say which one to read. While
    // the drawer is showing, the strip drops the status pill and the detail
    // line it would otherwise print verbatim alongside them.
    expect(screen.queryByText('New')).toBeNull();
    expect(screen.queryByText(/coker drum c-301/i)).toBeNull();
    // The headline stays — the line still has to be identifiable at a glance.
    expect(screen.getByText(/worker fall detected/i)).toBeTruthy();
  });

  it('is the alarm again the moment the drawer is shut', () => {
    alertState.open = false;
    mountAt('/ask');

    expect(screen.getByText('New')).toBeTruthy();
    expect(screen.getByText(/coker drum c-301/i)).toBeTruthy();
  });

  it('renders nothing at all when no alert is active', () => {
    alertState.active = false;
    const { container } = mountAt('/live-site');
    expect(container.querySelector('section')).toBeNull();
  });
});
