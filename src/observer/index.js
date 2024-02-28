// 把data中的数据 都使用Object.defineProperty重新定义 es5
import { arrayMethods } from './array';
import { isObject, def } from '../util/index';
import Dep from './dep';

class Observer {
  constructor(value) {
    this.dep = new Dep(); //给数组
    // 如果vue数据的层次过多 需要地怪的去解析对象中的熟悉，依次增加set和get方法
    // vue3 proxy
    // value.__ob__ = this;  //给每一个监控过的对象都增加一个__ob__属性
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      // 如果是数组的话并不会对索引进行观测 因为会导致性能问题
      // 前端开发中很少操作索引 push shift unshift
      // 如果数组里放的是对象我再监控
      value.__proto__ = arrayMethods;
      this.oberverArray(value);
    } else {
      // 对象数据监控
      this.walk(value);
    }
  }
  walk(data) {
    let keys = Object.keys(data);  // ['name', 'age', 'address']
    keys.forEach((key) => {
      defineReactive(data, key, data[key]); //定义响应式数据
    })
  }
  oberverArray(value) {
    for (let i = 0; i < value.length; i++) {
      observe(value[i]);
    }
  }
}

function defineReactive(data, key, value) {
  let dep = new Dep();
  // 这个value可能是数组，也可能是对象，返回的结果是observer的实例，当前的value对应的是observer
  let childOb = observe(value); //递归实现深度检测
  Object.defineProperty(data, key, {
    configurable: true,
    enumerable: true,
    get() { //获取值的时候做一些操作
      console.log('取值');  //每个属性都对应自己的watcher
      if (Dep.target) { //如果当前有watcher
        dep.depend(); //意味着我要将watcher存起来
        if (childOb) {  //数组的依赖收集
          childOb.dep.depend(); //收集了数组的相关依赖

          // 如果数组中还有数组
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set(newValue) { //设置值的时候做一些操作
      console.log('更新数据');
      if (newValue === value) return;
      observe(newValue);  //继续劫持用户设置的值，因为有可能用户设置的值是个对象
      value = newValue;
      dep.notify(); //通知依赖的watcher来进行更新操作
    }
  });
}

function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    let current = value[i];
    current.__ob__ && current.__ob__.dep.depend();
    if (Array.isArray(current)) {
      dependArray(current);
    }
  }
}

// Object.defineProperty 不能兼容ie8以及以下 vue2无法兼容ie8版本
export function observe(data) {
  let isObj = isObject(data);
  if (!isObj) return;
  return new Observer(data);  //用来观测数据
}