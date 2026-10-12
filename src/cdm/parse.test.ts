import { describe, expect, it } from 'vitest';

import {
  isNumericTimeSeries,
  parseActivity,
  parseFile,
  parseIdentity,
  parseSearchHit,
  parseTimeSeries,
  readParentOrAssetRelation,
} from './parse';
import { COGNITE_ASSET_VIEW, COGNITE_EQUIPMENT_VIEW, viewPropertyIdentifier } from './views';

function assetInstance() {
  return {
    space: 'plant',
    externalId: 'loc-1',
    properties: {
      cdf_cdm: {
        [viewPropertyIdentifier(COGNITE_ASSET_VIEW)]: {
          name: 'Area 12',
          description: 'Process area',
          parent: { space: 'plant', externalId: 'root' },
        },
      },
    },
  };
}

describe('CDM parsers', () => {
  it('parses a search hit with a name fallback', () => {
    expect(parseSearchHit({ space: 'plant', externalId: 'x', properties: {} }, 'asset')).toEqual({
      space: 'plant',
      externalId: 'x',
      kind: 'asset',
      name: 'x',
      description: '',
    });
  });

  it('parses identity with a parent asset', () => {
    const identity = parseIdentity(assetInstance(), 'asset', {
      space: 'plant',
      externalId: 'root',
      properties: {
        cdf_cdm: {
          [viewPropertyIdentifier(COGNITE_ASSET_VIEW)]: { name: 'Plant root' },
        },
      },
    });

    expect(identity?.parent).toEqual({ space: 'plant', externalId: 'root', name: 'Plant root' });
    expect(identity?.asset).toBeNull();
  });

  it('treats non-string time series as numeric', () => {
    const series = parseTimeSeries({
      space: 'plant',
      externalId: 'ts-1',
      properties: {
        cdf_cdm: {
          'CogniteTimeSeries/v1': { name: 'Flow', type: 'numeric', isStep: false },
        },
      },
    });
    expect(series && isNumericTimeSeries(series)).toBe(true);
  });

  it('returns null when identity fields are missing', () => {
    expect(parseSearchHit(null, 'asset')).toBeNull();
    expect(parseIdentity({}, 'asset', null)).toBeNull();
    expect(parseTimeSeries({})).toBeNull();
    expect(parseActivity(null)).toBeNull();
    expect(parseFile(undefined)).toBeNull();
  });

  it('parses activity, file, and equipment identity', () => {
    expect(
      parseActivity({
        space: 'plant',
        externalId: 'wo-1',
        properties: {
          cdf_cdm: { 'CogniteActivity/v1': { name: 'Inspect', startTime: 10, endTime: 20 } },
        },
      })
    ).toEqual({
      space: 'plant',
      externalId: 'wo-1',
      name: 'Inspect',
      description: '',
      startTime: 10,
      endTime: 20,
    });

    expect(
      parseFile({
        space: 'plant',
        externalId: 'pid-1',
        properties: {
          cdf_cdm: { 'CogniteFile/v1': { name: 'P&ID', mimeType: 'application/pdf', isUploaded: true } },
        },
      })
    ).toEqual({
      space: 'plant',
      externalId: 'pid-1',
      name: 'P&ID',
      description: '',
      mimeType: 'application/pdf',
      isUploaded: true,
    });

    const equipment = parseIdentity(
      {
        space: 'plant',
        externalId: 'pump-101',
        properties: {
          cdf_cdm: {
            [viewPropertyIdentifier(COGNITE_EQUIPMENT_VIEW)]: {
              name: 'PUMP-101',
              manufacturer: 'Acme',
              serialNumber: 'SN-1',
            },
          },
        },
      },
      'equipment',
      { space: 'plant', externalId: 'loc-1', properties: { cdf_cdm: { 'CogniteAsset/v1': { name: 'Area' } } } }
    );
    expect(equipment?.asset).toEqual({ space: 'plant', externalId: 'loc-1', name: 'Area' });
    expect(equipment?.parent).toBeNull();
  });

  it('reads parent or asset relations', () => {
    expect(readParentOrAssetRelation(assetInstance(), 'asset')).toEqual({
      space: 'plant',
      externalId: 'root',
    });
    expect(
      readParentOrAssetRelation(
        {
          space: 'plant',
          externalId: 'pump-101',
          properties: {
            cdf_cdm: {
              [viewPropertyIdentifier(COGNITE_EQUIPMENT_VIEW)]: {
                asset: { space: 'plant', externalId: 'loc-1' },
              },
            },
          },
        },
        'equipment'
      )
    ).toEqual({ space: 'plant', externalId: 'loc-1' });
  });

  it('treats string time series as non-numeric', () => {
    const series = parseTimeSeries({
      space: 'plant',
      externalId: 'ts-s',
      properties: { cdf_cdm: { 'CogniteTimeSeries/v1': { type: 'string' } } },
    });
    expect(series && isNumericTimeSeries(series)).toBe(false);
  });
});
