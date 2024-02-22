
/**
 * 当前数据是不是对象
 * @param {*} data 
 * @returns 
 */
export function isObject(data) {
  return typeof data === 'object' && data !== null;
}