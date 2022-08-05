/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable accessor-pairs */
import { StyleSourceType } from 'sandbox';
import { Application } from '../app';
import { Scope } from '../app/scope';
import { cssScope } from '../parser/css';
import Logger from '../utils/logger';

const MicroStyleName = 'micro-style';
export const defineStyleElement = (scope: Scope, instance: Application) => {
  const win = scope.currentWindow;
  class StyleElement extends HTMLStyleElement {
    [key: string]: any;
    content: string;
    constructor() {
      super();
      if (this.styleSheet) {
        Object.defineProperty(this.styleSheet, 'cssText', {
          set: (value: string) => {
            this.content = value;
            return true;
          },
        });
      }
    }
    // 当 custom element 首次被插入文档 DOM 时，被调用。
    connectedCallback() {
      console.log(this);
      const content = this.content || '';
      const sumUri = content.replace(/[\n\t\s]+/, '').substring(0, 50) + '...';
      this.textContent = '';
      const scriptInfo: StyleSourceType = {
        url: sumUri,
        result: content,
        ele: this,
      };
      scope.addStyle(scriptInfo.url, scriptInfo);
    }

    // 当 custom element 增加、删除、修改自身属性时，被调用。
    attributeChangedCallback() {
      const content = this.textContent || '';
      this.textContent = cssScope(content, instance.cssSelectorScope, instance.location);
      Logger.log('style 内容发生变化');
    }
  }
  if (!win.customElements.get(MicroStyleName)) {
    win.customElements.define(MicroStyleName, StyleElement, { extends: 'style' });
  }
};
