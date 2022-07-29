/* eslint-disable @typescript-eslint/no-explicit-any */

import { Sandbox } from '../../sandbox';

/**
 * @jest-environment jsdom
 */
describe('sandbox property', () => {
  // Sandbox 取值测试
  // Sandbox 创建之前，创建全局快照
  // Sandbox 中只可读取快照中的值
  test('sanbox can read global property, but cant not set global vars', async () => {
    global.key = 'key';
    // snapshot 快照模式
    const SDboxInstance = new Sandbox(true, ['share']);
    const SDbox = SDboxInstance.currentWindow as any;
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

    global.key11 = 'key11';
    SDboxCk.key2 = 'key2';
    const SDboxChildInstance = new Sandbox(SDboxInstance, ['share']);
    const SDboxChild = SDboxChildInstance.currentWindow as any;

    // 变量之间无污染
    expect(global.key2).toBe(undefined);
    expect(SDboxCk.key2).toBe('key2');
    expect(SDboxChild.key2).toBe(undefined);

    // 快照模式，可读取默认的全局变量
    expect(SDboxChild.global).toBe(SDboxChild.global);

    // 快照模式，只能读取快照中的值
    expect(SDboxChild.key11).toBe(undefined);
    expect(SDbox.key1).toBe(undefined);

    // 全局共享数据，统一设置
    SDboxChild.share = { a: 1 };
    expect(SDboxChild.share).toBe(SDbox.share);
    expect(SDbox.share).toBe(global.share);

    (SDbox.share as any).b = { sa: 1 };
    expect(SDboxChild.share).toBe(global.share);
    expect(SDbox.share).toBe(global.share);

    SDbox.share = 'share';
    expect(SDboxChild.share).toBe(global.share);
    expect(SDbox.share).toBe(global.share);

    // snapshot 非快照模式
    const SDbox2Instance = new Sandbox(false, ['share']);
    const SDbox2 = SDbox2Instance.currentWindow as any;
    const SDbox21 = new Sandbox(SDbox2Instance).currentWindow as any;

    // 可读取快照之后的变量
    SDbox21.share = 10;
    global.key3 = 'key3';
    expect(SDbox2.key3).toBe(global.key3);

    SDbox2.key3 = 11;
    expect(SDbox2.key3).toBe(11);
    expect(SDbox21.key3).toBe(global.key3);

    delete SDbox2.key3;
    expect(SDbox2.key3).toBe(global.key3);
    expect(SDbox21.key3).toBe(global.key3);

    // 变量值，必须手动赋值后才会修改
    Object.defineProperty(SDbox2, 'key3', { value: 20 });

    expect(SDbox2.key3).toBe(20);

    expect(SDbox21.key3).toBe(global.key3);

    Object.defineProperty(global, 'key3', { value: 20 });

    expect(SDbox21.key3).toBe(global.key3);

    SDbox21.key3 = 21;
    expect(SDbox21.key3).toBe(21);

    Object.defineProperty(SDbox21, 'key3', { value: 33 });
    expect(SDbox21.key3).toBe(33);

    expect(SDbox21.key11).toBe(global.key11);
    expect(SDbox2.key).toBe(global.key);
    expect(SDbox2.share).toBe(global.share);

    expect(SDbox21.share).toBe(10);
  });
});
