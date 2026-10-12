export type InstanceKind = 'asset' | 'equipment';

export type InstanceRef = {
  space: string;
  externalId: string;
};

export type SelectedInstance = InstanceRef & {
  kind: InstanceKind;
};

export type SearchHit = InstanceRef & {
  kind: InstanceKind;
  name: string;
  description: string;
};

export type Identity = InstanceRef & {
  kind: InstanceKind;
  name: string;
  description: string;
  parent: (InstanceRef & { name: string }) | null;
  asset: (InstanceRef & { name: string }) | null;
  manufacturer: string;
  serialNumber: string;
};

export type RelatedTimeSeries = InstanceRef & {
  name: string;
  description: string;
  type: string;
  isStep: boolean;
  sourceUnit: string;
};

export type RelatedActivity = InstanceRef & {
  name: string;
  description: string;
  startTime: number | null;
  endTime: number | null;
};

export type RelatedFile = InstanceRef & {
  name: string;
  description: string;
  mimeType: string;
  isUploaded: boolean;
};

export type NumericDatapoint = {
  timestamp: number;
  value: number;
};

export type RelatedPage<T> = {
  items: T[];
  truncated: boolean;
};
