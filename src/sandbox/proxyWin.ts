import { globalType } from 'typings/sandbox';
import { createNewObject, defineFreezeProperty, objectHasProperty } from '../../src/utils/utils';

export type proxyType = object & { isDecleared?: (key: PropertyKey) => boolean };

export default class ProxyWin {
  constructor(obj: proxyType) {
    const declaredMap = new Map<PropertyKey, unknown>();
    const windowObj: globalType = createNewObject(obj);

    // eslint-disable-next-line no-new
    const newObj: proxyType = new Proxy(obj, {
      set: (target: object, key: PropertyKey, value: unknown) => {
        Reflect.set(target, key, value);
        declaredMap.set(key, value || true);
        return true;
      },
    });
    if (!objectHasProperty(newObj, 'isDecleared')) {
      defineFreezeProperty(newObj, 'isDecleared', (key: PropertyKey) => {
        return !objectHasProperty(windowObj, key) || declaredMap.has(key);
      });
    }

    return obj;
  }
}
