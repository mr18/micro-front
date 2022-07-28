export type globalType = Window & Record<PropertyKey>;

export interface SandboxInterface<T> {
  SHARE_DATA_KEYS: Array<string> = [];
  parentWindow: T = null;
  currentWindow: T;
  setup(): vod;
}
export interface SandboxTreeInterface<T> {
  root: T | null;
  derive(name, keepalive, parent: T): T;
}
export interface SandboxManagerInterface {
  active(node): void;
  inactive(node): void;
}
export type NodeType = {
  node: Sandbox;
  parent: NodeType | null | undefined;
  children: Set<NodeType>;
  name: string;
  top: NodeType;
  keepalive: boolean;
};
