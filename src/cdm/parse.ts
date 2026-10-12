import {
  readBoolean,
  readDirectRelation,
  readInstanceIdentity,
  readNumber,
  readString,
  readViewProperties,
} from './guards';
import type {
  Identity,
  InstanceKind,
  InstanceRef,
  RelatedActivity,
  RelatedFile,
  RelatedTimeSeries,
  SearchHit,
} from './types';
import {
  COGNITE_ACTIVITY_VIEW,
  COGNITE_ASSET_VIEW,
  COGNITE_EQUIPMENT_VIEW,
  COGNITE_FILE_VIEW,
  COGNITE_TIME_SERIES_VIEW,
  type CdmViewRef,
} from './views';

export function parseSearchHit(instance: unknown, kind: InstanceKind): SearchHit | null {
  const identity = readInstanceIdentity(instance);
  if (!identity) {
    return null;
  }
  const view = kind === 'asset' ? COGNITE_ASSET_VIEW : COGNITE_EQUIPMENT_VIEW;
  const properties = readViewProperties(instance, view);
  return {
    ...identity,
    kind,
    name: readString(properties.name) || identity.externalId,
    description: readString(properties.description),
  };
}

export function parseNamedRef(instance: unknown, view: CdmViewRef): (InstanceRef & { name: string }) | null {
  const identity = readInstanceIdentity(instance);
  if (!identity) {
    return null;
  }
  const properties = readViewProperties(instance, view);
  return {
    ...identity,
    name: readString(properties.name) || identity.externalId,
  };
}

export function parseIdentity(
  instance: unknown,
  kind: InstanceKind,
  related: unknown | null
): Identity | null {
  const identity = readInstanceIdentity(instance);
  if (!identity) {
    return null;
  }
  const view = kind === 'asset' ? COGNITE_ASSET_VIEW : COGNITE_EQUIPMENT_VIEW;
  const properties = readViewProperties(instance, view);
  const relatedRef = related === null ? null : parseNamedRef(related, COGNITE_ASSET_VIEW);

  return {
    ...identity,
    kind,
    name: readString(properties.name) || identity.externalId,
    description: readString(properties.description),
    parent: kind === 'asset' ? relatedRef : null,
    asset: kind === 'equipment' ? relatedRef : null,
    manufacturer: readString(properties.manufacturer),
    serialNumber: readString(properties.serialNumber),
  };
}

export function parseTimeSeries(instance: unknown): RelatedTimeSeries | null {
  const identity = readInstanceIdentity(instance);
  if (!identity) {
    return null;
  }
  const properties = readViewProperties(instance, COGNITE_TIME_SERIES_VIEW);
  return {
    ...identity,
    name: readString(properties.name) || identity.externalId,
    description: readString(properties.description),
    type: readString(properties.type),
    isStep: readBoolean(properties.isStep),
    sourceUnit: readString(properties.sourceUnit),
  };
}

export function parseActivity(instance: unknown): RelatedActivity | null {
  const identity = readInstanceIdentity(instance);
  if (!identity) {
    return null;
  }
  const properties = readViewProperties(instance, COGNITE_ACTIVITY_VIEW);
  return {
    ...identity,
    name: readString(properties.name) || identity.externalId,
    description: readString(properties.description),
    startTime: readNumber(properties.startTime),
    endTime: readNumber(properties.endTime),
  };
}

export function parseFile(instance: unknown): RelatedFile | null {
  const identity = readInstanceIdentity(instance);
  if (!identity) {
    return null;
  }
  const properties = readViewProperties(instance, COGNITE_FILE_VIEW);
  return {
    ...identity,
    name: readString(properties.name) || identity.externalId,
    description: readString(properties.description),
    mimeType: readString(properties.mimeType),
    isUploaded: readBoolean(properties.isUploaded),
  };
}

export function instanceKey(ref: InstanceRef): string {
  return `${ref.space}:${ref.externalId}`;
}

export function isNumericTimeSeries(series: RelatedTimeSeries): boolean {
  return series.type !== 'string';
}

export function readParentOrAssetRelation(
  instance: unknown,
  kind: InstanceKind
): InstanceRef | null {
  const view = kind === 'asset' ? COGNITE_ASSET_VIEW : COGNITE_EQUIPMENT_VIEW;
  const property = kind === 'asset' ? 'parent' : 'asset';
  return readDirectRelation(readViewProperties(instance, view)[property]);
}
