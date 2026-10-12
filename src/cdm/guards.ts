import type { CdmViewRef } from './views';
import { viewPropertyIdentifier } from './views';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isInstanceRef(value: unknown): value is { space: string; externalId: string } {
  return isRecord(value) && typeof value.space === 'string' && typeof value.externalId === 'string';
}

export function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function readBoolean(value: unknown): boolean {
  return value === true;
}

export function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function readDirectRelation(value: unknown): { space: string; externalId: string } | null {
  return isInstanceRef(value) ? { space: value.space, externalId: value.externalId } : null;
}

export function readDirectRelationList(value: unknown): Array<{ space: string; externalId: string }> {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    const relation = readDirectRelation(item);
    return relation ? [relation] : [];
  });
}

export function readViewProperties(instance: unknown, view: CdmViewRef): Record<string, unknown> {
  if (!isRecord(instance)) {
    return {};
  }
  const properties = instance.properties;
  if (!isRecord(properties)) {
    return {};
  }
  const spaceProps = properties[view.space];
  if (!isRecord(spaceProps)) {
    return {};
  }
  const viewProps = spaceProps[viewPropertyIdentifier(view)];
  return isRecord(viewProps) ? viewProps : {};
}

export function readInstanceIdentity(instance: unknown): { space: string; externalId: string } | null {
  if (!isRecord(instance)) {
    return null;
  }
  if (typeof instance.space !== 'string' || typeof instance.externalId !== 'string') {
    return null;
  }
  return { space: instance.space, externalId: instance.externalId };
}
