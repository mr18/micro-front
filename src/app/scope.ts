import { ScopeInterface, ScopeOptions, ScriptSourceType, StyleSourceType } from 'sandbox';
import { cssScope } from '../parser/css';
import { Sandbox } from '../sandbox';
import Logger from '../utils/logger';
import { Application } from './app';
import { fetchSource, scheduleAsyncAsParallel, scheduleAsyncAsSync, scheduleTask } from './patch';

export class Scope extends Sandbox implements ScopeInterface {
  scriptsMap = new Map<string, StyleSourceType>();
  stylesMap = new Map<string, StyleSourceType>();
  keepalive = false;
  deferTask = new Set<ScriptSourceType>();
  asyncTask = new Set<ScriptSourceType>();
  styleTask = new Set<StyleSourceType>();
  resolvedMap = new Map<string, any>();
  appInstance: Application;
  constructor(options: ScopeOptions) {
    super(options.shareScope);
    this.keepalive = !!options.keepalive;
  }

  addScript(src: string, info: ScriptSourceType, isDynamic = false) {
    const sourceInfo = this.scriptsMap.get(src);
    if (sourceInfo) {
      if (isDynamic) {
        scheduleTask(this.runAsyncScript.bind(this, [sourceInfo]));
      } else {
        if (sourceInfo.defer) {
          this.deferTask.add(sourceInfo);
        } else {
          this.asyncTask.add(sourceInfo);
        }
      }
    } else {
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
  }
  addStyle(src: string, info: StyleSourceType) {
    const sourceInfo = this.stylesMap.get(src);
    if (sourceInfo) {
      this.styleTask.add(sourceInfo);
    } else {
      if (info.result) {
        info.promise = new Promise((resolve) => {
          resolve(info.result);
        });
      } else {
        const task = fetchSource(info.url);
        info.promise = task;
      }
      this.stylesMap.set(src, info);
      this.styleTask.add(info);
    }
  }
  // 资源加载完成后，取出对应的script or style，放到dom中 or 在当前Scope下执行
  async resolveScource() {
    // 优先加载样式，避免出现无样式的情况
    scheduleTask(this.resolveStyles.bind(this));
    // 同步执行script
    const queue: ScriptSourceType[] = await scheduleAsyncAsSync<ScriptSourceType>({ iterator: this.deferTask });
    // this.deferTask.clear();
    this.execScriptUseStrict(queue);
    // 异步执行script
    this.runAsyncScript();
  }

  async runAsyncScript(iteratorLisk?: ScriptSourceType[] | Set<ScriptSourceType>) {
    await scheduleAsyncAsParallel<ScriptSourceType>({
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
    Logger.log('scripts is execute compeleted');
  }
  async resolveStyles() {
    await scheduleAsyncAsParallel<StyleSourceType>({
      iterator: this.styleTask,
      afterResolve: (task) => {
        if (task.ele && task.result) {
          const content = cssScope(task.result, this.appInstance.cssSelectorScope, this.appInstance.location);
          task.ele.textContent = content;
        }
      },
    });
    this.styleTask.clear();
    Logger.log('styles is parsed compeleted');
  }

  execScriptUseStrict(queue: ScriptSourceType[]) {
    const scriptInfo = queue.shift();

    if (!scriptInfo || this.resolvedMap.has(scriptInfo.url)) return;

    let code = `(function f(window,self,global){${scriptInfo.result || ''};\n}).call(this,this,this,this);`;
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
  resetSourceTask() {
    this.asyncTask.clear();
    this.deferTask.clear();
    this.styleTask.clear();
    this.resolvedMap.clear();
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
