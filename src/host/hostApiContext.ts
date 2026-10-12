import type { HostAppAPI } from '@cognite/app-sdk';
import { createContext } from 'react';

export type HostApi = Pick<HostAppAPI, 'syncInternalState'>;

export const HostApiContext = createContext<HostApi | null>(null);
