// 把data中的数据 都使用Object.defineProperty重新定义 es5

import { isObject } from '../util/index';

class Observer {
  constructor(value) {
    // 如果vue数据的层次过多 需要地怪的去解析对象中的熟悉，依次增加set和get方法
    // vue3 proxy
    this.walk(value);
  }
  walk(data) {
    let keys = Object.keys(data);  // ['name', 'age', 'address']
    keys.forEach((key) => {
      defineReactive(data, key, data[key]); //定义响应式数据
    })
  }
}

function defineReactive(data, key, value) {
  observe(value); //递归实现深度检测
  Object.defineProperty(data, key, {
    get() { //获取值的时候做一些操作
      return value;
    },
    set(newValue) { //设置值的时候做一些操作
      if (newValue === value) return;
      console.log('值发生变化了');
      observe(newValue);  //继续劫持用户设置的值，因为有可能用户设置的值是个对象
      value = newValue;
    }
  });
}

// Object.defineProperty 不能兼容ie8以及以下 vue2无法兼容ie8版本
export function observe(data) {
  let isObj = isObject(data);
  if (!isObj) return;
  return new Observer(data);  //用来观测数据
}