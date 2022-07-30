import { ScopeInterface } from 'sandbox';
import { NodeTypeOptions, SandboxNode } from 'src/sandbox/sandboxNode';
import { fetchSource, parseSource } from './patch';
export type ScopeOptions = {
  keepalive?: boolean | undefined;
} & NodeTypeOptions;

export class Scope extends SandboxNode implements ScopeInterface {
  scriptsMap = new Map<string, Promise<any>>();
  stylesMap = new Map<string, Promise<any>>();
  keepalive: boolean | undefined;
  constructor(name: string, options: ScopeOptions) {
    super(name, options);
    this.keepalive = options.keepalive;
  }
  pickSource(url: string, type: string) {
    if (url && type === 'script') {
      this.scriptsMap.set(url, this.pitchSource(url));
    }
  }
  pitchSource(url: string) {
    if (/http(s?):/.test(url)) {
      return fetchSource(url);
    }
    return parseSource(url);
  }

  sleep() {
    console.log('sleep');
  }

  destory() {
    console.log('destory');
  }

  weakup() {
    console.log('destory');
  }
}
