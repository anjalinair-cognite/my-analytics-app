import { useContext } from 'react';

import { AppStateContext, type AppStateStore } from './appStateContext';

export function useAppState(): AppStateStore {
  const store = useContext(AppStateContext);
  if (!store) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return store;
}
