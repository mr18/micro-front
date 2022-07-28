import { GlobalProxy, GlobalProxyType, SandboxInterface } from 'sandbox';
import { defineFreezeProperty, objectHasProperty } from '../../src/utils/utils';
import proxyWin from './proxyWin';

// const windowGetterMap = new Map<PropertyKey, unknown>();
let uuid = 1;
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
      this.parentSandbox = sandbox as unknown as GlobalProxyType;
    } else {
      this.snapshot = sandbox === true;
      this.parentSandbox = proxyWin(this.snapshot);
    }
    this.setup();
  }
  setup() {
    const { proxy, declaredMap } = this.proxy(this.currentWindow, this);
    if (!objectHasProperty(this.parentSandbox, 'isDecleared')) {
      defineFreezeProperty(this.parentSandbox, 'isDecleared', (key: PropertyKey) => {
        return declaredMap.has(key);
      });
    }
    this.currentWindow = proxy as GlobalProxy;
  }
  proxy(proxyObj: GlobalProxy, sandbox: Sandbox) {
    const declaredMap = new Map<PropertyKey, unknown>();
    const proxy = new Proxy(proxyObj, {
      get: (target: GlobalProxy, key: PropertyKey) => {
        const thisGetter = Reflect.has(target, key);
        // 如果当前sandbox不存在，则向上查找
        if (this.isShareKey(sandbox, key)) {
          const val = Reflect.get(sandbox.parentSandbox.currentWindow, key);
          Reflect.set(target, key, val);
          return val;
        } else if (!thisGetter && !sandbox.parentSandbox.isDecleared(key)) {
          const originGetter = Reflect.get(sandbox.parentSandbox.currentWindow, key);
          Reflect.set(target, key, originGetter);
          return originGetter;
        } else {
          return Reflect.get(target, key);
        }
      },
      set: (target: GlobalProxy, key: PropertyKey, value: unknown) => {
        // 需要共享的数据，以 parentSandbox 为准
        if (this.isShareKey(sandbox, key)) {
          let _sdbx = sandbox.parentSandbox;
          while (_sdbx) {
            Reflect.set(_sdbx.currentWindow, key, value);
            _sdbx = _sdbx.parentSandbox as GlobalProxyType;
          }
          // 防止被删除时，无法共享数据
          Reflect.set(target, key, value);
        } else {
          Reflect.set(target, key, value);
        }
        declaredMap.set(key, value);
        return true;
      },
    });
    return {
      proxy,
      declaredMap,
    };
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
