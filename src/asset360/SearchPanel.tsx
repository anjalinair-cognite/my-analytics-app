import { Alert, AlertDescription } from '@cognite/aura/components/alert';
import { Button } from '@cognite/aura/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@cognite/aura/components/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@cognite/aura/components/command';
import { HelperText } from '@cognite/aura/components/helper-text';
import { Label } from '@cognite/aura/components/label';
import { Popover, PopoverContent, PopoverTrigger } from '@cognite/aura/components/popover';
import { IconCaretUpDown, IconCheck } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';

import { instanceKey } from '../cdm/parse';
import type { SearchHit } from '../cdm/types';

import { KindBadge } from './KindBadge';
import { SearchListSkeleton } from './skeletons';
import type { QuerySlice } from './useAsset360ViewModel';

export const SEARCH_DEBOUNCE_MS = 300;

type SearchPanelProps = {
  searchQuery: string;
  selectedKey: string | null;
  selectedLabel: string | null;
  search: QuerySlice<SearchHit[]>;
  onSubmitSearch: (query: string) => void;
  onSelect: (hit: SearchHit) => void;
};

export function SearchPanel({
  searchQuery,
  selectedKey,
  selectedLabel,
  search,
  onSubmitSearch,
  onSelect,
}: SearchPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(searchQuery);

  useEffect(() => {
    if (draft.trim() === searchQuery.trim()) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      onSubmitSearch(draft);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draft, searchQuery, onSubmitSearch]);

  const assets = useMemo(
    () => search.data.filter((hit) => hit.kind === 'asset'),
    [search.data]
  );
  const equipment = useMemo(
    () => search.data.filter((hit) => hit.kind === 'equipment'),
    [search.data]
  );

  function handleSelect(value: string) {
    const hit = search.data.find((item) => instanceKey(item) === value);
    if (!hit) {
      return;
    }
    onSelect(hit);
    setOpen(false);
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle as="h2">Search</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Label htmlFor="asset-search">Search assets and equipment</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <div data-slot="combobox">
            <PopoverTrigger
              render={
                <Button
                  id="asset-search"
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-label="Search assets and equipment"
                  className="w-full justify-between"
                />
              }
            >
              <span className="truncate">{selectedLabel || 'Select an asset or equipment'}</span>
              <IconCaretUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[var(--anchor-width)] min-w-80 p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  value={draft}
                  onValueChange={setDraft}
                  placeholder="Type a tag, name, or alias"
                />
                <CommandList>
                  {search.isLoading ? (
                    <div role="status" aria-live="polite" aria-busy="true" aria-label="Loading">
                      <SearchListSkeleton />
                    </div>
                  ) : null}
                  {search.isError ? (
                    <Alert variant="error">
                      <AlertDescription>{search.errorMessage ?? 'Something went wrong'}</AlertDescription>
                    </Alert>
                  ) : null}
                  {!search.isLoading && !search.isError ? (
                    <>
                      <CommandEmpty>
                        {draft.trim().length === 0
                          ? 'Type a tag to find ranked assets and equipment.'
                          : 'No assets or equipment matched that query.'}
                      </CommandEmpty>
                      {assets.length > 0 ? (
                        <CommandGroup heading="Assets">
                          {assets.map((hit) => (
                            <SearchHitItem
                              key={instanceKey(hit)}
                              hit={hit}
                              selected={instanceKey(hit) === selectedKey}
                              onSelect={handleSelect}
                            />
                          ))}
                        </CommandGroup>
                      ) : null}
                      {equipment.length > 0 ? (
                        <CommandGroup heading="Equipment">
                          {equipment.map((hit) => (
                            <SearchHitItem
                              key={instanceKey(hit)}
                              hit={hit}
                              selected={instanceKey(hit) === selectedKey}
                              onSelect={handleSelect}
                            />
                          ))}
                        </CommandGroup>
                      ) : null}
                    </>
                  ) : null}
                </CommandList>
              </Command>
            </PopoverContent>
          </div>
        </Popover>
        <HelperText>Matches are ranked from CogniteCore as you type.</HelperText>
      </CardContent>
    </Card>
  );
}

function SearchHitItem({
  hit,
  selected,
  onSelect,
}: {
  hit: SearchHit;
  selected: boolean;
  onSelect: (value: string) => void;
}) {
  const key = instanceKey(hit);
  return (
    <CommandItem value={key} onSelect={onSelect}>
      <IconCheck className={selected ? 'h-4 w-4 opacity-100' : 'h-4 w-4 opacity-0'} />
      <span>
        {hit.name}
        {hit.description ? ` · ${hit.description}` : ''}
      </span>
      <KindBadge kind={hit.kind} />
    </CommandItem>
  );
}
