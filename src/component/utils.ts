import { SandboxNode } from 'src/sandbox/sandboxNode';

export const defineComponent = (
  scope: SandboxNode,
  tagName: string,
  webComponents: CustomElementConstructor,
  option?: ElementDefinitionOptions,
) => {
  window.customElements.define(tagName, webComponents, option);
};
