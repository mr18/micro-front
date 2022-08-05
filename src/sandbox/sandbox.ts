import { GlobalProxy, GlobalProxyType, SandboxInterface } from 'sandbox';
import { defineFreezeProperty, objectHasProperty } from '../../src/utils/utils';
import proxyWin from './proxyWin';

// const windowGetterMap = new Map<PropertyKey, unknown>();
let uuid = 0;
/** Sandbox 惰性取值， 使用 window[key] 获取全局变量的值
 */
export const isDeclearedFnName = `__IS_DYNAMIC_DECLEARED_VAR__`;
export const getSandBoxInstanceFnName = `__GET_SANDBOX_INSTANCE__`;

// export const sleepSandboxMap = new Map<Sandbox,>()
export class Sandbox implements SandboxInterface {
  shareScope: Array<string> = []; // 共享键名
  sandboxId: number;
  parentSandbox: GlobalProxyType; // 当前 Sandbox 父集
  currentWindow: GlobalProxy = {}; // 所有取值复制操作都在currentWindow上进行
  active: boolean;
  constructor(shareScope: Array<string> = []) {
    this.shareScope = shareScope || [];
    this.sandboxId = ++uuid;
    this.parentSandbox = proxyWin() as GlobalProxyType;
    this.setup();
  }
  setup() {
    const { proxy, declaredMap } = this.proxy(this.currentWindow, this);
    if (!objectHasProperty(this, isDeclearedFnName)) {
      defineFreezeProperty(this, isDeclearedFnName, (key: PropertyKey) => {
        return declaredMap.has(key);
      });
    }
    if (!objectHasProperty(this.currentWindow, getSandBoxInstanceFnName)) {
      defineFreezeProperty(this.currentWindow, getSandBoxInstanceFnName, () => {
        return this;
      });
    }
    this.currentWindow = proxy as GlobalProxy;
  }
  proxy(proxyObj: GlobalProxy, sandbox: Sandbox) {
    const declaredMap = new Map<PropertyKey, any>();
    const proxy = new Proxy(proxyObj, {
      get: (target: GlobalProxy, key: PropertyKey) => {
        const thisGetter = Reflect.has(target, key);

        // 共享数据，取最新值，避免取到旧值
        if (this.isShareKey(sandbox, key)) {
          const val = Reflect.get(sandbox.parentSandbox.currentWindow, key);
          // Reflect.set(target, key, val);
          return val;
        } else if (thisGetter) {
          return Reflect.get(target, key);
        } else {
          // 如果当前sandbox不存在，则向上查找
          let originGetter: any;
          if (sandbox.parentSandbox[isDeclearedFnName] && sandbox.parentSandbox[isDeclearedFnName](key)) {
            // 同时向上查找;
            let sdbx = sandbox.parentSandbox.parentSandbox;
            while (sdbx) {
              originGetter = Reflect.get(sdbx.currentWindow, key);
              sdbx = sdbx.parentSandbox as GlobalProxyType;
            }
          } else {
            originGetter = Reflect.get(sandbox.parentSandbox.currentWindow, key);
          }
          return originGetter;
        }
      },
      set: (target: GlobalProxy, key: PropertyKey, value: any) => {
        // 需要共享的数据，以 parentSandbox 为准
        if (this.isShareKey(sandbox, key)) {
          // 同时向上赋值
          let sdbx = sandbox.parentSandbox;
          while (sdbx) {
            Reflect.set(sdbx.currentWindow, key, value);
            sdbx = sdbx.parentSandbox as GlobalProxyType;
          }
          // 防止被删除时，无法共享数据
          Reflect.set(target, key, value);
        } else {
          Reflect.set(target, key, value);
        }
        declaredMap.set(key, value);

        return true;
      },
      defineProperty: (target: GlobalProxy, key: PropertyKey, value: PropertyDescriptor) => {
        Reflect.defineProperty(target, key, value);
        declaredMap.set(key, value);
        return true;
      },
      deleteProperty: (target: GlobalProxy, key: PropertyKey) => {
        Reflect.deleteProperty(target, key);
        declaredMap.delete(key);
        return true;
      },
    });
    return {
      proxy,
      declaredMap,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [isDeclearedFnName](_key: PropertyKey): boolean {
    throw new Error('Method not implemented.');
  }
  isShareKey(target: Sandbox, key: unknown) {
    return target.shareScope.includes(key as string);
  }

  sleep() {
    throw new Error('must be overwrite');
  }
  weakup() {
    throw new Error('must be overwrite');
  }
  destory() {
    throw new Error('must be overwrite');
  }
}
