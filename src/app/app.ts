import { defineLinkElement } from 'src/component/link';
import { defineSciprtElement } from 'src/component/script';
import { defineFreezeProperty } from 'src/utils/utils';
import { FrameWork, provideOptions } from './frame';
import { Scope } from './scope';

const FrameName = '__MICRO_FRAME_WORK__';

export type AppOptions = {} & provideOptions;

export class App {
  name: string;
  manager: FrameWork;
  scope: Scope;
  options: AppOptions;

  constructor(name: string, options: AppOptions) {
    this.options = options;
    // 继承window中的实例&属性
    if (window[FrameName]) {
      this.manager = window[FrameName];
    } else {
      this.manager = new FrameWork();
      defineFreezeProperty(window, FrameName, this.manager);
    }

    this.setup();
  }
  setup() {
    this.scope = this.manager.provide(this.name, this.options);
    defineSciprtElement(this.scope);
    defineLinkElement(this.scope);
  }
  run() {
    for (const [, code] of this.scope.scriptsMap) {
      this.runScript(code);
    }
  }
  runScript(script: Promise<string>) {
    console.log(script);
  }
}
