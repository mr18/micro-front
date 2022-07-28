import { defineFreezeProperty, objectHasProperty } from '../../src/utils/utils';
import { globalType, SandboxInterface } from '../../typings/sandbox';
import Logger from '../utils/logger';
import ProxyWin from './proxyWin';

// const windowGetterMap = new Map<PropertyKey, unknown>();
let uuid = 1;
/** Sandbox 惰性取值， 使用 window[key] 获取全局变量的值
 */
export class Sandbox implements SandboxInterface<globalType> {
  SHARE_DATA_KEYS: Array<string> = [];
  sandboxId: number;
  parentWindow: globalType | ProxyWin;
  currentWindow: globalType = {};
  constructor(sandbox: globalType = global, shareDataKeys?: Array<string>) {
    this.SHARE_DATA_KEYS = shareDataKeys || [];
    this.sandboxId = ++uuid;
    this.parentWindow = sandbox === global ? new ProxyWin(sandbox) : sandbox;
    this.setup();
  }
  setup() {
    const { proxy, declaredMap } = this.proxy(this.currentWindow, this);
    if (!objectHasProperty(this.parentWindow, 'isDecleared')) {
      defineFreezeProperty(this.parentWindow, 'isDecleared', (key: PropertyKey) => {
        return declaredMap.has(key);
      });
    }
    this.currentWindow = proxy;
  }
  proxy(proxyObj: globalType, sandbox: globalType) {
    const declaredMap = new Map<PropertyKey, unknown>();
    const proxy = new Proxy(proxyObj, {
      get: (target: object, key: PropertyKey) => {
        const thisGetter = Reflect.has(target, key);
        // 如果当前sandbox不存在，则向上查找
        if (this.isShareKey(sandbox, key)) {
          const val = Reflect.get(sandbox.parentWindow, key);
          Reflect.set(target, key, val);
          return val;
        } else if (!thisGetter && !sandbox.parentWindow.isDecleared(key)) {
          const originGetter = Reflect.get(sandbox.parentWindow, key);
          Reflect.set(target, key, originGetter);
          return originGetter;
        } else {
          return Reflect.get(target, key);
        }
      },
      set: (target: object, key: PropertyKey, value: unknown) => {
        // 需要共享的数据，以 parentWindow 为准
        if (this.isShareKey(sandbox, key)) {
          let _sandbox = sandbox.parentWindow;
          while (_sandbox) {
            Reflect.set(_sandbox, key, value);
            _sandbox = _sandbox.parentWindow;
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
  isShareKey(target: globalType, key: unknown) {
    return target.SHARE_DATA_KEYS.includes(key as string);
  }

  sleep() {
    Logger.log('sleep');
  }
  weakup() {
    Logger.log('weakup');
  }
  destory() {
    Logger.log('destory');
  }
}
