export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {

  }
}

export function mountComponent(vm, el) {
  const options = vm.$options;  //render
  vm.$el = el;
  console.log(options, vm.$el);

  // Watcher 就是用来渲染的
  // vm._render 通过解析的render方法 渲染出虚拟dom
  // vm._update 通过虚拟dom 创建真实的dom

  // 渲染页面
  let updateComponent = () => { //无论渲染还是更新都会调用此方法
    // 返回的是虚拟dom
    vm._update(vm._render());
  }
  // 渲染watch 每个组件都有一个watcher vm.$watch
  new Watcher(vm, updateComponent, () => { }, true);  //true表示是渲染watcher
}