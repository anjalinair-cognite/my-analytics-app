import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { computeBaseWidth, useViewport, type ViewportOptions } from './useViewport';

function ViewportProbe(props: ViewportOptions) {
  const viewport = useViewport(props);
  return (
    <div>
      <div
        data-testid="viewport"
        ref={viewport.viewportRef}
        data-zoom={String(viewport.currentZoom)}
        data-cursor={viewport.cursor}
        data-pan-x={String(viewport.effectivePan.x)}
        data-pan-y={String(viewport.effectivePan.y)}
        onMouseDown={viewport.handleMouseDown}
      />
      <button type="button" onClick={() => viewport.handleZoomChange(2.2)}>
        zoom-in
      </button>
      <button type="button" onClick={() => viewport.handlePanChange({ x: -5, y: -8 })}>
        pan
      </button>
    </div>
  );
}

describe(computeBaseWidth.name, () => {
  it('returns the explicit width when fit mode is off', () => {
    expect(computeBaseWidth(undefined, 400, { width: 800, height: 600 }, { width: 100, height: 100 })).toBe(
      400
    );
  });

  it('fits to container width', () => {
    expect(computeBaseWidth('width', 400, { width: 800, height: 600 }, null)).toBe(800);
  });

  it('fits a page into the container', () => {
    expect(computeBaseWidth('page', 400, { width: 800, height: 400 }, { width: 200, height: 100 })).toBe(800);
    expect(computeBaseWidth('page', 400, { width: 400, height: 800 }, { width: 100, height: 200 })).toBe(400);
  });

  it('falls back to explicit width when page fit lacks size', () => {
    expect(computeBaseWidth('page', 320, { width: 0, height: 0 }, null)).toBe(320);
    expect(computeBaseWidth('page', 320, { width: 400, height: 400 }, null)).toBe(320);
  });
});

describe(useViewport.name, () => {
  it('starts at zoom 1 with a default cursor', () => {
    render(<ViewportProbe />);
    const node = screen.getByTestId('viewport');
    expect(node).toHaveAttribute('data-zoom', '1');
    expect(node).toHaveAttribute('data-cursor', 'default');
  });

  it('zooms and pans through the viewport handlers', async () => {
    const user = userEvent.setup();
    const onZoomChange = vi.fn();
    const onPanChange = vi.fn();
    render(<ViewportProbe zoom={2} onZoomChange={onZoomChange} onPanChange={onPanChange} />);
    const node = screen.getByTestId('viewport');
    expect(node).toHaveAttribute('data-cursor', 'grab');

    await user.click(screen.getByRole('button', { name: 'zoom-in' }));
    expect(onZoomChange).toHaveBeenCalledWith(2.2);

    await user.click(screen.getByRole('button', { name: 'pan' }));
    expect(onPanChange).toHaveBeenCalledWith({ x: -5, y: -8 });

    act(() => {
      node.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -10, ctrlKey: true, bubbles: true, cancelable: true })
      );
      node.dispatchEvent(
        new WheelEvent('wheel', { deltaX: 5, deltaY: 8, bubbles: true, cancelable: true })
      );
    });
  });

  it('starts a middle-button pan when zoomed in', () => {
    render(<ViewportProbe zoom={2} />);
    const node = screen.getByTestId('viewport');
    act(() => {
      node.dispatchEvent(
        new MouseEvent('mousedown', { button: 1, clientX: 10, clientY: 10, bubbles: true, cancelable: true })
      );
    });
    expect(node).toHaveAttribute('data-cursor', 'grabbing');
  });

  it('ignores middle-click pan when zoom is 1', () => {
    render(<ViewportProbe zoom={1} />);
    const node = screen.getByTestId('viewport');
    act(() => {
      node.dispatchEvent(
        new MouseEvent('mousedown', { button: 1, clientX: 10, clientY: 10, bubbles: true, cancelable: true })
      );
    });
    expect(node).toHaveAttribute('data-cursor', 'default');
  });

  it('handles pinch zoom on touch', () => {
    const onZoomChange = vi.fn();
    render(<ViewportProbe onZoomChange={onZoomChange} />);
    const node = screen.getByTestId('viewport');
    const startInit = {
      touches: [
        { clientX: 0, clientY: 0 },
        { clientX: 10, clientY: 0 },
      ],
      bubbles: true,
      cancelable: true,
    } as unknown as TouchEventInit;
    const moveInit = {
      touches: [
        { clientX: 0, clientY: 0 },
        { clientX: 20, clientY: 0 },
      ],
      bubbles: true,
      cancelable: true,
    } as unknown as TouchEventInit;
    act(() => {
      node.dispatchEvent(new TouchEvent('touchstart', startInit));
      node.dispatchEvent(new TouchEvent('touchmove', moveInit));
      node.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true }));
    });
    expect(onZoomChange.mock.calls.length).toBeGreaterThan(0);
  });
});
