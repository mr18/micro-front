import { parseHtmlSource, parseLocationUrl } from 'src/utils/parse';
import { defineFreezeProperty } from 'src/utils/utils';
import { FrameWork, provideOptions } from './frame';
import { fetchSource } from './patch';
import { Scope, ScriptSourceType, StyleSourceType } from './scope';

export const FrameName = '__MICRO_FRAME_WORK__';

export type AppOptions = {
  name: string;
  url: string;
  container: string | Element;
} & provideOptions;

export type HtmlSourceType = {
  scripts: Map<string, ScriptSourceType>;
  styles: Map<string, StyleSourceType>;
  oHeadWrap: HTMLElement;
  oBodyWrap: HTMLElement;
};
export class Application {
  name: string;
  manager: FrameWork;
  scope: Scope;
  options: AppOptions;
  container: Element;
  _location: Record<PropertyKey, any>;
  constructor(options: AppOptions) {
    this.options = options;
    this.name = options.name;
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
    if (!this.options.container) {
      throw new Error('options.container must be string | Element');
    }
    if (typeof this.options.container === 'string') {
      this.container = document.body.querySelector(this.options.container);
    }
    this.scope = this.manager.provide(this.name, this.options);
    // defineSciprtElement(this.scope);
    // defineLinkElement(this.scope);
    // rewriteCreateElement(this.scope);
  }

  async run() {
    this._location = parseLocationUrl(this.options.url);

    const html = (await fetchSource(this._location.href)) as string;
    console.log(html);

    const source: HtmlSourceType = parseHtmlSource(html, this._location);

    this.container.appendChild(source.oHeadWrap);
    this.container.appendChild(source.oBodyWrap);

    this.addSourceTask(source);
    this.scope.resolveScource();
  }
  private addSourceTask(source: HtmlSourceType) {
    for (const [src, info] of source.scripts) {
      this.scope.addScript(src, info);
    }
    for (const [src, info] of source.styles) {
      this.scope.addStyle(src, info);
    }
  }
}
