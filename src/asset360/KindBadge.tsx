import { Badge } from '@cognite/aura/components/badge';

import type { InstanceKind } from '../cdm/types';

export function KindBadge({ kind }: { kind: InstanceKind }) {
  return (
    <Badge variant={kind === 'asset' ? 'nordic' : 'fjord'}>
      {kind === 'asset' ? 'Asset' : 'Equipment'}
    </Badge>
  );
}
