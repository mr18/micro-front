import { SandboxNode } from 'src/sandbox/sandboxNode';

const originCreateElement = document.createElement;
export const rewriteCreateElement = (scope: SandboxNode) => {
  const win = scope.node.currentWindow;
  (win.document as Document).createElement = (tagName: string, options?: ElementCreationOptions) => {
    if (tagName === 'script') {
      return originCreateElement.call(this, tagName, { is: 'micro-script' });
    } else if (tagName === 'link') {
      return originCreateElement.call(this, tagName, { is: 'micro-link' });
    } else {
      return originCreateElement.call(this, tagName, options);
    }
  };
};

export const rewriteDOMOperatorHandler = (scope: SandboxNode) => {
  const win = scope.node.currentWindow;
  (win.document as Document).createElement = (tagName: string, options?: ElementCreationOptions) => {
    if (tagName === 'script') {
      return originCreateElement.call(this, tagName, { is: 'micro-script' });
    } else if (tagName === 'link') {
      return originCreateElement.call(this, tagName, { is: 'micro-link' });
    } else {
      return originCreateElement.call(this, tagName, options);
    }
  };
};
