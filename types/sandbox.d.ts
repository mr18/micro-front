declare module 'sandbox' {
  type GlobalProxyType = Window & { isDecleared: (key: PropertyKey) => boolean; currentWindow: object; parentSandbox?: object };
  type GlobalProxy = (Window | object) & Record<PropertyKey, unknown>;

  interface SandboxInterface {
    parentSandbox: GlobalProxyType;
    currentWindow: GlobalProxy;
    setup(): void;
    weakup(): void;
    destory(): void;
  }
  interface node<T, U> {
    node: T;
    parent: U | null | undefined;
    children: Set<U>;
    name: string;
    keepalive: boolean;
    top: U;
  }
  interface NodeType<T> {
    node: T;
    parent: node<T, NodeType<T>> | null | undefined;
    children: Set<node<T, NodeType<T>>>;
    name: string;
    keepalive: boolean;
    top: node<T, NodeType<T>>;
  }

  type provideOptions<T> = {
    keepalive?: boolean = false;
    snapshot?: boolean = false; // 沙箱模式，是否是快照模式
    parent?: T;
  };
  interface SandboxTreeInterface<T> {
    root: T | null;
    derive(name: string, options): T;
  }
  interface SandboxManagerInterface {
    provide(name, options): void;
    active(node: string): void;
    inactive(node): void;
  }
}
