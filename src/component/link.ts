/* eslint-disable @typescript-eslint/no-explicit-any */
import Logger from '../utils/logger';
const MicroLinkName = 'micro-link';
export const defineLinkElement = (scope) => {
  const win = scope.node.currentWindow;
  class LinkElement extends HTMLLinkElement {
    href: string;
    constructor() {
      super();
      Object.defineProperty(this, 'href', {
        get() {
          return '';
        },
        set: (value: string) => {
          this.href = value;
          return true;
        },
      });
    }

    // 当 custom element 首次被插入文档 DOM 时，被调用。
    connectedCallback() {
      scope.addStyle(this.href, 'style');
      this.remove();
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
  if (!win.customElements.get(MicroLinkName)) {
    win.customElements.define(MicroLinkName, LinkElement, { extends: 'link' });
  }
};
