import { provideOptions, SandboxManagerInterface } from 'sandbox';
import { Sandbox } from './sandbox';
import { SandboxNode } from './sandboxNode';
import { SandboxTree } from './sandboxTree';

type sdxNode = SandboxNode<Sandbox>;
export class SandboxManager implements SandboxManagerInterface {
  sandBoxContainer = new Set<SandboxTree>();
  currentContainer: SandboxTree;
  nodeTreeList = new WeakMap<SandboxNode, SandboxTree>();
  nodeNameList = new Map<string, sandboxNode>();
  findSandBox(node: string | SandboxNode) {
    if (typeof node === 'string') {
      return this.nodeNameList.get(node);
    }
    return node;
    // errror
  }
  findSandBoxInTree(node: string | SandboxNode) {
    let newNode: SandboxNode | undefined;
    if (typeof node === 'string') {
      newNode = this.nodeNameList.get(node);
    } else {
      newNode = node;
    }
    if (newNode) {
      const tree = this.nodeTreeList.get(newNode);
      if (tree) {
        return {
          node: newNode,
          tree,
        };
      }
    }
  }

  provide(name: string, options: provideOptions<SandboxNode> = {}) {
    let sandboxNode: SandboxNode;

    if (this.nodeNameList.get(name)) {
      throw new Error(`can not provide same sandbox named:${name}.`);
    }
    if (options.parent) {
      const tree = this.nodeTreeList.get(options.parent);
      if (tree) {
        sandboxNode = tree.derive(name, options);
        this.currentContainer = tree;
      } else {
        // sandboxNode = this._provide(name, keepalive);
        throw new Error(`can not provide sandbox out node: ${parent.name}，because this sandbox node is removed;`);
      }
    } else {
      sandboxNode = this._provide(name, options);
    }
    this.nodeTreeList.set(sandboxNode, this.currentContainer);
    this.nodeNameList.set(name, sandboxNode);
    return sandboxNode;
  }

  _provide(name: string, options: provideOptions<SandboxNode>) {
    const sandboxTree = new SandboxTree(options);
    const sandboxNode = sandboxTree.derive(name, options);
    this.sandBoxContainer.add(sandboxTree);
    this.currentContainer = sandboxTree;
    return sandboxNode;
  }
  keepalive(sandBoxNode: SandboxNode, tree: SandboxTree) {
    if (sandBoxNode.keepalive) {
      sandBoxNode.node.sleep();
      // this.keepalive(sandBoxNode, tree);
      for (const child of sandBoxNode.children) {
        if (child.keepalive) {
          child.node.sleep();
          this.keepalive(child as SandboxNode, tree);
        } else {
          child.node.destory();
          this.destory(child as SandboxNode);
          tree.remove(child as SandboxNode);
        }
      }
    } else {
      sandBoxNode.node.destory();
      this.destory(sandBoxNode);
      tree.remove(sandBoxNode);
    }
  }

  destory(sandBoxNode: SandboxNode) {
    sandBoxNode.node.destory();
    this.nodeTreeList.delete(sandBoxNode);
    this.nodeNameList.delete(sandBoxNode.name);

    for (const child of sandBoxNode.children) {
      child.node.destory();
      this.destory(child as SandboxNode);
      this.nodeTreeList.delete(child as SandboxNode);
      this.nodeNameList.delete(child.name);
    }
  }
  weakup(sandBoxNode: SandboxNode) {
    for (const child of sandBoxNode.children) {
      child.node.weakup();
    }
  }
  active(node: string | SandboxNode) {
    const sandbox = this.findSandBox(node);
    if (sandbox) {
      this.weakup(sandbox);
    } else {
      throw new Error('sandbox node does not exist, can not active!');
    }
  }
  inactive(node: string | SandboxNode) {
    const nodeResult = this.findSandBoxInTree(node);
    if (nodeResult) {
      this.keepalive(nodeResult.node, nodeResult.tree);
    }
  }
}
