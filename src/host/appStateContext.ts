import { createContext } from 'react';

import type { AppState } from './appState';

export type AppStateStore = {
  state: AppState;
  updateState: (next: AppState) => void;
};

export const AppStateContext = createContext<AppStateStore | null>(null);
