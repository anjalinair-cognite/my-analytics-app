import { Card, CardContent, CardHeader } from '@cognite/aura/components/card';
import { Tabs, TabsLabel, TabsList, TabsPanel, TabsTrigger } from '@cognite/aura/components/tabs';
import type { ReactNode } from 'react';

import type { InstanceRef, NumericDatapoint, RelatedActivity, RelatedFile, RelatedTimeSeries } from '../cdm/types';
import { isRelatedTab, type RelatedTab } from '../host/appState';

import { ActivitiesPanel } from './ActivitiesPanel';
import { FilesPanel } from './FilesPanel';
import { TimeSeriesPanel } from './TimeSeriesPanel';
import type { QuerySlice } from './useAsset360ViewModel';

type RelatedPanelsProps = {
  hasSelection: boolean;
  relatedTab: RelatedTab;
  onRelatedTabChange: (tab: RelatedTab) => void;
  timeSeries: QuerySlice<RelatedTimeSeries[]>;
  chartSeries: RelatedTimeSeries | null;
  datapoints: QuerySlice<NumericDatapoint[]>;
  timeRangeHours: number;
  onSelectSeries: (series: RelatedTimeSeries) => void;
  onTimeRangeChange: (hours: number) => void;
  activities: QuerySlice<RelatedActivity[]>;
  files: QuerySlice<RelatedFile[]>;
  selectedFile: InstanceRef | null;
  preview: ReactNode;
  onSelectFile: (file: RelatedFile) => void;
};

export function RelatedPanels({
  hasSelection,
  relatedTab,
  onRelatedTabChange,
  timeSeries,
  chartSeries,
  datapoints,
  timeRangeHours,
  onSelectSeries,
  onTimeRangeChange,
  activities,
  files,
  selectedFile,
  preview,
  onSelectFile,
}: RelatedPanelsProps) {
  return (
    <Card>
      <Tabs
        value={relatedTab}
        onValueChange={(value) => {
          if (isRelatedTab(value)) {
            onRelatedTabChange(value);
          }
        }}
        className="flex flex-col"
      >
        <CardHeader>
          <TabsList aria-label="Related data" fullWidth size="default">
            <TabsTrigger value="timeSeries" fullWidth>
              <TabsLabel>Time series</TabsLabel>
            </TabsTrigger>
            <TabsTrigger value="activities" fullWidth>
              <TabsLabel>Work orders</TabsLabel>
            </TabsTrigger>
            <TabsTrigger value="files" fullWidth>
              <TabsLabel>Documents</TabsLabel>
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsPanel value="timeSeries">
            <TimeSeriesPanel
              hasSelection={hasSelection}
              timeSeries={timeSeries}
              chartSeries={chartSeries}
              datapoints={datapoints}
              timeRangeHours={timeRangeHours}
              onSelectSeries={onSelectSeries}
              onTimeRangeChange={onTimeRangeChange}
            />
          </TabsPanel>
          <TabsPanel value="activities">
            <ActivitiesPanel hasSelection={hasSelection} activities={activities} />
          </TabsPanel>
          <TabsPanel value="files">
            <FilesPanel
              hasSelection={hasSelection}
              files={files}
              selectedFile={selectedFile}
              preview={preview}
              onSelectFile={onSelectFile}
            />
          </TabsPanel>
        </CardContent>
      </Tabs>
    </Card>
  );
}
