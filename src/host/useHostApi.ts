import { useContext } from 'react';

import { HostApiContext, type HostApi } from './hostApiContext';

export function useHostApi(): HostApi {
  const api = useContext(HostApiContext);
  if (!api) {
    throw new Error('useHostApi must be used within HostApiProvider');
  }
  return api;
}
