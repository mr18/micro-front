import { SourceType } from '@micro-front/types';
const fetchMap = new Map();
export const defineFetch = (name: string, fetch) => {
  fetchMap.set(name, fetch);
};
export const releaseFetch = (name: string) => {
  fetchMap.delete(name);
};
export const nativefetchSource = (url: string, options?: RequestInit) => {
  return new Promise((resolve, reject) => {
    global
      .fetch(url, options)
      .then((res) => {
        if (res.status >= 200 && res.status < 400) {
          if (res.status === 302) {
            // location.href = res.data
            reject(res);
          } else {
            resolve(res.text());
          }
        } else {
          reject(res);
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const fetchSourceByName = (name: string, url: string, options?: object) => {
  const cFetch = fetchMap.get(name);
  if (cFetch) {
    return cFetch(url, options);
  } else {
    return nativefetchSource(url, options);
  }
};
export const scheduleTask = (fn: () => void) => {
  try {
    if (Promise && Promise.resolve) {
      Promise.resolve().then(fn);
    } else if (setImmediate) {
      setImmediate(fn);
    } else {
      setTimeout(fn, 0);
    }
  } catch (error) {
    console.log(error);
  }
};
// 异步任务以同步的方式执行
export const scheduleAsyncAsSync = async <T extends SourceType>(options: {
  iterator: IterableIterator<T> | T[] | Set<T>;
  beforeResolve?: (task: T, res: string) => void;
  afterResolve?: (task: T, res: string) => void;
}): Promise<T[]> => {
  return new Promise((resolve: (t: T[]) => void, reject: (e: Error) => void) => {
    let iterator = options.iterator;
    if (iterator[Symbol.iterator]) {
      iterator = iterator[Symbol.iterator]();
    }
    const queue: T[] = [];
    let prev: string;
    const runTask = async (iterator: IterableIterator<T>) => {
      const task = iterator.next();
      // 任务结束
      if (task.done) {
        resolve(queue);
      } else {
        try {
          options.beforeResolve && options.beforeResolve(task.value, prev);
          // 每次任务执行之前的回调
          const result: string = await task.value.promise;
          // 每次任务执行完后的回调
          options.afterResolve && options.afterResolve(task.value, result);
          task.value.result = result;
          prev = result;
          queue.push(task.value);
          // 任务结束
          if (task.done) {
            resolve(queue);
          } else {
            runTask(iterator);
          }
        } catch (e) {
          reject(e);
          throw e;
        }
      }
    };
    runTask(iterator as IterableIterator<T>);
  });
};
// 并行执行异步任务
export const scheduleAsyncAsParallel = async <T extends SourceType>(options: {
  iterator: IterableIterator<T> | T[] | Set<T>;
  beforeResolve?: (task: T) => void;
  afterResolve?: (task: T, res: string) => void;
  afterReject?: (task: T, res: string) => void;
}) => {
  return new Promise((resolve: (t?: any) => void) => {
    let iterator = options.iterator;
    if (iterator[Symbol.iterator]) {
      iterator = iterator[Symbol.iterator]();
    }
    let task = (iterator as IterableIterator<T>).next();
    while (!task.done) {
      try {
        const promise = task.value.promise;
        if (promise) {
          promise.then(
            ((promise) => {
              return (result: string) => {
                // 每次任务执行之前的回调
                options.beforeResolve && options.beforeResolve(promise);
                promise.result = result;
                // 每次任务执行完后的回调
                options.afterResolve && options.afterResolve(promise, result);
              };
            })(task.value),
          );
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
      task = (iterator as IterableIterator<T>).next();
    }
    resolve();
  });
};
