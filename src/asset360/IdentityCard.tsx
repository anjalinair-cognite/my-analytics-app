import { Card, CardContent, CardHeader, CardTitle } from '@cognite/aura/components/card';

import type { Identity } from '../cdm/types';

import { KindBadge } from './KindBadge';
import { PanelEmpty, PanelStatus } from './PanelStatus';
import { IdentitySkeleton } from './skeletons';
import type { QuerySlice } from './useAsset360ViewModel';

type IdentityCardProps = {
  hasSelection: boolean;
  identity: QuerySlice<Identity | null>;
};

export function IdentityCard({ hasSelection, identity }: IdentityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Identity</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasSelection ? (
          <PanelEmpty
            title="No instance selected"
            description="Select an asset or equipment from search results."
            type="unknown"
          />
        ) : (
          <PanelStatus
            isLoading={identity.isLoading}
            isError={identity.isError}
            errorMessage={identity.errorMessage}
            isEmpty={identity.isEmpty}
            emptyTitle="Instance not found"
            emptyDescription="The selected instance could not be loaded."
            emptyType="not-found"
            skeleton={<IdentitySkeleton />}
          >
            {identity.data ? <IdentityDetails identity={identity.data} /> : null}
          </PanelStatus>
        )}
      </CardContent>
    </Card>
  );
}

function IdentityDetails({ identity }: { identity: Identity }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
      <dt className="text-muted-foreground">Name</dt>
      <dd>{identity.name}</dd>
      <dt className="text-muted-foreground">Description</dt>
      <dd>{identity.description || '—'}</dd>
      <dt className="text-muted-foreground">Type</dt>
      <dd>
        <KindBadge kind={identity.kind} />
      </dd>
      <dt className="text-muted-foreground">Space</dt>
      <dd>{identity.space}</dd>
      <dt className="text-muted-foreground">External ID</dt>
      <dd>{identity.externalId}</dd>
      {identity.parent ? (
        <>
          <dt className="text-muted-foreground">Parent</dt>
          <dd>{identity.parent.name}</dd>
        </>
      ) : null}
      {identity.asset ? (
        <>
          <dt className="text-muted-foreground">Asset</dt>
          <dd>{identity.asset.name}</dd>
        </>
      ) : null}
      {identity.manufacturer ? (
        <>
          <dt className="text-muted-foreground">Manufacturer</dt>
          <dd>{identity.manufacturer}</dd>
        </>
      ) : null}
      {identity.serialNumber ? (
        <>
          <dt className="text-muted-foreground">Serial number</dt>
          <dd>{identity.serialNumber}</dd>
        </>
      ) : null}
    </dl>
  );
}
