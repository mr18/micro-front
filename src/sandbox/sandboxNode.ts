import { Node } from 'sandbox';
import { Sandbox } from './sandbox';

export const equalNode = (node: SandboxNode, sanbox: string | SandboxNode) => {
  if (typeof sanbox === 'string') {
    return node.name === sanbox;
  }
  return node === sanbox;
};
export class SandboxNode<T extends Sandbox> implements Node<T> {
  node: T;
  parent: SandboxNode<T> | null | undefined;
  children: Set<SandboxNode<T>>;
  name: string;
  top: SandboxNode<T>;
  keepalive: boolean;
  constructor(name: string, keepalive = false, node: T, parent?: SandboxNode<T>) {
    this.node = node;
    this.name = name;
    this.parent = parent;
    this.keepalive = keepalive;
    this.children = new Set<SandboxNode<T>>();
  }

  addChild(node: SandboxNode<T>) {
    this.children.add(node);
  }
  findChild(name: string | SandboxNode<T>) {
    if (equalNode(this, name)) {
      return this;
    } else {
      const queue: SandboxNode<T>[] = [this];
      let cur: SandboxNode<T> | undefined;
      while (queue.length > 0) {
        cur = queue.pop();
        if (!cur) return cur;
        if (equalNode(cur, name)) return cur;
        cur.children.forEach((node: SandboxNode<T>) => queue.push(node));
      }
    }
  }
}
