
// 需要重写数组的那些方法 7个 push shift unshift pop reverse sort splice
let oldArrayMethods = Array.prototype;
// 原型链查找的问题，会向上查找，先查找我重写的，重写的没有会继续向上查找
// value.__proto__ = arrayMethods
// arrayMethods.__proto__ = oldArrayMethods
export let arrayMethods = Object.create(oldArrayMethods);

const methods = [
  'push',
  'shift',
  'unshift',
  'pop',
  'reverse',
  'sort',
  'splice'
];
methods.forEach(method => {
  arrayMethods[method] = function (...args) {
    const result = oldArrayMethods[method].apply(this, args);  //调用原生的数组方法

    // push unshift 添加的元素可能还是一个对象
    let inserted; //当前用户插入的元素
    let ob = this.__ob__;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':  //3个 新增的属性  arr.splice(0,1,{name:1})
        inserted = args.slice(2);
        break;
      default:
        break;
    }
    if (inserted) ob.oberverArray(inserted);

    ob.dep.notify();  //如果用户调用了push方法，会通知当前这个dep去更新
    return result;
  }
})
