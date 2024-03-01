export function patch(oldVnode, vnode) {
  // 1.判断是更新还是要渲染
  if (!oldVnode) {
    // 这个是组件的挂载 vm.$mount()
    // 通过当前虚拟节点 创建元素并返回
    return createElm(vnode);
  } else {

    const isRealElement = oldVnode.nodeType;
    if (isRealElement) {
      const oldElm = oldVnode;  //div id="app"
      const parentElm = oldElm.parentNode;  //body

      let el = createElm(vnode);
      parentElm.insertBefore(el, oldElm.nextSibling);
      parentElm.removeChild(oldElm);

      return el;
    } else {
      // console.log(oldVnode, vnode);
      // 比对两个虚拟节点 操作真实的dom
      // 1. 标签不一致直接替换即可
      if (oldVnode.tag !== vnode.tag) {
        oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
      }

      // 2. 如果是文本，内容不一致直接替换掉文本
      if (!oldVnode.tag) {
        if (oldVnode.text !== vnode.text) {
          oldVnode.el.textContent = vnode.text;
        }
      }

      // 3. 说明标签一致，而且不是文本(比对属性是否一致)
      let el = vnode.el = oldVnode.el;
      updateProperties(vnode, oldVnode.data);

      // 需要比对儿子
      let oldChildren = oldVnode.children || [];
      let newChildren = vnode.children || [];

      if (oldChildren.length > 0 && newChildren.length > 0) {
        // 新老都有儿子 需要对比里面的儿子
        updateChildren(el, oldChildren, newChildren);
      } else if (newChildren.length > 0) {
        // 新的有孩子，老的没有孩子，直接将孩子虚拟节点转换成真实节点 插入即可
        for (let i = 0; i < newChildren.length; i++) {
          let child = newChildren[i];
          el.appendChild(createElm(child));
        }
      } else if (oldChildren.length > 0) {
        // 老的有孩子，新的没孩子
        el.innerHTML = '';
      }
    }
  }
  // 递归创建真实节点，替换掉老的节点
}

function isSameVnode(oldVnode, newVnode) {
  return (oldVnode.tag === newVnode.tag) && (oldVnode.key === newVnode.key);
}

function updateChildren(parent, oldChildren, newChildren) {
  // vue采用的是双指针的方式

  // vue在内部比对的过程中做了很多优化策略

  let oldStartIndex = 0;
  let oldStartVnode = oldChildren[0];
  let oldEndIndex = oldChildren.length - 1;
  let oldEndVnode = oldChildren[oldEndIndex];

  let newStartIndex = 0;
  let newStartVnode = newChildren[0];
  let newEndIndex = newChildren.length - 1;
  let newEndVnode = newChildren[newEndIndex];

  const makeIndexByKey = (children) => {
    let map = {};
    children.forEach((item, index) => {
      if (item.key) {
        // 根据key创建一个映射表
        map[item.key] = index;
      }
    })
    return map;
  }
  let map = makeIndexByKey(oldChildren);
  console.log(map);

  // 在比对的过程中，新老虚拟节点有一方循环完毕就结束
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex];
    }
    // 优化向后插入的情况
    else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 如果是同一个节点，就需要比对这两个元素的属性
      patch(oldStartVnode, newStartVnode);  //比对开头节点
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    }
    // 优化向前插入的情况
    else if (isSameVnode(oldEndVnode, newEndVnode)) {
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    }
    // 头移尾
    else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patch(oldStartVnode, newEndVnode);
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    }
    // 尾移头
    else if (isSameVnode(oldEndVnode, newStartVnode)) {
      patch(oldEndVnode, newStartVnode);
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else {
      // 暴力比对
      let moveIndex = map[newStartVnode.key];
      if (!moveIndex) {
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      } else {
        // 如果在映射表中查找到了，则直接将元素移走，并将当时位置置为空
        let moveVnode = oldChildren[moveIndex]; //要移动的元素
        oldChildren[moveIndex] = undefined;
        parent.insertBefore(moveVnode.el, oldStartVnode.el);
        patch(moveVnode, newStartVnode);
      }
      newStartVnode = newChildren[++newStartIndex];
    }
  }

  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // 将新增的元素直接进行插入 （可能向前插，也可能向后插） insertBefor
      let el = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el;
      parent.insertBefore(createElm(newChildren[i]), el);
    }
  }

  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldChildren[i];
      if (child != undefined) {
        parent.removeChild(child.el);
      }
    }
  }
}

function createComponent(vnode) {  //初始化的作用
  // 需要创建组件的实例
  let i = vnode.data;

  if ((i = i.hook) && (i = i.init)) {
    i(vnode);
  }

  // 执行完毕后
  if (vnode.componentInstance) {
    return true;
  }
}

export function createElm(vnode) { //根据虚拟节点创建真实的节点
  let { tag, children, key, data, text } = vnode;
  // 是标签就创建标签
  // 不是标签就是文本
  if (typeof tag === 'string') {
    // 不是tag是字符串的就是普通的html，还有可能是我们的组件

    // 实例化组件
    if (createComponent(vnode)) { //表示是组件
      // 这里返回的是真实的dom元素
      return vnode.componentInstance.$el;
    }

    vnode.el = document.createElement(tag);
    updateProperties(vnode);
    children.forEach(child => { //递归创建儿子节点，将儿子节点放到父节点中
      return vnode.el.appendChild(createElm(child));
    })
  } else {
    // 虚拟dom上映射着真实dom 方便后续更新操作
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}
// 更新属性
function updateProperties(vnode, oldProps = {}) {
  let newProps = vnode.data || {};

  let el = vnode.el;

  // 如果老的属性中有，新的属性中没有，在真实的dom上将这个属性删除掉

  let newStyle = newProps.style || {};
  let oldStyle = oldProps.style || {};
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = ''; //删除多余的
    }
  }
  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key);
    }
  }

  for (let key in newProps) {
    if (key === 'style') {
      for (let styleName in newProps.style) {
        // 新增样式
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key === 'class') {
      el.className = newProps.class;
    } else {
      el.setAttribute(key, newProps[key]);
    }
  }
}