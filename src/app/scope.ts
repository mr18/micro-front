import { Sandbox } from 'src/sandbox';
import { SandboxNode } from 'src/sandbox/sandboxNode';
import { fetchSource } from './patch';

export type ScopeOptions = {
  name: string;
  keepalive: boolean;
  node: Sandbox;
  parent?: SandboxNode;
};
export class Scope extends SandboxNode {
  scriptsMap = new Map<string, Promise<string>>();
  stylesMap = new Map<string, Promise<string>>();
  constructor(optins: ScopeOptions) {
    super(optins.name, optins.keepalive, optins.node, optins.parent);
  }
  pickSource(url: string, type: string) {
    if (type === 'script') {
      this.scriptsMap.set(url, this.pitchSource(url));
    }
  }
  pitchSource(url: string) {
    if (/http(s?):/.test(url)) {
      return fetchSource(url);
    }
  }
}
