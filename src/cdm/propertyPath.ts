import type { CdmViewRef } from './views';
import { viewPropertyIdentifier } from './views';

export function viewPropertyPath(view: CdmViewRef, property: string): [string, string, string] {
  return [view.space, viewPropertyIdentifier(view), property];
}
