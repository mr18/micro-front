/* eslint-disable @typescript-eslint/no-explicit-any */
import Logger from '../utils/logger';

const MicroScriptName = 'micro-script';
export const defineSciprtElement = (scope) => {
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
      scope.addScript(this.url, 'script');
      Logger.log('插入');
      // this.remove();
    }
    // 当 custom element 从文档 DOM 中删除时，被调用。
    disconnectedCallback() {
      Logger.log('删除');
    }
    // 当 custom element 被移动到新的文档时，被调用。
    adoptedCallback() {
      Logger.log('移动');
    }
    // 当 custom element 增加、删除、修改自身属性时，被调用。
    attributeChangedCallback() {
      Logger.log('插入');
    }
  }
  if (!win.customElements.get(MicroScriptName)) {
    win.customElements.define(MicroScriptName, ScriptElement, { extends: 'script' });
  }
};
