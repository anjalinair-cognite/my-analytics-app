import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@cognite/aura/chart';
import { Badge } from '@cognite/aura/components/badge';
import { Button } from '@cognite/aura/components/button';
import {
  SegmentedControl,
  SegmentedControlButton,
  SegmentedControlIndicator,
  SegmentedControlList,
} from '@cognite/aura/components/segmented-control';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { instanceKey } from '../cdm/parse';
import type { NumericDatapoint, RelatedTimeSeries } from '../cdm/types';

import { PanelEmpty, PanelStatus, TruncationNotice } from './PanelStatus';
import { ChartSkeleton, TimeSeriesSkeleton } from './skeletons';
import type { QuerySlice } from './useAsset360ViewModel';

const chartConfig = {
  value: {
    label: 'Value',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

type TimeSeriesPanelProps = {
  hasSelection: boolean;
  timeSeries: QuerySlice<RelatedTimeSeries[]>;
  chartSeries: RelatedTimeSeries | null;
  datapoints: QuerySlice<NumericDatapoint[]>;
  timeRangeHours: number;
  onSelectSeries: (series: RelatedTimeSeries) => void;
  onTimeRangeChange: (hours: number) => void;
};

export function TimeSeriesPanel({
  hasSelection,
  timeSeries,
  chartSeries,
  datapoints,
  timeRangeHours,
  onSelectSeries,
  onTimeRangeChange,
}: TimeSeriesPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {!hasSelection ? (
        <PanelEmpty
          title="No instance selected"
          description="Select an instance to load related time series."
          type="unknown"
        />
      ) : (
        <PanelStatus
          isLoading={timeSeries.isLoading}
          isError={timeSeries.isError}
          errorMessage={timeSeries.errorMessage}
          isEmpty={timeSeries.isEmpty}
          emptyTitle="No time series"
          emptyDescription="This instance has no related time series."
          skeleton={<TimeSeriesSkeleton />}
        >
          <div className="flex flex-col gap-3">
            <TruncationNotice truncated={timeSeries.truncated === true} />
            <ul className="flex flex-col gap-2">
              {timeSeries.data.map((series) => {
                const selected =
                  chartSeries !== null && instanceKey(series) === instanceKey(chartSeries);
                return (
                  <li key={instanceKey(series)}>
                    <Button
                      variant={selected ? 'secondary' : 'ghost'}
                      onClick={() => onSelectSeries(series)}
                    >
                      {series.name}
                      <Badge variant="gray">{series.type || 'numeric'}</Badge>
                      {series.sourceUnit ? <Badge variant="fjord">{series.sourceUnit}</Badge> : null}
                    </Button>
                  </li>
                );
              })}
            </ul>
            <SegmentedControl
              value={String(timeRangeHours)}
              onValueChange={(value) => {
                if (value === '24' || value === '168') {
                  onTimeRangeChange(Number(value));
                }
              }}
            >
              <SegmentedControlList size="small">
                <SegmentedControlIndicator size="small" />
                <SegmentedControlButton value="24" size="small">
                  Last 24 hours
                </SegmentedControlButton>
                <SegmentedControlButton value="168" size="small">
                  Last 7 days
                </SegmentedControlButton>
              </SegmentedControlList>
            </SegmentedControl>
            <ChartSection chartSeries={chartSeries} datapoints={datapoints} />
          </div>
        </PanelStatus>
      )}
    </div>
  );
}

function ChartSection({
  chartSeries,
  datapoints,
}: {
  chartSeries: RelatedTimeSeries | null;
  datapoints: QuerySlice<NumericDatapoint[]>;
}) {
  if (!chartSeries) {
    return (
      <PanelEmpty
        title="No chart"
        description="No numeric time series is available to chart."
      />
    );
  }

  return (
    <PanelStatus
      isLoading={datapoints.isLoading}
      isError={datapoints.isError}
      errorMessage={datapoints.errorMessage}
      isEmpty={datapoints.isEmpty}
      emptyTitle="No datapoints"
      emptyDescription="No numeric datapoints were returned for this range."
      skeleton={<ChartSkeleton />}
    >
      <ChartContainer config={chartConfig} aria-label={`${chartSeries.name} datapoints`} className="h-64 w-full">
        <LineChart data={datapoints.data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value: number) =>
              new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' })
            }
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type={chartSeries.isStep ? 'stepAfter' : 'monotone'}
            dataKey="value"
            stroke="var(--color-value)"
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </PanelStatus>
  );
}
