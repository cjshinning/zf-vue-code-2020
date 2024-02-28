import { pushTarget, popTarget } from './dep';
let id = 0;
class Watcher {
  constructor(vm, exprOrFn, callback, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    this.callback = callback;
    this.options = options;
    this.id = id++;
    this.getter = exprOrFn; //将内部传过来的回调函数，放到getter上

    this.get();
  }
  get() {
    debugger
    pushTarget(this); //把watcher存起来 Dep.target
    this.getter();  //渲染watcher执行
    popTarget();  //移除watcher
  }
  update() {
    this.get();
  }
}

export default Watcher;