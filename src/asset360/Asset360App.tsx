import { AppShell } from '../shell/AppShell';

import { Asset360Page } from './Asset360Page';
import { useAsset360ViewModel } from './useAsset360ViewModel';

export function Asset360App() {
  const { identity, clearSelection } = useAsset360ViewModel();

  return (
    <AppShell selectedName={identity.data?.name ?? null} onGoHome={clearSelection}>
      <Asset360Page />
    </AppShell>
  );
}
