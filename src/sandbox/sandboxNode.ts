import { Sandbox } from './sandbox';

export const equalNode = (node, sanbox) => {
  if (typeof sanbox === 'string') {
    return node.name === sanbox;
  }
  return node === sanbox;
};
export type NodeTypeOptions = {
  parent?: SandboxNode;
  shareScope?: Array<string>;
};
export class SandboxNode extends Sandbox {
  parent: SandboxNode | null | undefined;
  children: Set<SandboxNode>;
  name: string;
  top: SandboxNode;
  node: this;
  constructor(name: string, options: NodeTypeOptions) {
    super(options.parent, options.shareScope);
    this.node = this;
    this.name = name;
    this.parent = options.parent;
    this.children = new Set<SandboxNode>();
  }

  addChild(node: SandboxNode) {
    this.children.add(node);
  }
  findChild(name: string | SandboxNode) {
    if (equalNode(this, name)) {
      return this;
    } else {
      const queue: Array<this | SandboxNode> = [this];
      let cur;
      while (queue.length > 0) {
        cur = queue.pop();
        if (!cur) return cur;
        if (equalNode(cur, name)) return cur;
        cur.children.forEach((node) => queue.push(node));
      }
    }
  }
}
