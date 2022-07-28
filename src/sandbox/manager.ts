import { NodeType, provideOptions, SandboxManagerInterface, SandboxTreeInterface } from 'sandbox';
import Logger from '../utils/logger';
import { Sandbox } from './sandbox';

// const windowGetterMap = new Map<PropertyKey, unknown>();
// let uuid = 1;
/** Sandbox 惰性取值， 使用 window[key] 获取全局变量的值
 */

const equalNode = (node: SandboxNode, sanbox: string | SandboxNode) => {
  if (typeof sanbox === 'string') {
    return node.name === sanbox;
  }
  return node === sanbox;
};
export class SandboxNode implements NodeType<Sandbox> {
  node: Sandbox;
  parent: NodeType<Sandbox> | null | undefined;
  children: Set<NodeType<Sandbox>>;
  name: string;
  top: NodeType<Sandbox>;
  keepalive: boolean;
  constructor(name: string, keepalive = false, node: Sandbox, parent?: SandboxNode) {
    this.node = node;
    this.name = name;
    this.parent = parent;
    this.keepalive = keepalive;
    this.children = new Set<SandboxNode>();
  }
  addChild(node: SandboxNode) {
    this.children.add(node);
  }
  findChild(name: string | SandboxNode) {
    if (equalNode(this, name)) {
      return this;
    } else {
      const queue: SandboxNode[] = [this];
      let cur: SandboxNode | undefined;
      while (queue.length > 0) {
        cur = queue.pop();
        if (!cur) return cur;
        if (equalNode(cur, name)) return cur;
        cur.children.forEach((node: SandboxNode) => queue.push(node));
      }
    }
  }
}

let treeUuid = 0;
export class SandboxTree implements SandboxTreeInterface<SandboxNode> {
  root: SandboxNode | null;
  treeUuid: number;
  options: provideOptions<SandboxNode>;
  constructor(options: provideOptions<SandboxNode>) {
    this.treeUuid = ++treeUuid;
    this.options = options;
    // const sandBox = new Sandbox();
    // this.root = new SandboxNode(sandBox);
  }
  derive(name: string, options: provideOptions<SandboxNode>) {
    const sandBox = new Sandbox(options.parent ? options.parent.node : this.options.snapshot);
    const sandBoxNode = new SandboxNode(name, options.keepalive === false ? false : this.options.keepalive, sandBox, options.parent);
    if (options.parent) {
      options.parent.addChild(sandBoxNode);
      !this.root && (this.root = options.parent);
    } else if (this.root) {
      this.root.addChild(sandBoxNode);
    } else {
      this.root = sandBoxNode;
    }
    sandBoxNode.top = this.root;
    return sandBoxNode;
  }

  find(name: string | SandboxNode) {
    if (this.root) {
      const queue: SandboxNode[] = [this.root];
      let cur: SandboxNode | undefined;
      while (queue.length > 0) {
        cur = queue.pop();
        if (!cur) return cur;
        if (equalNode(cur, name)) return cur;
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
  nodeTreeList = new WeakMap<SandboxNode, SandboxTree>();
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

    if (options.parent) {
      const tree = this.nodeTreeList.get(options.parent);
      if (tree) {
        sandboxNode = tree.derive(name, options);
        this.currentContainer = tree;
      } else {
        // sandboxNode = this._provide(name, keepalive);
        Logger.error(`can not provide sandbox out node: ${parent.name}，because this sandbox node is removed;`);
        return;
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
      Logger.error('sandbox node does not exist, can not active!');
    }
  }
  inactive(node: string | SandboxNode) {
    const nodeResult = this.findSandBoxInTree(node);
    if (nodeResult) {
      this.keepalive(nodeResult.node, nodeResult.tree);
    }
  }
}
