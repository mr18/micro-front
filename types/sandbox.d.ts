declare module 'sandbox' {
  type GlobalProxyType = Window & {
    isDecleared: (key: PropertyKey) => boolean;
    currentWindow: GlobalProxyType;
    parentSandbox?: GlobalProxyType;
  };
  type GlobalProxy = (Window | object) & Record<PropertyKey, any>;

  interface SandboxInterface {
    parentSandbox: GlobalProxyType;
    currentWindow: GlobalProxy;
    setup(): void;
  }
  interface ScopeInterface extends SandboxInterface {
    weakup(): void;
    destory(): void;
    sleep(): void;
  }
  interface SandboxTreeInterface<N> {
    root: N | null;
    attach(node: N, parent?: N): N;
    find(node: N): void;
    remove(node: N): void;
  }
  interface SandboxManagerInterface<N, T> {
    treeContainer: Set<T>;
    currentTree: T;
    nodeTreeList: WeakMap<N, T>;
    nodeNameList: Map<string, N>;
    findNode(node: string | N): void;
    findTreeByNode(node: string | N);
    // provide(name: string, options): N;
    // active(node: string | N): void;
    // inactive(node: string | N): void;
  }
}
