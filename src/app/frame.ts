import { GlobalProxy } from 'sandbox';
import { getSandBoxInstanceFnName } from 'src/sandbox/sandbox';
import { SandboxNode } from 'src/sandbox/sandboxNode';
import { SandboxTree } from 'src/sandbox/sandboxTree';
import { SandboxManager } from '../sandbox/manager';
import { Scope, ScopeOptions } from './scope';

export type ProvideOptions = { parent?: Scope; window?: GlobalProxy } & ScopeOptions;
export class FrameWork extends SandboxManager<Scope, SandboxTree<SandboxNode>> {
  provide(name: string, options: ProvideOptions) {
    // name 不能重复
    if (this.nodeNameList.get(name)) {
      throw new Error(`can not provide same sandbox named:${name}.`);
    }
    const getSandBoxInstance = options.window && options.window[getSandBoxInstanceFnName];
    if (typeof getSandBoxInstance === 'function') {
      const parent = getSandBoxInstance();
      if (parent instanceof Scope) {
        options.parent = parent;
      } else {
        options.parent = undefined;
      }
    } else {
      options.parent == undefined;
    }
    const scope = new Scope(name, options);
    let tree;
    if (options.parent) {
      tree = this.nodeTreeList.get(options.parent);
      if (tree) {
        this.currentTree = tree;
      } else {
        // sandboxNode = this._provide(name, keepalive);
        throw new Error(`can not provide sandbox out node: ${parent.name}, because this sandbox node is removed;`);
      }
    } else {
      tree = new SandboxTree();
      this.treeContainer.add(tree);
      this.currentTree = tree;
    }

    tree.attach(scope, options.parent);

    this.nodeTreeList.set(scope, this.currentTree);
    this.nodeNameList.set(name, scope);
    return scope;
  }

  active(name: string | Scope) {
    const node = this.findNode(name);
    if (node) {
      node.weakup();
    } else {
      throw new Error('sandbox node does not exist, can not active!');
    }
  }
  inactive(name: string | Scope) {
    const node = this.findNode(name);
    if (node) {
      if (node.keepalive) {
        node.sleep();
        for (const child of node.children as Set<Scope>) {
          if (child.keepalive) {
            child.sleep();
          } else {
            child.destory();
            this._destory(child);
          }
        }
      } else {
        node.destory();
        this._destory(node);
      }
    } else {
      throw new Error('sandbox node does not exist, can not inactive!');
    }
  }
  private _destory(node: Scope) {
    this.nodeTreeList.delete(node);
    this.nodeNameList.delete(node.name);
  }
}
