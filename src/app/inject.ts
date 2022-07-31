import { defineLinkElement, defineSciprtElement } from 'src/component';
import { Application } from './factory';
import { Scope } from './scope';

const originCreateElement = document.createElement;
export const rewriteCreateElement = (scope: Scope, instance: Application) => {
  defineSciprtElement(scope, instance);
  defineLinkElement(scope, instance);
  const win = scope.node.currentWindow;
  (win.document as Document).createElement = function (tagName: string, options?: ElementCreationOptions) {
    if (tagName === 'script') {
      return originCreateElement.call(this, tagName, { is: 'micro-script' });
    } else if (tagName === 'link') {
      return originCreateElement.call(this, tagName, { is: 'micro-link' });
    } else {
      return originCreateElement.call(this, tagName, options);
    }
  };
};

export const rewriteDOMOperatorHandler = (scope: Scope) => {
  const win = scope.node.currentWindow;
  win.addEventListener = window.addEventListener;
};
