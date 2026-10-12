import type { ReactNode } from 'react';

import { HostApiContext, type HostApi } from './hostApiContext';

type HostApiProviderProps = {
  api: HostApi;
  children: ReactNode;
};

export function HostApiProvider({ api, children }: HostApiProviderProps) {
  return <HostApiContext.Provider value={api}>{children}</HostApiContext.Provider>;
}
