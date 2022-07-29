import { SandboxManager } from '.';
import { Frame } from './frame';
import { Scope } from './scope';

const FrameWork = new Frame();
export class App {
  manager: SandboxManager;
  scope: Scope;
  constructor(name, scope: Scope) {
    FrameWork.provide(name);
  }
  run() {
    for (const [, code] of this.scope.scriptsMap) {
      this.runScript(code);
    }
  }
  runScript(script: Promise<string>) {
    console.log(script);
  }
}
