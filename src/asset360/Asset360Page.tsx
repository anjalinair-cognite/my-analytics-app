import { instanceKey } from '../cdm/parse';

import { IdentityCard } from './IdentityCard';
import { RelatedPanels } from './RelatedPanels';
import { SearchPanel } from './SearchPanel';
import { useAsset360ViewModel } from './useAsset360ViewModel';

export function Asset360Page() {
  const vm = useAsset360ViewModel();
  const hasSelection = vm.selected !== null;
  const selectedKey = vm.selected ? instanceKey(vm.selected) : null;
  const selectedLabel =
    vm.identity.data?.name ??
    vm.search.data.find((hit) => instanceKey(hit) === selectedKey)?.name ??
    null;

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="w-1/3 min-w-80 overflow-auto border-r p-4">
        <SearchPanel
          searchQuery={vm.searchQuery}
          selectedKey={selectedKey}
          selectedLabel={selectedLabel}
          search={vm.search}
          onSubmitSearch={vm.submitSearch}
          onSelect={vm.selectInstance}
        />
      </aside>
      <section className="flex min-w-0 flex-1 flex-col gap-4 overflow-auto p-4">
        <IdentityCard hasSelection={hasSelection} identity={vm.identity} />
        <RelatedPanels
          hasSelection={hasSelection}
          relatedTab={vm.relatedTab}
          onRelatedTabChange={vm.setRelatedTab}
          timeSeries={vm.timeSeries}
          chartSeries={vm.chartSeries}
          datapoints={vm.datapoints}
          timeRangeHours={vm.timeRangeHours}
          onSelectSeries={vm.selectTimeSeries}
          onTimeRangeChange={vm.setTimeRangeHours}
          activities={vm.activities}
          files={vm.files}
          selectedFile={vm.selectedFile}
          onSelectFile={vm.selectFile}
          preview={
            vm.selectedFile
              ? vm.renderFileViewer({
                  space: vm.selectedFile.space,
                  externalId: vm.selectedFile.externalId,
                  client: vm.client,
                })
              : null
          }
        />
      </section>
    </div>
  );
}
