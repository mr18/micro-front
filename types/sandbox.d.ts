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
    weakup(): void;
    destory(): void;
  }
  interface Node<T> {
    node: T;
    parent: Node<T> | null | undefined;
    children: Set<Node<T>>;
    name: string;
    keepalive: boolean;
    top: Node<T>;
  }

  type provideOptions<T> = {
    keepalive?: boolean;
    snapshot?: boolean; // 沙箱模式，是否是快照模式
    parent?: T;
    shareScope?: Array<string>;
  };
  interface SandboxTreeInterface<T> {
    root: T | null;
    derive(node: T, parent?: T): T;
  }
  interface SandboxManagerInterface {
    provide(name, options): void;
    active(node: string): void;
    inactive(node): void;
  }
}
