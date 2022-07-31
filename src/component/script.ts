/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from 'src/app';
import { Scope, ScriptSourceType } from 'src/app/scope';
import Logger from '../utils/logger';

const MicroScriptName = 'micro-script';
export const defineSciprtElement = (scope: Scope, instance: Application) => {
  const win = scope.node.currentWindow;
  class ScriptElement extends HTMLScriptElement {
    url: string;
    constructor() {
      super();
      Object.defineProperty(this, 'src', {
        get() {
          return;
        },
        set: (value: string) => {
          this.url = value;
          return true;
        },
      });
    }

    // 当 custom element 首次被插入文档 DOM 时，被调用。
    connectedCallback() {
      const noModule = this.noModule !== null;
      const scriptInfo: ScriptSourceType = {
        url: instance.resolvePath(this.url),
        defer: this.defer !== null,
        async: this.async !== null,
        module: !noModule,
        nomodule: noModule,
        onload: this.onload && this.onload.bind(null),
        onerror: this.onerror && this.onerror.bind(null),
      };
      scope.addScript(this.url, scriptInfo, true);
      Logger.log('script插入');
      // this.remove();
    }
    // 当 custom element 从文档 DOM 中删除时，被调用。
    disconnectedCallback() {
      Logger.log('script删除', this);
    }
    // 当 custom element 被移动到新的文档时，被调用。
    adoptedCallback() {
      Logger.log('script移动');
    }
    // 当 custom element 增加、删除、修改自身属性时，被调用。
    attributeChangedCallback() {
      Logger.log('script修改属性');
    }
  }
  if (!win.customElements.get(MicroScriptName)) {
    win.customElements.define(MicroScriptName, ScriptElement, { extends: 'script' });
  }
};
