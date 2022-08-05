/* eslint-disable accessor-pairs */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AppOptions } from 'sandbox';
import { getContainerSelector } from 'src/utils/path';
import { Application } from './app';

const MicroContainerName = 'micro-container';

class MicroElement extends HTMLElement {
  [key: string]: any;

  instance: Application;
  constructor() {
    super();
    this.initPropsSetter(['name', 'url', 'shareScope']);
  }
  getOptions() {
    const options: AppOptions = {
      url: this['attr-url'],
      name: this['attr-name'] || this.instance?.name,
      shareScope: this['attr-shareScope'],
      container: this,
    };
    return options;
  }
  initPropsSetter(keys: string[]) {
    keys.forEach((key) => {
      Object.defineProperty(this, key, {
        set: (value: string) => {
          this['attr-' + key] = value;
          return true;
        },
      });
      const strKey = this.humpCase(key);
      if (strKey) {
        Object.defineProperty(this, strKey, {
          set: (value: string) => {
            this['attr-' + key] = value;
            return true;
          },
        });
      }
    });
  }
  private humpCase(key: string) {
    const re = /([A-Z])([a-z0-9]+)/g;
    if (re.test(key)) {
      return key.replace(re, ($1, $2, $3) => {
        return '-' + $2.toLowerCase() + $3;
      });
    }
  }
  // 当 custom element 首次被插入文档 DOM 时，被调用。
  connectedCallback() {
    const options = this.getOptions();
    this.setAttribute('id', getContainerSelector(options.name));
    const app = new Application(options);
    this.instance = app;
    app.run();
  }
  // 当 custom element 增加、删除、修改自身属性时，被调用。
  attributeChangedCallback() {
    this.instance.refresh(this.getOptions());

    // display none -> block
    // this.instance.active()
  }
  disconnectedCallback() {
    this.instance.inactive();
  }
}

export const defineMicroContainer = () => {
  if (!window.customElements.get(MicroContainerName)) {
    window.customElements.define(MicroContainerName, MicroElement);
  }
};
