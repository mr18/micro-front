/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable accessor-pairs */
import { ScriptSourceType } from 'sandbox';
import { Application } from '../app';
import { Scope } from '../app/scope';

const MicroScriptName = 'micro-script';
export const defineSciprtElement = (scope: Scope, instance: Application) => {
  const win = scope.currentWindow;
  class ScriptElement extends HTMLScriptElement {
    url: string;
    constructor() {
      super();
      Object.defineProperty(this, 'src', {
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
    }
  }
  if (!win.customElements.get(MicroScriptName)) {
    win.customElements.define(MicroScriptName, ScriptElement, { extends: 'script' });
  }
};
