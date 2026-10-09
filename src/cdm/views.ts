export const CDM_SPACE = 'cdf_cdm';
export const CDM_VERSION = 'v1';

export type CdmViewRef = {
  type: 'view';
  space: typeof CDM_SPACE;
  externalId: string;
  version: typeof CDM_VERSION;
};

function cdmView(externalId: string): CdmViewRef {
  return {
    type: 'view',
    space: CDM_SPACE,
    externalId,
    version: CDM_VERSION,
  };
}

export const COGNITE_ASSET_VIEW = cdmView('CogniteAsset');
export const COGNITE_EQUIPMENT_VIEW = cdmView('CogniteEquipment');
export const COGNITE_TIME_SERIES_VIEW = cdmView('CogniteTimeSeries');
export const COGNITE_FILE_VIEW = cdmView('CogniteFile');
export const COGNITE_ACTIVITY_VIEW = cdmView('CogniteActivity');

export function viewPropertyIdentifier(view: CdmViewRef): string {
  return `${view.externalId}/${view.version}`;
}
