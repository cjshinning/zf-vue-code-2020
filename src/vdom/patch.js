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