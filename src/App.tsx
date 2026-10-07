import { connectToHostApp as connectToHostAppImpl } from '@cognite/app-sdk';
import { CogniteSdkProvider } from '@cognite/app-sdk/react';
import { Alert, AlertDescription } from '@cognite/aura/components/alert';
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from '@cognite/aura/components/empty-state';
import { useEffect, useState, type ComponentProps } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

import { Asset360App } from './asset360/Asset360App';
import {
  Asset360ViewModelContext,
  defaultAsset360ViewModelContext,
  type Asset360ViewModelContextType,
} from './asset360/asset360ViewModelContext';
import { AppPageSkeleton } from './asset360/skeletons';
import { AppStateProvider } from './host/AppStateProvider';
import type { HostApi } from './host/hostApiContext';
import { HostApiProvider } from './host/HostApiProvider';

type AppConnectResult = { api: HostApi; initialState?: string };

type HostConnectState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'ready'; result: AppConnectResult };

const loadingFallback = (
  <main className="min-h-screen bg-muted/50 text-foreground">
    <div role="status" aria-live="polite" aria-label="Loading project">
      <span className="sr-only">Loading project...</span>
      <AppPageSkeleton />
    </div>
  </main>
);

const errorFallback = (
  <main className="min-h-screen bg-muted/50 text-foreground">
    <section className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center p-4 sm:p-8">
      <div className="mx-auto w-full max-w-sm">
        <Alert>
          <AlertDescription>Failed to connect to Fusion host</AlertDescription>
        </Alert>
      </div>
    </section>
  </main>
);

function AppErrorFallback({ error }: FallbackProps) {
  const message = error instanceof Error ? error.message : 'Something went wrong';
  return (
    <main className="min-h-screen bg-muted/50 text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center p-4 sm:p-8">
        <div className="mx-auto w-full max-w-sm" role="alert">
          <EmptyState type="unknown">
            <EmptyStateIcon />
            <EmptyStateTitle as="h1">Something went wrong</EmptyStateTitle>
            <EmptyStateDescription>{message}</EmptyStateDescription>
          </EmptyState>
        </div>
      </section>
    </main>
  );
}

type AppProps = {
  deps?: ComponentProps<typeof CogniteSdkProvider>['deps'];
  connectToHostApp?: () => Promise<AppConnectResult>;
  viewModelContext?: Asset360ViewModelContextType;
};

function App({
  deps,
  connectToHostApp = deps?.connectToHostApp ?? connectToHostAppImpl,
  viewModelContext = defaultAsset360ViewModelContext,
}: AppProps) {
  const [hostConnect, setHostConnect] = useState<HostConnectState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void connectToHostApp()
      .then((result) => {
        if (!cancelled) setHostConnect({ status: 'ready', result });
      })
      .catch(() => {
        if (!cancelled) setHostConnect({ status: 'failed' });
      });
    return () => {
      cancelled = true;
    };
  }, [connectToHostApp]);

  let content = loadingFallback;
  if (hostConnect.status === 'failed') {
    content = errorFallback;
  } else if (hostConnect.status === 'ready') {
    content = (
      <HostApiProvider api={hostConnect.result.api}>
        <AppStateProvider initialState={hostConnect.result.initialState}>
          <Asset360ViewModelContext.Provider value={viewModelContext}>
            <Asset360App />
          </Asset360ViewModelContext.Provider>
        </AppStateProvider>
      </HostApiProvider>
    );
  }

  return (
    <CogniteSdkProvider loadingFallback={loadingFallback} errorFallback={errorFallback} deps={deps}>
      <ErrorBoundary FallbackComponent={AppErrorFallback}>{content}</ErrorBoundary>
    </CogniteSdkProvider>
  );
}

export default App;
