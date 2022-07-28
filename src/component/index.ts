/* eslint-disable @typescript-eslint/no-explicit-any */
import { GlobalProxy } from 'sandbox';
import { SandboxManager, SandboxNode } from '../sandbox/manager';
import Logger from '../utils/logger';

class webComponents extends HTMLScriptElement {
  [x: string]: any;
  sandboxNode: SandboxNode;
  curWindow: GlobalProxy;
  constructor() {
    super();
    console.log('mmmssshnl');
    let src: string;

    const manager = new SandboxManager();
    this.sandboxNode = manager.provide('home', { snapshot: true, keepalive: true });

    this.curWindow = this.sandboxNode.node.currentWindow;
    return;
    Object.defineProperty(this, 'src', {
      // value: '21',
      // writable: true,
      get() {
        const src = 'http://ss.js';
        console.log(src);
        return this.src;
      },
      set: (value: string) => {
        if (!this.src) {
          this.src = value;
        }
        // this.handleSrc(value);
        // this.src = value;
        return true;
      },
    });

    console.log(src);
    //   const shadow = this.attachShadow({
    //     mode: 'open',
    //   });

    //   const wrapper = document.createElement('button');
    //   wrapper.innerText = 'Button';

    //   const style = document.createElement('style');
    //   style.textContent = `
    //   button {
    //     color: #0B8BF4;
    //     border-radius: 4px;
    //   }
    // `;
    //   const link = document.createElement('link');
    //   link.href = 'https://www.gstatic.com/og/_/ss/k=og.qtm.E6xEslu3DTQ.L.W.O/m=qcwid/excm=qaaw,qadd,qaid,qein,qhaw,qhbr,qhch,qhga,qhid,qhin,qhpr/d=1/ed=1/ct=zgms/rs=AA2YrTvDNatDeo3v4DbuiytI_BbBh-bQDA';
    //   link.type = 'text/css';
    //   link.rel = 'stylesheet';

    //   shadow.appendChild(link);

    //   shadow.appendChild(style);

    //   shadow.appendChild(wrapper);

    // this.textContent = 'alert(1)';
    // this._observer = new MutationObserver((arg) => {
    //   console.log(arg);
    // });
  }
  handleSrc(src) {
    // window = this.curWindow;
    fetch(src, {
      integrity: this.integrity,
      // referrerpolicy: this.referrerpolicy,
    }).then((res) => {
      res.text().then((text) => {
        this.execScript(text);
        const onload = (this as any).onload;
        onload && onload();
      });
    });
  }
  execScript(code) {
    const execInSandBox = new Function(`
    (function(window,self){
      ;${code};
    })(this,this)
    `);
    execInSandBox.call(this.curWindow);
  }
  // 当 custom element 首次被插入文档 DOM 时，被调用。
  connectedCallback() {
    // console.log(curWindow.b);

    // eslint-disable-next-line no-new-func
    const execInSandBox = new Function(
      `
        function fn(window,self){
          with(self) {
            'use strict';
            return;
            console.log(this)
            console.log(window);
            console.log(window.a)
            console.log(this.location)
            // console.log(window.b)
            setTimeout(()=>{console.log(c);},2000)
            // console.log(this.b)
            
            // this.b  = 10
            console.log(window.b)
            console.log(b)
            console.log(this.b)
            

            console.log(this.navigation)
          }
        };
        fn.call(this,this,this);
    `,
    );

    execInSandBox.call(this.curWindow);

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

export const defineCustomElement = (tagName: string, options?: object) => {
  return window.customElements.define(tagName, webComponents, options);
};
