export const sanboxVal = (sandbox, key) => {
  return sandbox.currentWindow[key];
};
