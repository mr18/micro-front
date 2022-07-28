import Logger, { LogLevel } from './utils/logger';
export { defineCustomElement } from './component/index';
export { SandboxManager } from './sandbox/index';
export { Sandbox } from './sandbox/sandbox';
Logger.level = LogLevel.log;
