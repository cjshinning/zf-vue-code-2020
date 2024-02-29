// vue的核心代码 只是vue的一个声明
import { initMixin } from './init';
import { renderMixin } from './render';
import { lifecycleMixin } from './lifecycle';
import { initGlobalAPI } from './initGlobalAPI/index';
function Vue(options) {
  // 进行vue的初始化工作
  this._init(options);
}

initMixin(Vue); //给vue原型上添加一个_init方法
renderMixin(Vue);
lifecycleMixin(Vue);

// 初始化全局的api
initGlobalAPI(Vue);

// demo 产生两个虚拟节点进行比对
// template => render方法 => vnode
import { compileToFunction } from './compiler/index';
import { createElm, patch } from './vdom/patch';
let vm1 = new Vue({
  data: { name: 'hello' }
})
let render1 = compileToFunction(`<div id="app" a="1" style="background:red">
  <div style="background:red" key="A">A</div>
  <div style="background:yellow" key="B">B</div>
  <div style="background:blue" key="C">C</div>
  <div style="background:green" key="D">D</div>
</div>`)
let vnode = render1.call(vm1);

let el = createElm(vnode);
document.body.appendChild(el);


let vm2 = new Vue({
  data: { name: 'jenny', age: 18 }
})
// 1. 标签不一致
let render2 = compileToFunction(`<div id="aaa" b="2" style="color:blue">
  <div style="background:red" key="A">A</div>
  <div style="background:yellow" key="B">B</div>
  <div style="background:blue" key="C">C</div>
  <div style="background:green" key="D">D</div>
  <div style="background:purple" key="E">E</div>
</div>`)
let newVnode = render2.call(vm2);

setTimeout(() => {
  patch(vnode, newVnode); //传入两个虚拟节点 会在内部进行比对
}, 3000)

// 1.diff算法的特点是 平级比对，我们正常操作dom元素，很少涉及到父变成子，子变成父 O(n)

export default Vue;