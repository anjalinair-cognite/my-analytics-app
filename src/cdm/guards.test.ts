import { describe, expect, it } from 'vitest';

import {
  isInstanceRef,
  isRecord,
  readBoolean,
  readDirectRelation,
  readDirectRelationList,
  readInstanceIdentity,
  readNumber,
  readString,
  readViewProperties,
} from './guards';
import { COGNITE_ASSET_VIEW } from './views';

describe('CDM guards', () => {
  it('reads view properties from a typed instance payload', () => {
    const instance = {
      space: 'plant',
      externalId: 'pump-101',
      properties: {
        cdf_cdm: {
          'CogniteAsset/v1': {
            name: 'PUMP-101',
            description: 'Feed pump',
          },
        },
      },
    };

    expect(readInstanceIdentity(instance)).toEqual({ space: 'plant', externalId: 'pump-101' });
    expect(readViewProperties(instance, COGNITE_ASSET_VIEW)).toEqual({
      name: 'PUMP-101',
      description: 'Feed pump',
    });
  });

  it('returns empty properties and null identity for invalid payloads', () => {
    expect(isRecord(null)).toBe(false);
    expect(isInstanceRef({})).toBe(false);
    expect(readInstanceIdentity({})).toBeNull();
    expect(readViewProperties({}, COGNITE_ASSET_VIEW)).toEqual({});
    expect(readString(1)).toBe('');
    expect(readBoolean('true')).toBe(false);
    expect(readNumber(Number.NaN)).toBeNull();
    expect(readDirectRelation('x')).toBeNull();
    expect(readDirectRelationList([{ space: 'a' }])).toEqual([]);
  });
});
