import { Scope } from './scope';

const originCreateElement = document.createElement;
export const rewriteCreateElement = (scope: Scope) => {
  console.log(1);
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
