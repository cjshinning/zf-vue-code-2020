let id = 0;
class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; //age:[watcher,watcher]
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
  depend() {
    // 让这个watcher记住我当前的dep
    Dep.target.addDep(this);
    // this.subs.push(Dep.target);
  }
  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}

let stack = [];
export function pushTarget(watcher) {
  Dep.target = watcher;
  stack.push(watcher);
}

export function popTarget() {
  stack.pop();
  Dep.target = stack[stack.length - 1];
}

export default Dep;