import { isObject, isReservedTag } from '../util/index';

export function createElement(vm, tag, data = {}, ...children) {
  let key = data.key;
  if (key) {
    delete data.key;
  }

  if (isReservedTag) {
    return vnode(tag, data, key, children, undefined);
  } else {
    // 组件 找到组件的定义
    let Ctor = this.$options.components[tag];
    return createComponent(vm, tag, data, key, children, Ctor);
  }
}

function createComponent(vm, tag, data, key, children, Ctor) {
  if (isObject(Ctor)) {
    Ctor = vm.$options._base.extend(Ctor);
  }
  return vnode(`vue-component-${Ctor.cid}-${tag}`, data, key, undefined, { Ctor, children });
}

export function createTextNode(text) {
  return vnode(undefined, undefined, undefined, undefined, text);
}

function vnode(tag, data, key, children, text, componentOptions) {
  return {
    tag,
    data,
    key,
    children,
    text,
    componentOptions
  }
}
// 虚拟节点就是通过_c _v实现用对象来描述dom的操作（对象）

// 将template转成ast语法树 -> 生成render方法 -> 生成虚拟dom -> 真实的dom
// 重新生成虚拟dom -> 更新dom
// {
//   tag: 'div',
//   key: undefined,
//   data: { },
//   children: [],
//   text: undefined
// }