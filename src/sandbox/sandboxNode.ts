import { Node } from 'sandbox';
import { Sandbox } from './sandbox';

export const equalNode = (node, sanbox) => {
  if (typeof sanbox === 'string') {
    return node.name === sanbox;
  }
  return node === sanbox;
};

export class SandboxNode<T, U extends Node<T>> implements Node<T> {
  node: T;
  parent: U | null | undefined;
  children: Set<U>;
  name: string;
  top: U;
  keepalive: boolean;
  constructor(name: string, keepalive = false, node: T, parent?: U) {
    this.node = node;
    this.name = name;
    this.parent = parent;
    this.keepalive = keepalive;
    this.children = new Set<U>();
  }

  addChild(node: U) {
    this.children.add(node);
  }
  findChild(name: string | U) {
    if (equalNode(this, name)) {
      return this;
    } else {
      const queue: Array<this | U> = [this];
      let cur: U | this;
      while (queue.length > 0) {
        cur = queue.pop();
        if (!cur) return cur;
        if (equalNode(cur, name)) return cur;
        cur.children.forEach((node: this | U) => queue.push(node));
      }
    }
  }
}
