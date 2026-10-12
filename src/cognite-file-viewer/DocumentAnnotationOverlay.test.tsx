import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DocumentAnnotationOverlay, getAllAnnotationColors, getAnnotationColor } from './DocumentAnnotationOverlay';
import type { DocumentAnnotation } from './types';

const annotation: DocumentAnnotation = {
  id: 'ann-1',
  x: 0.1,
  y: 0.2,
  width: 0.1,
  height: 0.1,
  page: 1,
  resourceType: 'asset',
  annotationType: 'diagrams.AssetLink',
  text: 'PUMP-101',
};

describe(DocumentAnnotationOverlay.name, () => {
  it('renders clickable annotation rects', async () => {
    const user = userEvent.setup();
    const onAnnotationClick = vi.fn();
    const { container } = render(
      <DocumentAnnotationOverlay
        annotations={[annotation]}
        containerWidth={100}
        containerHeight={100}
        onAnnotationClick={onAnnotationClick}
      />
    );

    const rect = container.querySelector('rect');
    expect(rect).not.toBeNull();
    if (rect) {
      await user.click(rect);
    }
    expect(onAnnotationClick).toHaveBeenCalledWith(annotation);
    expect(screen.getByText('PUMP-101', { selector: 'title' })).toBeInTheDocument();
  });

  it('exposes annotation colors', () => {
    expect(getAnnotationColor('asset').stroke).toContain('rgb');
    expect(Object.keys(getAllAnnotationColors())).toContain('file');
  });
});
