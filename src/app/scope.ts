import { ScopeInterface } from 'sandbox';
import { NodeTypeOptions, SandboxNode } from 'src/sandbox/sandboxNode';
import { fetchSource, parseSource, scheduleTask } from './patch';
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
  url: string;
  promise?: Promise<any>;
  defer?: boolean;
  async?: boolean;
  module?: boolean;
  nomodule?: boolean;
  code?: string;
  fileName?: string;
};
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

  pitchSource(url: string) {
    if (/http(s?):/.test(url)) {
      return fetchSource(url);
    }
    return parseSource(url);
  }

  addScript(src: string, info: ScriptSourceType) {
    const task = fetchSource(info.url);
    info.promise = task;
    this.scriptsMap.set(src, info);
    if (info.defer) {
      this.deferTask.add(info);
    } else {
      this.asyncTask.add(info);
    }
  }
  addStyle(src: string, info: StyleSourceType) {
    const task = fetchSource(info.url);
    info.promise = task;
    this.stylesMap.set(src, info);
    this.styleTask.add(info);
  }

  async resolveScource() {
    const iterator = this.deferTask[Symbol.iterator]();
    console.log(0);
    scheduleTask(this.resolveStyles.bind(this));
    await this.runDeferScript(iterator);
    this.runAsyncScript();
  }
  async runDeferScript(iterator: IterableIterator<ScriptSourceType>) {
    const queue: ScriptSourceType[] = [];
    return new Promise((resolve) => {
      const runTask = (iterator: IterableIterator<ScriptSourceType>) => {
        const task = iterator.next();
        if (!task.done) {
          task.value.promise.then((code: string) => {
            task.value.code = code;
            queue.push(task.value);
            if (!task.done) {
              runTask(iterator);
            } else {
              this.execScriptUseStrict(queue);
            }
          });
        } else {
          this.execScriptUseStrict(queue);
        }
      };
      runTask(iterator);
    });
  }

  async runAsyncScript() {
    for (const task of this.asyncTask) {
      task.promise.then((code: string) => {
        task.code = code;
        this.execScriptUseStrict([task]);
      });
    }
  }
  resolveStyles() {
    for (const task of this.styleTask) {
      task.promise.then((code: string) => {
        console.log(code);
        if (task.ele) {
          task.ele.textContent = code;
        } else {
          task.code = code;
        }
      });
    }
  }
  execScriptUseStrict(queue: ScriptSourceType[]) {
    const scriptInfo = queue.shift();
    if (!scriptInfo) return;
    let code = `;(function f(window,self,golbal){;${scriptInfo.code};\n}).bind(this,this,this,this)();`;
    console.log(scriptInfo.fileName);
    if (scriptInfo.fileName) {
      code += `\n//# sourceMappingURL=${scriptInfo.fileName}.map`;
    }
    const fn = new Function(code);

    const win = this.currentWindow;
    fn.call(win);

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
