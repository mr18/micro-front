import { GlobalProxy, GlobalProxyType, SandboxInterface } from 'sandbox';
import { defineFreezeProperty, objectHasProperty } from '../../src/utils/utils';
import proxyWin from './proxyWin';

// const windowGetterMap = new Map<PropertyKey, unknown>();
let uuid = 0;
/** Sandbox 惰性取值， 使用 window[key] 获取全局变量的值
 */

// export const sleepSandboxMap = new Map<Sandbox,>()
export class Sandbox implements SandboxInterface {
  SHARE_DATA_KEYS: Array<string> = []; // 共享键名
  sandboxId: number;
  parentSandbox: GlobalProxyType; // 当前 Sandbox 父集
  currentWindow: GlobalProxy = {}; // 所有取值复制操作都在currentWindow上进行
  snapshot: boolean;
  active: boolean;
  constructor(sandbox?: Sandbox | undefined | boolean, shareDataKeys?: Array<string>) {
    this.SHARE_DATA_KEYS = shareDataKeys || [];
    this.sandboxId = ++uuid;
    if (sandbox instanceof Sandbox) {
      this.snapshot = sandbox.snapshot;
      this.parentSandbox = sandbox as any as GlobalProxyType;
    } else {
      this.snapshot = sandbox === true;
      this.parentSandbox = proxyWin(this.snapshot);
    }
    this.setup();
  }
  setup() {
    const { proxy, declaredMap } = this.proxy(this.currentWindow, this);
    if (!objectHasProperty(this, 'isDecleared')) {
      defineFreezeProperty(this, 'isDecleared', (key: PropertyKey) => {
        return declaredMap.has(key);
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
          if (sandbox.parentSandbox.isDecleared(key)) {
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
  isDecleared(_key: PropertyKey): boolean {
    throw new Error('Method not implemented.');
  }
  isShareKey(target: Sandbox, key: unknown) {
    return target.SHARE_DATA_KEYS.includes(key as string);
  }

  // get(key: PropertyKey) {
  //   return this.currentWindow[key];
  // }
  // set(key: PropertyKey, val: unknown) {
  //   return (this.currentWindow[key] = val);
  // }
  sleep() {
    this.active = false;
  }
  weakup() {
    this.active = true;
  }
  destory() {
    // destoryEffects();
  }
}
