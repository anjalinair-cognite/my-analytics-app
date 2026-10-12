import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { parseAppState, type AppState } from './appState';
import { AppStateContext } from './appStateContext';
import { useHostApi } from './useHostApi';

type AppStateProviderProps = {
  initialState?: string;
  children: ReactNode;
};

export function AppStateProvider({ initialState, children }: AppStateProviderProps) {
  const api = useHostApi();
  const [state, setState] = useState<AppState>(() => parseAppState(initialState));

  const updateState = useCallback(
    (next: AppState) => {
      setState(next);
      void api.syncInternalState(JSON.stringify(next));
    },
    [api]
  );

  const value = useMemo(() => ({ state, updateState }), [state, updateState]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
