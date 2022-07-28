/* eslint-disable @typescript-eslint/no-explicit-any */
export const LogLevel = {
  log: 1,
  warn: 2,
  error: 3,
};

const Logger = {
  level: 0,
  warn: (...arg: any) => {
    if ((Logger as any).level >= LogLevel.warn) {
      console.warn(...arg);
    }
  },
  log: (...arg: any) => {
    if ((Logger as any).level >= LogLevel.log) {
      // console.log(stack);
      // console.log(typeof new Error().stack);
      console.trace(...arg);
    }
  },
  error: (...arg: any) => {
    if ((Logger as any).level >= LogLevel.error) {
      console.error(...arg);
      // throw new Error(arg);
    }
  },
};

// export default process.env.NODE_ENV === 'development' ? Logger : console;

export default console;
