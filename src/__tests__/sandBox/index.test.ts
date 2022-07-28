/* eslint-disable @typescript-eslint/no-explicit-any */
import { SandboxManager } from '../../sandbox/index';
import { Sandbox } from '../../sandbox/sandbox';
import Logger, { LogLevel } from '../../utils/logger';
 

/**
 * @jest-environment jsdom
 */
describe('sandbox property', () => {
  // Sandbox 取值测试
  // Sandbox 创建之前，创建全局快照
  // Sandbox 中只可读取快照中的值

  test('sanbox can read global property, but cant not set global vars', async () => {
    global.key = 'key';
    const SDbox = new Sandbox(global, ['share']).currentWindow as any;
    const location = global.location;
    expect(SDbox.location).toBe(location);

    SDbox.location = {};
    expect(global.location).toBe(location);

    const SDboxCk = () => {
      console.log('SDbox');
    };
    const globalCk = () => {
      console.log('global');
    };
    SDbox.onclick = SDboxCk;
    global.onclick = globalCk;
    expect(SDbox.onclick).toBe(SDboxCk);
    expect(global.onclick).toBe(globalCk);

    global.key1 = 'key1';
    expect(SDbox.key).toBe('key');
    expect(SDbox.key1).toBe(undefined);

    global.key2 = 'key1';
    SDboxCk.key2 = 'key2';
    const SDboxChild = new Sandbox(SDbox, ['share']).currentWindow as any;

    // 变量之间无污染
    expect(SDboxChild.key2).toBe(undefined);
    expect(global.key2).toBe('key1');
    expect(SDboxCk.key2).toBe('key2');

    expect(SDboxChild.global).toBe(global.global);

    // 全局共享数据，统一设置
    SDboxChild.share = { a: 1 };
    expect(SDboxChild.share).toBe(global.share);
    expect(SDbox.share).toBe(global.share);

    (SDbox.share as any).b = { sa: 1 };
    expect(SDboxChild.share).toBe(global.share);
    expect(SDbox.share).toBe(global.share);

    SDbox.share = 'share';
    expect(SDboxChild.share).toBe(global.share);
    expect(SDbox.share).toBe(global.share);
  });
});
describe('sandbox manager', () => {
  // Sandbox 管理，
  // 同时可以允许多实例存在

  test('sandbox can be add & remove from sandboxNode tree', async () => {
    const manager = new SandboxManager();
    const node = manager.provide('1', true);

    const node2 = manager.provide('2', false, node);
    const node3 = manager.provide('3', true, node);

    const nodea = manager.provide('a', true);
    const nodeb = manager.provide('b', true, nodea);
    const nodec = manager.provide('c', false, nodea);

    expect(node.name).toBe('1');
    expect(node2.name).toBe('2');

    expect(manager.findSandBox('b')).toBe(nodeb);
    expect(manager.findSandBox('c')).toBe(nodec);

    // 失效，不保持状态，需要删除
    manager.inactive('2');
    expect(manager.findSandBox('2')).toBe(undefined);

    // 保持状态，不需要删除
    manager.inactive('3');
    expect(manager.findSandBox('3')).toBe(node3);

    manager.active('2');

    const nodex = manager.provide('x', true, node2);
    const nodey = manager.provide('y', true, nodec);
    const nodez = manager.provide('z', false, nodey);

    expect(nodex).toBe(undefined);
    expect(nodez.parent).toBe(nodey);
    expect(nodez.top).toBe(nodea);
  });
});
