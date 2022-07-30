import { SandboxManagerInterface } from 'sandbox';

export class SandboxManager<N extends object, T> implements SandboxManagerInterface<N, T> {
  treeContainer = new Set<T>();
  currentTree: T;
  nodeTreeList = new WeakMap<N, T>();
  nodeNameList = new Map<string, N>();
  findNode(node: string | N) {
    if (typeof node === 'string') {
      return this.nodeNameList.get(node);
    }
    return node;
    // errror
  }
  findTreeByNode(node: string | N) {
    let newNode: N | undefined;
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
}
