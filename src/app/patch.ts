import { Scope } from './scope';

export const rewriteAddEventListener = (scope: Scope) => {
  const win = scope.currentWindow;
  const snapshotMap = scope.snapshotMap.set('addEventListener', new Map());
  const addEventListener = (type: string, listener: any, options?: boolean | AddEventListenerOptions) => {
    snapshotMap.set(type, { listener, options });
    window.addEventListener(type, listener, options);
  };
  win.addEventListener = addEventListener;
};

export const rewriteSetInterval = (scope: Scope) => {
  const win = scope.currentWindow;
  const snapshotMap = scope.snapshotMap.set('setInterval', new Map());
  const setInterval = (handler: TimerHandler, timeout?: number) => {
    snapshotMap.set(handler, timeout);
    window.setInterval(handler, timeout);
  };
  win.setInterval = setInterval;
};
export const rewriteSetTimeout = (scope: Scope) => {
  const win = scope.currentWindow;
  const snapshotMap = scope.snapshotMap.set('setTimeout', new Map());
  const setTimeout = (handler: TimerHandler, timeout?: number) => {
    snapshotMap.set(handler, timeout);
    window.setTimeout(handler, timeout);
  };
  win.setTimeout = setTimeout;
};
