import { Badge } from '@cognite/aura/components/badge';
import { DataGrid } from '@cognite/aura/data-grid';
import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';

import { instanceKey } from '../cdm/parse';
import type { RelatedActivity } from '../cdm/types';

import { PanelEmpty, PanelStatus, TruncationNotice } from './PanelStatus';
import { TableSkeleton } from './skeletons';
import type { QuerySlice } from './useAsset360ViewModel';

type ActivitiesPanelProps = {
  hasSelection: boolean;
  activities: QuerySlice<RelatedActivity[]>;
};

const activityColumns: ColumnDef<RelatedActivity>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.original.description;
      return description ? description : <Badge variant="archived">N/A</Badge>;
    },
  },
  {
    accessorKey: 'startTime',
    header: 'Start',
    cell: ({ row }) => formatTime(row.original.startTime),
  },
  {
    accessorKey: 'endTime',
    header: 'End',
    cell: ({ row }) => formatTime(row.original.endTime),
  },
];

export function ActivitiesPanel({ hasSelection, activities }: ActivitiesPanelProps) {
  if (!hasSelection) {
    return (
      <PanelEmpty
        title="No instance selected"
        description="Select an instance to load related activities."
        type="unknown"
      />
    );
  }

  return (
    <PanelStatus
      isLoading={activities.isLoading}
      isError={activities.isError}
      errorMessage={activities.errorMessage}
      isEmpty={activities.isEmpty}
      emptyTitle="No activities"
      emptyDescription="This instance has no related activities."
      skeleton={<TableSkeleton />}
    >
      <div className="flex h-72 flex-col gap-2">
        <TruncationNotice truncated={activities.truncated === true} />
        <div className="min-h-0 flex-1">
          <DataGrid
            aria-label="Work orders"
            data={activities.data}
            columns={activityColumns}
            getRowId={instanceKey}
            enableSorting
            defaultSorting={[{ id: 'startTime', desc: true }]}
            size="compact"
          />
        </div>
      </div>
    </PanelStatus>
  );
}

function formatTime(value: number | null): ReactNode {
  if (value === null) {
    return <Badge variant="archived">N/A</Badge>;
  }
  return new Date(value).toLocaleString();
}
