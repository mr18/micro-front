/* eslint-disable accessor-pairs */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AppOptions } from 'sandbox';
import { getContainerSelector } from '../utils/path';
import { Application } from './app';

const MicroContainerName = 'micro-container';
enum AttributeType {
  shareScope = 'shareScope',
}
class MicroElement extends HTMLElement {
  [key: string]: any;
  instance: Application;
  constructor() {
    super();
    console.log(1);
  }
  getOptions() {
    let shareScope = this.getAttribute(AttributeType.shareScope) || this.getAttribute(this.humpCase(AttributeType.shareScope));
    if (shareScope) {
      try {
        shareScope = new Function(`return ${shareScope}`)();
      } catch (e) {
        throw new Error(`${AttributeType.shareScope} attribute's value is not a type of Array<string> `);
      }
    }
    const options: AppOptions = {
      url: this.getAttribute('url') || '',
      name: this.getAttribute('name') || '',
      shareScope: (shareScope || []) as string[],
      container: this,
    };
    return options;
  }

  private humpCase(key: string) {
    const re = /([A-Z])([a-z0-9]+)/g;
    return key.replace(re, (_$1, $2, $3) => {
      return '-' + $2.toLowerCase() + $3;
    });
  }
  // 当 custom element 首次被插入文档 DOM 时，被调用。
  connectedCallback() {
    const options = this.getOptions();

    const app = new Application(options);
    this.instance = app;

    this.setAttribute('id', getContainerSelector(options.name || ''));
    app.run();
  }
  // 当 custom element 增加、删除、修改自身属性时，被调用。
  attributeChangedCallback() {
    this.instance.active(this.getOptions());

    // this.instance.refresh(this.getOptions());

    // display none -> block
    // this.instance.active()
  }
  disconnectedCallback() {
    this.instance.inactive();
  }
}

if (!window.customElements.get(MicroContainerName)) {
  window.customElements.define(MicroContainerName, MicroElement);
}
