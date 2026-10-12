import { useCogniteSdk } from '@cognite/app-sdk/react';
import type { CogniteClient } from '@cognite/sdk';
import { createContext, type ReactNode } from 'react';

import { useAppState } from '../host/useAppState';
import { createCdmInstanceService, type CdmInstanceService } from '../services/cdmInstanceService';
import { createCdmRelatedService, type CdmRelatedService } from '../services/cdmRelatedService';
import { createCdmSearchService, type CdmSearchService } from '../services/cdmSearchService';
import { createDatapointService, type DatapointService } from '../services/datapointService';

export type FileViewerRenderProps = {
  space: string;
  externalId: string;
  client: CogniteClient;
};

export type Asset360ViewModelContextType = {
  useAppState: typeof useAppState;
  useCogniteSdk: typeof useCogniteSdk;
  createSearchService: (client: CogniteClient) => CdmSearchService;
  createInstanceService: (client: CogniteClient) => CdmInstanceService;
  createRelatedService: (client: CogniteClient) => CdmRelatedService;
  createDatapointService: (client: CogniteClient, now?: () => number) => DatapointService;
  now: () => number;
  renderFileViewer: (props: FileViewerRenderProps) => ReactNode;
};

export const defaultAsset360ViewModelContext: Asset360ViewModelContextType = {
  useAppState,
  useCogniteSdk,
  createSearchService: createCdmSearchService,
  createInstanceService: createCdmInstanceService,
  createRelatedService: createCdmRelatedService,
  createDatapointService: createDatapointService,
  now: Date.now,
  renderFileViewer: () => null,
};

export const Asset360ViewModelContext = createContext<Asset360ViewModelContextType>(
  defaultAsset360ViewModelContext
);
