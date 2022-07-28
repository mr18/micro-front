/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sandbox } from '../../sandbox/sandbox';

/**
 * @jest-environment jsdom
 */
describe('sandbox property', () => {
  // Sandbox 取值测试
  // Sandbox 创建之前，创建全局快照
  // Sandbox 中只可读取快照中的值

  test('sanbox can read global property, but cant not set global vars', async () => {
    global.key = 'key';
    const SDbox = new Sandbox(true, ['share']).currentWindow as any;
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
    const SDboxChild = new Sandbox(SDbox, ['share']).currentWindow as any;

    // 变量之间无污染
    expect(global.key2).toBe(undefined);
    expect(SDboxCk.key2).toBe('key2');
    expect(SDboxChild.key2).toBe(undefined);

    // 顶层global中的变量全局共享
    expect(SDboxChild.key11).toBe(global.key11);
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
