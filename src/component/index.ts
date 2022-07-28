import { SandboxManager } from '../index';
import Logger from '../utils/logger';

class webComponents extends HTMLElement {
  constructor() {
    super();
    Logger.log('init');
  }
  // 当 custom element 首次被插入文档 DOM 时，被调用。
  connectedCallback() {
    const manager = new SandboxManager();
    const sandboxNode = manager.provide('home', true);
    const curWindow = sandboxNode.node.currentWindow;

    console.log(curWindow.b);
    global.b = 1;
    // eslint-disable-next-line no-new-func
    const execInSandBox = new Function(
      `'use strict';function fn(window){
            console.log(this)
            console.log(window);
            console.log(window.a)
            console.log(window.b)
            console.log(this.location)
            console.log(b)
        };
        fn.call(this,this);
    `,
    );

    execInSandBox.call(curWindow);
    Logger.log('插入');
  }
  // 当 custom element 从文档 DOM 中删除时，被调用。
  disconnectedCallback() {
    Logger.log('删除');
  }
  // 当 custom element 被移动到新的文档时，被调用。
  adoptedCallback() {
    Logger.log('插入');
  }
  // 当 custom element 增加、删除、修改自身属性时，被调用。
  attributeChangedCallback() {
    Logger.log('插入');
  }
}

export const defineCustomElement = (tagName: string, options?: object) => {
  window.customElements.define(tagName, webComponents, options);
};
