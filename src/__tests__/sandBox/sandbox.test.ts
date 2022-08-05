/**
 * @jest-environment-options {"href": "https://jestjs.io/"}
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GlobalProxy } from 'sandbox';
import { Sandbox } from '../../sandbox/sandbox';

describe('sandbox property', () => {
  // Sandbox 取值&赋值测试

  test('sanbox can read global vars, but cant not effect parent sandbox or global vars', async () => {
    global.key = 'key';
    const SDboxPoxySp = new Sandbox();
    const SDboxPoxySp1 = new Sandbox(); // 继承SDboxPoxySp模式
    const SDboxPoxy1 = new Sandbox();

    expect(SDboxPoxySp.currentWindow.key).toBe(global.key);
    expect(SDboxPoxySp1.currentWindow.key).toBe(global.key);
    expect(SDboxPoxy1.currentWindow.key).toBe(global.key);

    // snapshot sanbox 无法读取之后定义的值无法获取
    global.key2 = 'key2';
    expect(SDboxPoxySp.currentWindow.key2).toBe('key2');
    expect(SDboxPoxySp1.currentWindow.key2).toBe('key2');
    expect(SDboxPoxy1.currentWindow.key2).toBe(global.key2);

    // sanbox 定义的值无法获取，不共享

    SDboxPoxySp.currentWindow.a = 'a';
    SDboxPoxySp1.currentWindow.b = 'b';
    SDboxPoxy1.currentWindow.c = 'c';

    expect(global.a).toBe(undefined);
    expect(global.b).toBe(undefined);
    expect(global.c).toBe(undefined);

    expect(SDboxPoxySp.currentWindow.b).toBe(undefined);
  });

  test('global vars is share in all sanboxs', async () => {
    const SDboxPoxySp = new Sandbox();
    const SDboxPoxySp1 = new Sandbox([]); // 继承SDboxPoxySp模式
    const SDboxPoxy1 = new Sandbox();

    const location = global.location;

    // (SDboxPoxy1.currentWindow.location as any).href = 'http://xxx.com';

    expect(SDboxPoxySp.currentWindow.location).toBe(location);
    expect(SDboxPoxySp1.currentWindow.location).toBe(location);
    expect(SDboxPoxy1.currentWindow.location).toBe(location);

    const body = document.body;
    // 共享同一个document
    const div = document.createElement('div');
    document.body.appendChild(div);
    expect((SDboxPoxySp1.currentWindow.document as Document).body).toBe(body);
    expect((SDboxPoxy1.currentWindow.document as Document).body).toBe(body);
  });

  test('share data is shared in all sandbox and global', async () => {
    const shareKeys = ['share', 'vars'];
    const subSahreKeys = ['share', 'vars', 'subkeys'];

    const SDboxPoxySp = new Sandbox(shareKeys);
    const SDboxPoxySp1 = new Sandbox(shareKeys);
    const SDboxPoxySp2 = new Sandbox(subSahreKeys);

    const SDboxPoxy = new Sandbox();
    const SDboxPoxy1 = new Sandbox(shareKeys);
    const SDboxPoxy2 = new Sandbox(subSahreKeys);

    global.share = Object.create({ a: 1 });

    expect(SDboxPoxySp.currentWindow.share).toBe(global.share);
    expect(SDboxPoxySp2.currentWindow.share).toBe(global.share);
    expect(SDboxPoxy2.currentWindow.share).toBe(global.share);

    SDboxPoxy1.currentWindow.share = { s: 1 };

    expect(SDboxPoxySp2.currentWindow.share).toBe(global.share);
    expect(SDboxPoxy1.currentWindow.share).toBe(global.share);
    expect(SDboxPoxySp1.currentWindow.share).toBe(global.share);

    SDboxPoxy2.currentWindow.subkeys = { a: 's' };

    expect(SDboxPoxySp2.currentWindow.subkeys).toBe(global.subkeys);
    expect(SDboxPoxy1.currentWindow.subkeys).toBe(global.subkeys);

    (SDboxPoxySp2.currentWindow.subkeys as GlobalProxy).b = { b: 'b' };

    expect(SDboxPoxy.currentWindow.subkeys).toBe(global.subkeys);
    expect(SDboxPoxy2.currentWindow.subkeys).toBe(global.subkeys);
    expect(SDboxPoxySp.currentWindow.subkeys).toBe(global.subkeys);

    expect(SDboxPoxySp.currentWindow.vars).toBe(undefined);
    expect(global.vars).toBe(undefined);
  });
});
