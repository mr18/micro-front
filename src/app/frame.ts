import { ManagerInterface, ScopeOptions } from '@micro-front/types';
import { Application } from './app';
import { Scope } from './scope';

export class FrameWork implements ManagerInterface<Application> {
  nodeNameList = new Map<string, Application>();
  provide(instance: Application, options: ScopeOptions): Scope {
    // name 不能重复
    if (this.nodeNameList.get(instance.name) !== undefined) {
      throw new Error(`can not provide same sandbox named:${instance.name}.`);
    }
    const scope = new Scope(options);
    this.nodeNameList.set(instance.name, instance);
    return scope;
  }

  active(name: string | Application) {
    let node: Application;
    if (name instanceof Application) {
      node = this.nodeNameList.get((name as Application).name) as Application;
    } else {
      node = this.nodeNameList.get(name) as Application;
    }

    if (node) {
      node.scope.weakup();
    } else {
      throw new Error('sandbox node does not exist, can not active!');
    }
  }
  inactive(name: string | Application) {
    let node: Application;
    if (name instanceof Application) {
      node = this.nodeNameList.get((name as Application).name) as Application;
    } else {
      node = this.nodeNameList.get(name) as Application;
    }
    if (node) {
      if (node.keepalive) {
        node.scope.sleep();
      } else {
        node.scope.destory();
        this._destory(node);
      }
    } else {
      throw new Error('sandbox node does not exist, can not inactive!');
    }
  }
  private _destory(node: Application) {
    this.nodeNameList.delete(node.name);
  }
}
