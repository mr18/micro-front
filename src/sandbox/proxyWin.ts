import { GlobalProxyType } from 'sandbox';
import { createObjectSnapshot, defineFreezeProperty, objectHasProperty } from '../../src/utils/utils';

export default function proxyWin(snapshot: boolean): GlobalProxyType {
  const declaredMap = new Map<PropertyKey, unknown>();
  const windowObj = snapshot ? createObjectSnapshot(global) : global;

  // eslint-disable-next-line no-new
  const newObj: GlobalProxyType = new Proxy(windowObj, {
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
  if (!objectHasProperty(windowObj, 'currentWindow')) {
    defineFreezeProperty(windowObj, 'currentWindow', global);
  }
  return windowObj;
}
