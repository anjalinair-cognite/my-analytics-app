import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from './AppShell';

describe(AppShell.name, () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders children and a home breadcrumb when nothing is selected', () => {
    render(
      <AppShell selectedName={null} onGoHome={vi.fn()}>
        <p>Body</p>
      </AppShell>
    );
    expect(screen.getByText('My Analytics App')).toBeInTheDocument();
    expect(screen.getByText('Read-only')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.queryByText('PUMP-101')).not.toBeInTheDocument();
  });

  it('shows the selected asset and goes home from the app breadcrumb', async () => {
    const user = userEvent.setup();
    const onGoHome = vi.fn();
    render(
      <AppShell selectedName="PUMP-101" onGoHome={onGoHome}>
        <p>Body</p>
      </AppShell>
    );
    expect(screen.getByText('PUMP-101')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'My Analytics App' }));
    expect(onGoHome).toHaveBeenCalledTimes(1);
  });
});
