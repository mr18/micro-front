/* eslint-disable @typescript-eslint/no-explicit-any */
import { FrameWork } from '../../app/frame';
import Logger from '../../utils/logger';

describe('sandbox manager', () => {
  // Sandbox 管理，
  // 可以同时允许多实例存在
  beforeAll(() => {
    Logger.error = jest.fn();
  });
  test('sandbox can be add & remove from sandboxNode tree', async () => {
    const manager = new FrameWork();

    const node = manager.provide('1', { keepalive: true });

    const node2 = manager.provide('2', { keepalive: false, parent: node });
    const node3 = manager.provide('3', { keepalive: true, parent: node });

    const nodea = manager.provide('a', { keepalive: true });
    const nodeb = manager.provide('b', { keepalive: true, parent: nodea });
    const nodec = manager.provide('c', { keepalive: false, parent: nodea });

    expect(node?.name).toBe('1');
    expect(node2?.name).toBe('2');

    expect(manager.findNode('b')).toBe(nodeb);
    expect(manager.findNode('c')).toBe(nodec);

    expect(() => manager.provide('2', { keepalive: false, parent: node })).toThrow();
    expect(() => manager.provide('2')).toThrow();

    // // 失效，不保持状态，需要删除
    manager.inactive('2');

    expect(manager.findNode('2')).toBe(undefined);

    // // 保持状态，不需要删除
    manager.inactive('3');
    expect(manager.findNode('3')).toBe(node3);

    // keepalive=false 失效后不可再激活
    expect(() => manager.active('2')).toThrow();

    // 无法在失效后的 sanbox 中挂载新的 sandbox

    expect(() => manager.provide('x', { keepalive: true, parent: node2 })).toThrow();

    const nodey = manager.provide('y', { keepalive: true, parent: nodec });
    const nodez = manager.provide('z', { keepalive: true, parent: nodey });

    expect(nodez?.parent).toBe(nodey);
    expect(nodez?.top).toBe(nodea);
  });
});
