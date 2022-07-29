export const defineFreezeProperty = (target: object, key: string, value: unknown) => {
  Object.defineProperty(target, key, { value, configurable: false, writable: false, enumerable: false });
};
export const defineConfigurableProperty = (target: object, key: string, value: unknown) => {
  Object.defineProperty(target, key, { value, configurable: true, writable: true, enumerable: true });
};
export const objectHasProperty = (target: object, key: PropertyKey) => {
  return Object.prototype.hasOwnProperty.call(target, key);
};

export const getOwnPropertyNames = (target: object, key: PropertyKey) => {
  return Object.getOwnPropertyNames.call(target, key);
};
export const createObjectSnapshot = (obj: object) => {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
};

