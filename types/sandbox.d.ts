declare module 'sandbox' {
  type GlobalProxyType = Window & {
    currentWindow: GlobalProxy;
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
  interface ManagerInterface<N> {
    nodeNameList: Map<string, N>;
    // provide(name: string, options): N;
    // active(node: string | N): void;
    // inactive(node: string | N): void;
  }

  type SourceType = {
    [key: string]: any;
    url: string;
    promise?: Promise<any>;
    result?: string | undefined;
    type?: string;
  };

  type StyleSourceType = {
    ele?: HTMLElement;
    fileName?: string;
  } & SourceType;
  type ScriptSourceType = {
    defer?: boolean;
    async?: boolean;
    module?: boolean;
    nomodule?: boolean;
    onload?: (e: any) => void;
    onerror?: (e: any) => void;
  } & StyleSourceType;

  type NodeTypeOptions = {
    shareScope?: Array<string>;
  };
  type ScopeOptions = {
    keepalive?: boolean;
  } & NodeTypeOptions;

  type AppOptions = {
    name?: string;
    url: string;
    keepalive?: boolean;
    container: string | Element;
    fetch?: (url: string, options?: object) => Promise<any>;
  } & ScopeOptions;

  type HtmlSourceType = {
    sources: Map<string, StyleSourceType | ScriptSourceType>;
    fragment: {
      [key: string]: HTMLElement;
    };
  };
}
