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
    this.depsId = new Set();  //不能放重复项
    this.deps = [];
    this.get();
  }
  addDep(dep) { //watcher里不能放重复的dep dep里不能放重复的watcher
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.depsId.add(id);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }
  get() {
    pushTarget(this); //把watcher存起来 Dep.target
    this.getter();  //渲染watcher执行
    popTarget();  //移除watcher
  }
  update() {
    this.get();
  }
}

export default Watcher;