import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { KindBadge } from './KindBadge';

describe(KindBadge.name, () => {
  it('labels an asset with a decorative badge', () => {
    render(<KindBadge kind="asset" />);
    expect(screen.getByText('Asset')).toBeInTheDocument();
  });

  it('labels equipment with a decorative badge', () => {
    render(<KindBadge kind="equipment" />);
    expect(screen.getByText('Equipment')).toBeInTheDocument();
  });
});
