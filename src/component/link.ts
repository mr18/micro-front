/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable accessor-pairs */
import { StyleSourceType } from '@micro-front/types';
import { Application } from '../app';
import { Scope } from '../app/scope';
const MicroLinkName = 'micro-link';
export const defineLinkElement = (scope: Scope, instance: Application) => {
  const win = scope.currentWindow;
  class LinkElement extends HTMLLinkElement {
    href: string;
    constructor() {
      super();
      Object.defineProperty(this, 'href', {
        set: (value: string) => {
          this.href = value;
          return true;
        },
      });
    }

    // 当 custom element 首次被插入文档 DOM 时，被调用。
    connectedCallback() {
      const oStyle = document.createElement('style');
      const scriptInfo: StyleSourceType = {
        url: instance.resolvePath(this.href),
        ele: oStyle,
      };
      scope.addStyle(this.href, scriptInfo);
      this.replaceWith(oStyle);
      // this.remove();
    }
  }
  if (!win.customElements.get(MicroLinkName)) {
    win.customElements.define(MicroLinkName, LinkElement, { extends: 'link' });
  }
};
