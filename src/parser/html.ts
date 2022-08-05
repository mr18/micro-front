import { HtmlSourceType, ScriptSourceType, StyleSourceType } from 'sandbox';
import { parseFileName, resolvePath } from 'src/utils/path';

enum ActionType {
  remove = 1,
  replace = 2,
  insert = 3,
}

export default class HtmlSourceParser {
  fragment: {
    [key: string]: HTMLElement;
  };
  sources = new Map<string, ScriptSourceType | StyleSourceType>();
  location: Record<PropertyKey, any>;
  pickSource(html = '', location: Record<PropertyKey, any>): HtmlSourceType {
    this.reset();
    this.location = location;
    this.pick(html, ['head', 'body']);
    return this;
  }

  private pick(html: string, types: string[]) {
    while (types.length) {
      const type = types.pop();
      if (type) {
        const htmlStr = (html.match(new RegExp(`<${type}>(.*)</${type}>`, 'is')) || [])[1];
        this.fragment[type] = window.document.createElement('div');
        this.fragment[type].innerHTML = htmlStr;
        this.fragment[type].childNodes.forEach((ele: HTMLElement) => {
          this._pickSource(ele, this.fragment[type]);
        });
      }
    }
  }
  private _pickSource(ele: HTMLElement, parent: HTMLElement) {
    if (ele.childNodes && ele.childNodes.length > 0) {
      ele.childNodes.forEach((e: HTMLElement) => {
        this._pickSource(e, ele);
      });
    }
    if (ele.nodeType === 1) {
      const tagName = ele.tagName.toLowerCase();

      this.pickSourceInfo(ele, tagName, parent);
    }
  }
  private pickSourceInfo(ele: HTMLElement, tagName: string, parent: HTMLElement) {
    const attr = this.sourceAttr(tagName);
    if (attr) {
      const attrVal = ele.getAttribute(attr) || '';

      if (tagName === 'script') {
        this.pickScriptSourceInfo(ele, attrVal);
        this.patchElement(ele, tagName, { type: ActionType.remove }, parent);
      } else if (tagName === 'link') {
        const rel = ele.getAttribute('rel');
        const patcEle = this.patchElement(
          ele,
          tagName,
          { type: rel === 'stylesheet' ? ActionType.replace : ActionType.remove, tag: rel === 'stylesheet' ? 'style' : '' },
          parent,
        );
        this.pickLiskSourceInfo(ele, attrVal, patcEle);
      } else if (tagName === 'style') {
        this.pickStyleSourceInfo(ele);
      } else if (['img', 'a', 'iframe'].indexOf(tagName) >= 0) {
        ele.setAttribute(attr, resolvePath(this.location, attrVal));
      } else if (['title', 'meta'].indexOf(tagName) >= 0) {
        this.patchElement(ele, tagName, { type: ActionType.remove }, parent);
      }
    }
  }

  private sourceAttr(tagName: string) {
    const attr = ['script', 'img'].indexOf(tagName) >= 0 ? 'src' : ['link', 'a'].indexOf(tagName) >= 0 ? 'href' : '';
    if (attr) {
      return attr;
    }
  }
  private patchElement(ele: HTMLElement, tagName: string, action: { type: ActionType; tag?: string }, parent: HTMLElement): HTMLElement {
    const comment = this.comment(tagName, action.type, parent);
    const oComment = document.createComment(comment);

    switch (action.type) {
      case ActionType.replace:
        this.patchElement(ele, tagName, { type: ActionType.insert, tag: action.tag }, parent);
        parent.replaceChild(oComment, ele);
        break;
      case ActionType.insert:
        if (action.tag) {
          const insertEle = document.createElement(action.tag);
          parent.insertBefore(insertEle, ele);
          parent.insertBefore(oComment, ele);
          return insertEle;
        }
        break;
      case ActionType.remove:
        parent.replaceChild(oComment, ele);
        break;
    }
    return ele;
  }
  private comment(tagName: string, type: ActionType, parent: HTMLElement) {
    let comment = '';
    switch (type) {
      case ActionType.replace:
        comment = `${tagName} element is replaced by micro framework`;
        break;
      case ActionType.insert:
        comment = `${tagName} insert into ${parent.tagName} by micro framework`;
        break;
      case ActionType.remove:
        comment = `${tagName} element is removed by micro framework`;
        break;
    }

    return comment;
  }
  private pickScriptSourceInfo(ele: HTMLElement, src: string) {
    if (src) {
      const module = ele.getAttribute('module') !== null;
      const async = ele.getAttribute('async') !== null;
      this.sources.set(src, {
        url: resolvePath(this.location, src),
        async,
        defer: !async,
        module,
        nomodule: !module,
        fileName: parseFileName(src),
        ele,
        type: 'script',
      });
    } else {
      const content = ele.textContent || '';
      if (content) {
        const contentUri = content.replace(/[\n\t\s]+/, '').substring(0, 50) + '...';
        if (contentUri) {
          this.sources.set(contentUri, {
            url: contentUri,
            defer: true,
            result: content,
            ele,
            type: 'script',
          });
        }
      }
    }
  }
  private pickLiskSourceInfo(ele: HTMLElement, src: string, replaceEle: HTMLElement) {
    const fileName = parseFileName(src);
    if (ele.getAttribute('rel') === 'stylesheet') {
      this.sources.set(src, {
        url: resolvePath(this.location, src),
        fileName: parseFileName(src),
        ele: replaceEle || ele,
        type: 'style',
      });
    } else if (fileName.endsWith('.js')) {
      this.sources.set(src, {
        url: resolvePath(this.location, src),
        async: true,
        type: 'script',
      });
    }
  }

  private pickStyleSourceInfo(ele: HTMLElement) {
    const content = ele.textContent || '';
    if (content) {
      const contentUri = content.replace(/[\n\t\s]+/, '').substring(0, 50) + '...';
      if (contentUri) {
        this.sources.set(contentUri, {
          url: contentUri,
          ele,
          type: 'style',
        });
      }
    }
  }
  private reset() {
    this.location = {};
    this.sources.clear();
    this.fragment = {};
  }
}
let parser: HtmlSourceParser;
export const pickSourceFromHtml = (html = '', location: Record<PropertyKey, any>) => {
  parser = parser || new HtmlSourceParser();
  return parser.pickSource(html, location);
};
