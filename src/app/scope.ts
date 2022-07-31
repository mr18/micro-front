import { ScopeInterface } from 'sandbox';
import { NodeTypeOptions, SandboxNode } from 'src/sandbox/sandboxNode';
import { fetchSource, scheduleTask } from './patch';
export type ScopeOptions = {
  keepalive?: boolean | undefined;
} & NodeTypeOptions;

export type StyleSourceType = {
  url: string;
  promise?: Promise<any>;
  code?: string;
  ele?: HTMLElement;
  fileName?: string;
};
export type ScriptSourceType = {
  defer?: boolean;
  async?: boolean;
  module?: boolean;
  nomodule?: boolean;
  code?: string;
  onload?: Function;
  onerror?: Function;
} & StyleSourceType;

export class Scope extends SandboxNode implements ScopeInterface {
  scriptsMap = new Map<string, StyleSourceType>();
  stylesMap = new Map<string, StyleSourceType>();
  keepalive: boolean | undefined;
  deferTask = new Set<ScriptSourceType>();
  asyncTask = new Set<ScriptSourceType>();
  styleTask = new Set<StyleSourceType>();
  constructor(name: string, options: ScopeOptions) {
    super(name, options);
    this.keepalive = options.keepalive;
  }

  addScript(src: string, info: ScriptSourceType, isDynamic: boolean = false) {
    const task = fetchSource(info.url);
    info.promise = task;
    this.scriptsMap.set(src, info);
    if (info.defer) {
      this.deferTask.add(info);
    } else {
      this.asyncTask.add(info);
    }
    if (isDynamic) {
      scheduleTask(this.resolveScriptSource.bind(this));
    }
  }
  addStyle(src: string, info: StyleSourceType) {
    const task = fetchSource(info.url);
    info.promise = task;
    this.stylesMap.set(src, info);
    this.styleTask.add(info);
  }
  // 取出对应的资源，放到dom中 or 在当前Scope下执行
  async resolveScource() {
    scheduleTask(this.resolveStyles.bind(this));
    await this.resolveScriptSource();
  }
  async resolveScriptSource() {
    await this.runDeferScript();
    this.runAsyncScript();
  }
  // 同步执行script
  async runDeferScript() {
    const iterator: IterableIterator<ScriptSourceType> = this.deferTask[Symbol.iterator]();
    const queue: ScriptSourceType[] = [];
    return new Promise((resolve: any, reject: any) => {
      const runTask = (iterator: IterableIterator<ScriptSourceType>) => {
        const task = iterator.next();
        if (!task.done) {
          task.value.promise
            .then((code: string) => {
              task.value.code = code;
              queue.push(task.value);
              if (!task.done) {
                runTask(iterator);
              } else {
                resolve(queue);
              }
            })
            .catch((e) => {
              if (typeof task.value.onerror === 'function') {
                task.value.onerror();
              }
              console.error(e);
              reject();
            });
        } else {
          resolve(queue);
        }
      };
      runTask(iterator);
    }).then((queue: ScriptSourceType[]) => {
      this.execScriptUseStrict(queue);
    });
  }
  // 异步执行script
  async runAsyncScript() {
    for (const task of this.asyncTask) {
      task.promise
        .then((code: string) => {
          task.code = code;
          this.execScriptUseStrict([task]);
        })
        .catch((e) => {
          if (typeof task.onerror === 'function') {
            task.onerror();
          }
          console.error('script load failed!');
        });
    }
  }
  resolveStyles() {
    for (const task of this.styleTask) {
      task.promise
        .then((code: string) => {
          if (task.ele) {
            task.ele.textContent = code;
          } else {
            task.code = code;
          }
        })
        .catch((e) => {
          console.error('stylesheet link load failed!');
        });
    }
  }

  execScriptUseStrict(queue: ScriptSourceType[]) {
    const scriptInfo = queue.shift();
    if (!scriptInfo) return;
    let code = `"use strict";(function f(window,self,global){;${scriptInfo.code};\n}).call(this,this,this,this);`;
    if (scriptInfo.fileName) {
      // code += '\n//# sourceMappingURL=' + scriptInfo.fileName + '.map \n';
    }
    try {
      const fn = new Function(code);
      // console.log(fn.toString());
      fn.call(this.currentWindow);
      if (typeof scriptInfo.onload === 'function') {
        scriptInfo.onload();
        console.log('script exclude finish!');
      }
    } catch (e) {
      if (typeof scriptInfo.onerror === 'function') {
        scriptInfo.onerror();
      }
      // console.error(e);
      throw Error(e);
    }

    while (queue.length) {
      this.execScriptUseStrict(queue);
    }
  }

  sleep() {
    console.log('sleep');
  }

  destory() {
    console.log('destory');
  }

  weakup() {
    console.log('destory');
  }
}
