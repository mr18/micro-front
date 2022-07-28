import { NodeType, SandboxManagerInterface, SandboxTreeInterface } from '../../typings/sandbox';
import Logger from '../utils/logger';
import { Sandbox } from './sandbox';

// const windowGetterMap = new Map<PropertyKey, unknown>();
// let uuid = 1;
/** Sandbox 惰性取值， 使用 window[key] 获取全局变量的值
 */
class Node<T> {
  node: Sandbox;
  parent: T | null | undefined;
  children: Set<T>;
  name: string;
  top: T;
  keepalive: boolean;
  constructor(name: string, keepalive: boolean, node: Sandbox, parent?: T, children?: Set<T>) {
    this.node = node;
    this.name = name;
    this.parent = parent;
    this.keepalive = keepalive;
    this.children = children || new Set();
  }
}
class SandboxNode extends Node<NodeType> {}

let treeUuid = 0;
export class SandboxTree implements SandboxTreeInterface<SandboxNode> {
  root: SandboxNode | null;
  treeUuid: number;
  constructor() {
    this.treeUuid = ++treeUuid;
    // const sandBox = new Sandbox();
    // this.root = new SandboxNode(sandBox);
  }
  derive(name: string, keepalive: boolean, parent?: SandboxNode) {
    const sandBox = new Sandbox(parent?.node ?? undefined);
    const sandBoxNode = new SandboxNode(name, keepalive, sandBox, parent);
    if (parent) {
      parent.children.add(sandBoxNode);
      !this.root && (this.root = parent);
    } else if (this.root) {
      this.root.children.add(sandBoxNode);
    } else {
      this.root = sandBoxNode;
    }
    sandBoxNode.top = this.root;
    return sandBoxNode;
  }
  equal(node: SandboxNode, sanbox: string | SandboxNode) {
    if (typeof sanbox === 'string') {
      return node.name === sanbox;
    }
    return node === sanbox;
  }
  find(name: string | SandboxNode) {
    if (this.root) {
      const queue: SandboxNode[] = [this.root];
      let cur: SandboxNode | undefined;
      while (queue.length > 0) {
        cur = queue.pop();
        if (!cur) return cur;
        if (this.equal(cur, name)) return cur;
        cur.children.forEach((node: SandboxNode) => queue.push(node));
      }
    }
    // errror
  }

  remove(node: string | SandboxNode) {
    if (node === this.root) {
      this.root = null;
    } else {
      const curNode = this.find(node);
      if (curNode && curNode.parent) {
        const parentChild = curNode.parent.children;
        parentChild.delete(curNode);
      }
    }
  }
}
export class SandboxManager implements SandboxManagerInterface {
  sandBoxContainer = new Set<SandboxTree>();
  currentContainer: SandboxTree;
  nodeTreeList = new WeakMap<object, SandboxTree>();
  nodeNameList = new Map<string, SandboxNode>();
  findSandBox(node: string | SandboxNode) {
    if (typeof node === 'string') {
      return this.nodeNameList.get(node);
    }
    return node;
    // errror
  }
  findSandBoxInTree(node: string | SandboxNode) {
    let newNode;
    if (typeof node === 'string') {
      newNode = this.nodeNameList.get(node);
    }
    const tree = this.nodeTreeList.get(newNode);
    if (tree) {
      return {
        node: newNode,
        tree,
      };
    }
  }
  provide(name: string, keepalive = false, parent?: SandboxNode) {
    let sandboxNode;

    if (parent) {
      const tree = this.nodeTreeList.get(parent);
      if (tree) {
        sandboxNode = tree.derive(name, keepalive, parent);
        this.currentContainer = tree;
      } else {
        // sandboxNode = this._provide(name, keepalive);
        Logger.error(`can not provide sandbox out node: ${parent.name}，because this sandbox node is removed;`);
        return;
      }
    } else {
      sandboxNode = this._provide(name, keepalive);
    }
    this.nodeTreeList.set(sandboxNode, this.currentContainer);
    this.nodeNameList.set(name, sandboxNode);
    return sandboxNode;
  }
  _provide(name: string, keepalive = false) {
    const sandboxTree = new SandboxTree();
    const sandboxNode = sandboxTree.derive(name, keepalive);
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
          this.keepalive(child, tree);
        } else {
          child.node.destory();
          this.destory(child);
          tree.remove(child);
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
      this.destory(child);
      this.nodeTreeList.delete(child);
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
      Logger.error('sandbox node does not exist , can not active!');
    }
  }
  inactive(node: string | SandboxNode) {
    const nodeResult = this.findSandBoxInTree(node);
    if (nodeResult) {
      this.keepalive(nodeResult.node, nodeResult.tree);
    }
  }
}
