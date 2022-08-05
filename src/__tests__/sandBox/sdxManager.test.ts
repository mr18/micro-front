/* eslint-disable @typescript-eslint/no-explicit-any */
import Logger from '../../utils/logger';

describe('sandbox manager', () => {
  // Sandbox 管理，
  // 可以同时允许多实例存在
  beforeAll(() => {
    Logger.error = jest.fn();
  });
  test('sandbox can be add & remove from sandboxNode tree', async () => {});
});
