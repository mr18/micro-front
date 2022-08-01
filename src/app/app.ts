import { parseHtmlSource, parseLocationUrl, resolvePath } from 'src/utils/parse';
import { defineFreezeProperty } from 'src/utils/utils';
import { FrameWork, ProvideOptions } from './frame';
import { rewriteCreateElement } from './inject';
import { fetchSource } from './patch';
import { Scope, ScriptSourceType, StyleSourceType } from './scope';

export const FrameName = '__MICRO_FRAME_WORK__';
export type AppOptions = {
  name: string;
  url: string;
  container: string | Element;
} & ProvideOptions;

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
    } else {
      this.container = this.options.container;
    }

    this.scope = this.manager.provide(this.name, this.options);
    rewriteCreateElement(this.scope, this);
  }

  async run() {
    this._location = parseLocationUrl(this.options.url);

    const html = (await fetchSource(this._location.href)) as string;

    const source: HtmlSourceType = parseHtmlSource(html, this._location);

    // this.container.appendChild(source.oHeadWrap);
    this.container.appendChild(source.oBodyWrap);

    this.addSourceTask(source);
    await this.scope.resolveScource();

    return Promise.resolve(console.log(`APP: ${this.name} launch completed!`));
    // document.dispatchEvent(new CustomEvent('DOMContentLoaded'));
  }
  private addSourceTask(source: HtmlSourceType) {
    for (const [src, info] of source.scripts) {
      this.scope.addScript(src, info, false);
    }
    for (const [src, info] of source.styles) {
      this.scope.addStyle(src, info);
    }
  }
  resolvePath(src: string) {
    return resolvePath(this._location, src);
  }
}
