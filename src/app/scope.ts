import { ScopeInterface } from 'sandbox';
import { NodeTypeOptions, SandboxNode } from 'src/sandbox/sandboxNode';
import Logger from 'src/utils/logger';
import { fetchSource, scheduleAsyncAsParallel, scheduleAsyncAsSync, scheduleTask } from './patch';
export type ScopeOptions = {
  keepalive?: boolean | undefined;
} & NodeTypeOptions;

export type StyleSourceType = {
  url: string;
  promise?: Promise<any>;
  result?: string;
  ele?: HTMLElement;
  fileName?: string;
};
export type ScriptSourceType = {
  defer?: boolean;
  async?: boolean;
  module?: boolean;
  nomodule?: boolean;
  onload?: (e: any) => void;
  onerror?: (e: any) => void;
} & StyleSourceType;

export class Scope extends SandboxNode implements ScopeInterface {
  scriptsMap = new Map<string, StyleSourceType>();
  stylesMap = new Map<string, StyleSourceType>();
  keepalive: boolean | undefined;
  deferTask = new Set<ScriptSourceType>();
  asyncTask = new Set<ScriptSourceType>();
  styleTask = new Set<StyleSourceType>();
  resolvedMap = new Map<string, any>();
  constructor(name: string, options: ScopeOptions) {
    super(name, options);
    this.keepalive = options.keepalive;
  }

  addScript(src: string, info: ScriptSourceType, isDynamic = false) {
    if (info.result) {
      info.promise = new Promise((resolve) => {
        resolve(info.result);
      });
    } else {
      const task = fetchSource(info.url);
      info.promise = task;
    }

    this.scriptsMap.set(src, info);
    if (isDynamic) {
      scheduleTask(this.runAsyncScript.bind(this, [info]));
    } else {
      if (info.defer) {
        this.deferTask.add(info);
      } else {
        this.asyncTask.add(info);
      }
    }
  }
  addStyle(src: string, info: StyleSourceType) {
    const task = fetchSource(info.url);
    info.promise = task;
    this.stylesMap.set(src, info);
    this.styleTask.add(info);
  }
  // 资源加载完成后，取出对应的script or style，放到dom中 or 在当前Scope下执行
  async resolveScource() {
    scheduleTask(this.resolveStyles.bind(this));
    // 同步执行script
    const queue: ScriptSourceType[] = await scheduleAsyncAsSync<ScriptSourceType, string>({ iterator: this.deferTask });
    // this.deferTask.clear();
    this.execScriptUseStrict(queue);
    // 异步执行script
    this.runAsyncScript();
  }

  async runAsyncScript(iteratorLisk?: ScriptSourceType[] | Set<ScriptSourceType>) {
    scheduleAsyncAsParallel({
      iterator: iteratorLisk || this.asyncTask,
      afterResolve: (task) => {
        this.execScriptUseStrict([task]);
      },
      afterReject: (task) => {
        if (typeof task.onerror === 'function') {
          const event = { target: { type: 'error', src: task.url } };
          task.onerror(event);
        }
        console.error('script load failed!');
      },
    });
    this.asyncTask.clear();
  }
  resolveStyles() {
    scheduleAsyncAsParallel({
      iterator: this.styleTask,
      afterResolve: (task) => {
        task.ele.textContent = task.result;
      },
    });
    this.styleTask.clear();
  }

  execScriptUseStrict(queue: ScriptSourceType[]) {
    const scriptInfo = queue.shift();

    if (!scriptInfo || this.resolvedMap.has(scriptInfo.url)) return;

    let code = `(function f(window,self){${scriptInfo.result};\n}).call(this,this,this,this);`;
    if (scriptInfo.fileName) {
      code += '\n//# sourceMappingURL=' + scriptInfo.fileName + '.map \n';
    }
    try {
      const fn = new Function(code);
      // console.log(fn.toString());
      const result = fn.call(this.currentWindow);
      if (typeof scriptInfo.onload === 'function') {
        const event = { target: { type: 'load', src: scriptInfo.url } };
        scriptInfo.onload(event);
      }
      Logger.log(`script ${scriptInfo.url} execute finish!`);
      this.resolvedMap.set(scriptInfo.url, result);
    } catch (e) {
      if (typeof scriptInfo.onerror === 'function') {
        const event = { target: { type: 'error', src: scriptInfo.url } };
        scriptInfo.onerror(event);
      }
      this.resolvedMap.set(scriptInfo.url, e);
      console.error(e);
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
