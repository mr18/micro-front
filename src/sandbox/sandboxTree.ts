import { SandboxTreeInterface } from 'sandbox';
import { Sandbox } from './sandbox';
import { equalNode, SandboxNode } from './sandboxNode';

// const windowGetterMap = new Map<PropertyKey, unknown>();
// let uuid = 1;
/** Sandbox 惰性取值， 使用 window[key] 获取全局变量的值
 */

let treeUuid = 0;
export class SandboxTree<T extends SandboxNode<Sandbox>> implements SandboxTreeInterface<T> {
  root: T | null;
  treeUuid: number;
  constructor() {
    this.treeUuid = ++treeUuid;
  }
  derive(node: T, parent?: T) {
    if (parent) {
      parent.addChild(node);
      !this.root && (this.root = parent);
    } else if (this.root) {
      this.root.addChild(node);
    } else {
      this.root = node;
    }
    node.top = this.root;
    return node;
  }

  find(node: T) {
    if (this.root) {
      const queue: T[] = [this.root];
      let cur: T | undefined;
      while (queue.length > 0) {
        cur = queue.pop();
        if (!cur) return cur;
        if (equalNode(cur, node)) return cur;
        cur.children.forEach((node: T) => queue.push(node));
      }
    }
    // errror
  }

  remove(node: T) {
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
