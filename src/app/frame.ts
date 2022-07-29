import { provideOptions } from 'sandbox';
import { SandboxManager } from '../sandbox/manager';
import { Scope } from './scope';

export class Frame extends SandboxManager {
  provide(name: string, options: provideOptions<Scope> = {}) {
    let scope: Scope;

    if (this.nodeNameList.get(name)) {
      throw new Error(`can not provide same sandbox named:${name}.`);
    }
    if (options.parent) {
      const tree = this.nodeTreeList.get(options.parent);
      if (tree) {
        scope = tree.derive(name, options);
        this.currentContainer = tree;
      } else {
        // sandboxNode = this._provide(name, keepalive);
        throw new Error(`can not provide sandbox out node: ${parent.name}，because this sandbox node is removed;`);
      }
    } else {
      scope = this._provide(name, options);
    }
    this.nodeTreeList.set(scope, this.currentContainer);
    this.nodeNameList.set(name, scope);
    return scope;
  }
  _provide(name: string, options: provideOptions<SandboxNode>) {
    const sandboxTree = new SandboxTree(options);
    const sandboxNode = sandboxTree.derive(name, options);
    this.sandBoxContainer.add(sandboxTree);
    this.currentContainer = sandboxTree;
    return sandboxNode;
  }
}
