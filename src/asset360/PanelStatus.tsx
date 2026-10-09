import { Alert, AlertDescription } from '@cognite/aura/components/alert';
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from '@cognite/aura/components/empty-state';
import { HelperText } from '@cognite/aura/components/helper-text';
import type { ReactNode } from 'react';

import { RELATED_LIST_LIMIT } from '../services/cdmRelatedService';

type EmptyType = 'no-results' | 'not-found' | 'unknown';

type PanelEmptyProps = {
  title: string;
  description: string;
  type?: EmptyType;
};

export function PanelEmpty({ title, description, type = 'no-results' }: PanelEmptyProps) {
  return (
    <EmptyState variant="compact" type={type}>
      <EmptyStateIcon />
      <EmptyStateTitle as="h3">{title}</EmptyStateTitle>
      <EmptyStateDescription>{description}</EmptyStateDescription>
    </EmptyState>
  );
}

type PanelStatusProps = {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyType?: EmptyType;
  skeleton: ReactNode;
  children: ReactNode;
};

export function PanelStatus({
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyType = 'no-results',
  skeleton,
  children,
}: PanelStatusProps) {
  if (isLoading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true" aria-label="Loading">
        {skeleton}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="error">
        <AlertDescription>{errorMessage ?? 'Something went wrong'}</AlertDescription>
      </Alert>
    );
  }

  if (isEmpty) {
    return <PanelEmpty title={emptyTitle} description={emptyDescription} type={emptyType} />;
  }

  return children;
}

export function TruncationNotice({ truncated }: { truncated: boolean }) {
  if (!truncated) {
    return null;
  }
  return <HelperText>Showing the first {RELATED_LIST_LIMIT} related records.</HelperText>;
}
