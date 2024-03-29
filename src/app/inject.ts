import { defineLinkElement, defineSciprtElement } from '../component';
import { defineStyleElement } from '../component/style';
import { Application } from './app';
import { rewriteAddEventListener, rewriteSetInterval, rewriteSetTimeout } from './patch';
import { Scope } from './scope';

const originCreateElement = document.createElement;
export const rewriteCreateElement = (scope: Scope, instance: Application) => {
  defineSciprtElement(scope, instance);
  defineLinkElement(scope, instance);
  defineStyleElement(scope, instance);
  const win = scope.currentWindow;
  (win.document as Document).createElement = function (tagName: string, options?: ElementCreationOptions) {
    if (tagName === 'script') {
      return originCreateElement.call(this, tagName, { is: 'micro-script' });
    } else if (tagName === 'link') {
      return originCreateElement.call(this, tagName, { is: 'micro-link' });
    } else if (tagName === 'style') {
      return originCreateElement.call(this, tagName, { is: 'micro-style' });
    } else {
      return originCreateElement.call(this, tagName, options);
    }
  };
};
export const rewriteEventListener = (scope: Scope) => {
  rewriteAddEventListener(scope);
  rewriteSetTimeout(scope);
  rewriteSetInterval(scope);
};

export const injectRewrite = (scope: Scope, instance: Application) => {
  rewriteCreateElement(scope, instance);
  rewriteEventListener(scope);
};
