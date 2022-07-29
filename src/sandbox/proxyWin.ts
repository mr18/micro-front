import { GlobalProxyType } from 'sandbox';
import { createObjectSnapshot, defineFreezeProperty, objectHasProperty } from '../../src/utils/utils';

export default function proxyWin(snapshot: boolean): GlobalProxyType {
  const windowObj = snapshot ? createObjectSnapshot(global) : global;
  // eslint-disable-next-line no-new
  const newObj: GlobalProxyType = new Proxy(windowObj, {
    // 仅当赋值给共享数据时调用
    set: (target: object, key: PropertyKey, value: unknown) => {
      if (snapshot) {
        Reflect.set(target, key, value);
        Reflect.set(global, key, value);
      } else {
        Reflect.set(target, key, value);
      }
      return true;
    },
  });
  if (!objectHasProperty(newObj, 'isDecleared')) {
    defineFreezeProperty(newObj, 'isDecleared', (key: PropertyKey) => {
      return !objectHasProperty(newObj, key);
    });
  }
  if (!objectHasProperty(newObj, 'currentWindow')) {
    defineFreezeProperty(newObj, 'currentWindow', newObj);
  }
  return newObj;
}
