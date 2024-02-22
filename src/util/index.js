
/**
 * 当前数据是不是对象
 * @param {*} data 
 * @returns 
 */
export function isObject(data) {
  return typeof data === 'object' && data !== null;
}

export function def(data, key, value) {
  Object.defineProperty(data, key, {
    enumerable: false,
    configurable: false,
    value
  })
}