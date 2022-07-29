import { Node } from 'sandbox';
import { Sandbox } from 'src/sandbox';
import { SandboxNode } from 'src/sandbox/sandboxNode';
import { fetchSource } from './patch';

export type ScopeOptions = {};
export class Scope<T extends Sandbox, U extends Node<T>> extends SandboxNode<T, U> {
  scriptsMap = new Map<string, Promise<string>>();
  stylesMap = new Map<string, Promise<string>>();
  constructor(optins: ScopeOptions & { name: string; keepalive: boolean; node: T; parent: U }) {
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
