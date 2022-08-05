import { AppOptions, HtmlSourceType } from 'sandbox';
import { pickSourceFromHtml } from '../parser/html';
import Logger from '../utils/logger';
import { getContainerSelector, parseLocationUrl, resolvePath } from '../utils/path';
import { defineFreezeProperty } from '../utils/utils';
import { FrameWork } from './frame';
import { rewriteCreateElement } from './inject';
import { fetchSource } from './patch';
import { Scope } from './scope';

export const FrameName = '__MICRO_FRAME_WORK__';

let uuid = 0;
export class Application {
  name: string;
  manager: FrameWork;
  scope: Scope;
  options: AppOptions;
  container: Element;
  fragment: { [key: string]: HTMLElement };
  location: Record<PropertyKey, any>;
  keepalive = false;
  cssSelectorScope: string;
  uuid = 0;
  constructor(options: AppOptions) {
    this.uuid = ++uuid;
    options.name = options.name ? options.name : this.uuid + '';
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
      const container = document.body.querySelector(this.options.container);
      if (container) {
        this.container = container;
      } else {
        throw new Error(`can not find ${this.options.container} dom`);
      }
    } else {
      this.container = this.options.container;
    }
    let cssSelectorScope = this.container.getAttribute('id');
    if (!cssSelectorScope) {
      cssSelectorScope = getContainerSelector(this.name);
      this.container.setAttribute('id', cssSelectorScope);
    }
    this.cssSelectorScope = `#${cssSelectorScope}`;
    this.scope = this.manager.provide(this, this.options);
    this.scope.appInstance = this;
    rewriteCreateElement(this.scope, this);

    Logger.log('APP instance is initialized');
  }

  async run() {
    this.location = parseLocationUrl(this.options.url);

    const html = (await fetchSource(this.location.href)) as string;

    const source: HtmlSourceType = pickSourceFromHtml(html, this.location);

    this.fragment = source.fragment;
    this.container.appendChild(source.fragment.head);
    this.container.appendChild(source.fragment.body);

    Logger.log('html sources is load compeleted');

    this.addSourceTask(source);
    await this.scope.resolveScource();

    return Promise.resolve(console.log(`APP: ${this.name} launch completed!`));
    // document.dispatchEvent(new CustomEvent('DOMContentLoaded'));
  }
  async refresh(options: AppOptions) {
    if (this.options.url !== options.url) {
      this.options.url = options.url;
      this.location = parseLocationUrl(this.options.url);

      const html = (await fetchSource(this.location.href)) as string;

      const source: HtmlSourceType = pickSourceFromHtml(html, this.location);

      // this.fragment.head.replaceWith(source.fragment.head);
      // this.fragment.body.replaceWith(source.fragment.body);

      this.fragment = source.fragment;
      this.scope.resetSourceTask();
      this.addSourceTask(source);
      await this.scope.resolveScource();

      return Promise.resolve(console.log(`APP: ${this.name} is refreshed!`));
      // document.dispatchEvent(new CustomEvent('DOMContentLoaded'));
    }
  }
  inactive() {
    // TODO:移除监听事件，释放内存空间
  }
  // keepalive===true
  active() {
    // TODO 重新绑定事件，复用资源
  }
  addSourceTask(source: HtmlSourceType) {
    for (const [src, info] of source.sources) {
      if (info.type === 'script') {
        this.scope.addScript(src, info, false);
      } else if (info.type === 'style') {
        this.scope.addStyle(src, info);
      }
    }
  }
  resolvePath(src: string) {
    return resolvePath(this.location, src);
  }
}
