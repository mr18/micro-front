/* eslint-disable @typescript-eslint/no-explicit-any */
import Logger from '../utils/logger';

export const defineSciprtElement = (scope) => {
  const win = scope.node.currentWindow;
  class ScriptElement extends HTMLScriptElement {
    src: string;
    constructor() {
      super();
      Object.defineProperty(this, 'src', {
        get() {
          return '';
        },
        set: (value: string) => {
          this.src = value;
          return true;
        },
      });
    }
    private pickSource(src: string) {
      scope.pickSource(this.src, 'script');
    }

    // 当 custom element 首次被插入文档 DOM 时，被调用。
    connectedCallback() {
      scope.pickSource(this.src, 'script');
      Logger.log('插入');
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

  win.customElements.define('micro-script', ScriptElement, { extends: 'script' });
};
