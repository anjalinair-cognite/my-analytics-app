import { Skeleton } from '@cognite/aura/components/skeleton';

export function IdentitySkeleton() {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
    </div>
  );
}

export function SearchListSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3">
      <ListItemSkeleton />
      <ListItemSkeleton />
      <ListItemSkeleton />
      <ListItemSkeleton />
    </div>
  );
}

export function TimeSeriesSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <ListItemSkeleton />
        <ListItemSkeleton />
        <ListItemSkeleton />
      </div>
      <ChartSkeleton />
    </div>
  );
}

export function ChartSkeleton() {
  return <Skeleton className="h-64 w-full" />;
}

export function TableSkeleton() {
  return (
    <div className="flex h-72 flex-col gap-2">
      <div className="flex gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function FilePreviewSkeleton() {
  return <Skeleton className="h-[480px] w-full" />;
}

export function AppPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <Skeleton className="h-14 w-full rounded-none" />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-1/3 min-w-80 flex-col gap-3 border-r p-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-full" />
    </>
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
