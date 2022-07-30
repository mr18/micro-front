import { SandboxTreeInterface } from 'sandbox';
import { equalNode, SandboxNode } from './sandboxNode';

let treeUuid = 0;
export class SandboxTree<N extends SandboxNode> implements SandboxTreeInterface<N> {
  root: N | null;
  treeUuid: number;
  constructor() {
    this.treeUuid = ++treeUuid;
  }
  attach(node: N, parent?: N) {
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

  find(node: N) {
    if (this.root) {
      const queue: N[] = [this.root];
      let cur: N | undefined;
      while (queue.length > 0) {
        cur = queue.pop();
        if (!cur) return cur;
        if (equalNode(cur, node)) return cur;
        cur.children.forEach((node: N) => queue.push(node));
      }
    }
    // errror
  }
  remove(node: N) {
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
