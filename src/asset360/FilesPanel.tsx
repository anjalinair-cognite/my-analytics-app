import { Badge } from '@cognite/aura/components/badge';
import { Button } from '@cognite/aura/components/button';
import { DataGrid } from '@cognite/aura/data-grid';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, type ReactNode } from 'react';

import { instanceKey } from '../cdm/parse';
import type { InstanceRef, RelatedFile } from '../cdm/types';

import { PanelEmpty, PanelStatus, TruncationNotice } from './PanelStatus';
import { TableSkeleton } from './skeletons';
import type { QuerySlice } from './useAsset360ViewModel';

type FilesPanelProps = {
  hasSelection: boolean;
  files: QuerySlice<RelatedFile[]>;
  selectedFile: InstanceRef | null;
  preview: ReactNode;
  onSelectFile: (file: RelatedFile) => void;
};

export function FilesPanel({
  hasSelection,
  files,
  selectedFile,
  preview,
  onSelectFile,
}: FilesPanelProps) {
  const selectedKey = selectedFile ? instanceKey(selectedFile) : null;
  const columns = useMemo(
    () => fileColumns(onSelectFile, selectedKey),
    [onSelectFile, selectedKey]
  );

  return (
    <div className="flex flex-col gap-4">
      {!hasSelection ? (
        <PanelEmpty
          title="No instance selected"
          description="Select an instance to load related files."
          type="unknown"
        />
      ) : (
        <PanelStatus
          isLoading={files.isLoading}
          isError={files.isError}
          errorMessage={files.errorMessage}
          isEmpty={files.isEmpty}
          emptyTitle="No files"
          emptyDescription="This instance has no related files."
          skeleton={<TableSkeleton />}
        >
          <div className="flex h-72 flex-col gap-2">
            <TruncationNotice truncated={files.truncated === true} />
            <div className="min-h-0 flex-1">
              <DataGrid
                aria-label="Documents"
                data={files.data}
                columns={columns}
                getRowId={instanceKey}
                enableSorting
                defaultSorting={[{ id: 'name', desc: false }]}
                size="compact"
              />
            </div>
          </div>
        </PanelStatus>
      )}
      {selectedFile ? preview : null}
    </div>
  );
}

function fileColumns(
  onSelectFile: (file: RelatedFile) => void,
  selectedKey: string | null
): ColumnDef<RelatedFile>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'mimeType',
      header: 'Type',
      cell: ({ row }) => {
        const mimeType = row.original.mimeType;
        return mimeType ? <Badge variant="gray">{mimeType}</Badge> : <Badge variant="archived">N/A</Badge>;
      },
    },
    {
      accessorKey: 'isUploaded',
      header: 'Status',
      cell: ({ row }) =>
        row.original.isUploaded ? (
          <Badge variant="success">Uploaded</Badge>
        ) : (
          <Badge variant="archived">Not uploaded</Badge>
        ),
    },
    {
      id: 'preview',
      header: 'Preview',
      cell: ({ row }) => {
        const file = row.original;
        const selected = selectedKey !== null && instanceKey(file) === selectedKey;
        return (
          <Button
            size="sm"
            variant={selected ? 'secondary' : 'outline'}
            aria-label={`Preview ${file.name}`}
            onClick={() => onSelectFile(file)}
          >
            Preview
          </Button>
        );
      },
      enableSorting: false,
      size: 120,
    },
  ];
}
