import { defineFreezeProperty, objectHasProperty } from '../../src/utils/utils';

// export function __proxyWin(snapshot: boolean): GlobalProxyType {
//   // 浏览器环境下  createObjectSnapshot 不兼容
//   const windowObj = snapshot ? createObjectSnapshot(global) : global;
//   // eslint-disable-next-line no-new
//   const newObj: GlobalProxyType = new Proxy(windowObj, {
//     get(target: object, key: PropertyKey) {
//       return Reflect.get(target, key);
//     },
//     // 仅当赋值给共享数据时调用
//     set: (target: object, key: PropertyKey, value: unknown) => {
//       if (snapshot) {
//         Reflect.set(target, key, value);
//         Reflect.set(global, key, value);
//       } else {
//         Reflect.set(target, key, value);
//       }
//       return true;
//     },
//   });
//   if (!objectHasProperty(newObj, isDeclearedFnName)) {
//     defineFreezeProperty(newObj, isDeclearedFnName, (key: PropertyKey) => {
//       return !objectHasProperty(newObj, key);
//     });
//   }
//   if (!objectHasProperty(newObj, 'currentWindow')) {
//     defineConfigurableProperty(newObj, 'currentWindow', newObj);
//   }

//   return newObj;
// }

export default function proxyWin() {
  const windowObj = window;
  const newObj = new Proxy(windowObj, {
    get(target: object, key: PropertyKey) {
      let getter = Reflect.get(target, key);
      if (typeof getter === 'function') {
        getter = getter.bind(target);
      }
      return getter;
    },
  });
  console.log(1);
  if (!objectHasProperty(newObj, 'currentWindow')) {
    defineFreezeProperty(newObj, 'currentWindow', newObj);
  }
  return newObj;
}
