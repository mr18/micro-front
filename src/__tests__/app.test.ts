/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from 'src/app';
import Logger from '../utils/logger';

describe('sandbox manager', () => {
  // Sandbox 管理，
  // 可以同时允许多实例存在
  beforeAll(() => {
    Logger.error = jest.fn();
    global.fetch = async () => {
      return new Promise((resolve: (t: any) => void, reject: (t: any) => void) => {
        const fn = jest.fn();
        if (fn) {
          resolve({
            status: 200,
            text: () => {
              return 'console.log("321321")';
            },
          });
          fn();
          expect(fn).toBeCalled();
        } else {
          reject(new Error());
        }
      }).catch((e) => {
        console.log(e);
      });
    };
  });
  test('create app', async () => {
    document.body.innerHTML = `<div id='micro'></div>`;

    const App = new Application({
      name: 'app1',
      url: 'http://localhost:8801/',
      container: '#micro',
    });
    App.run();
  });
});
