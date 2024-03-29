# 手写vue源码
## 1.rollup的配置
### 依赖安装（注意rollup-plugin-serve会报错）
- npm i -D @babel/core@7.9.0 @babel/preset-env@7.9.5 rollup@2.6.1 rollup-plugin-babel@4.4.0 rollup-plugin-serve@1.0.1 cross-env@7.0.2

## 2.对数据进行监控
- index.js 整合的功能
- init.js 初始化 可以扩展很多原型方法
- state.js 初始化状态流程
- observer/index.js
  把data中的数据都使用Object.defineProperty重新定义

## 3.对象的数据劫持
### 对象的劫持方法：
- observer/index.js 
1. 先判断传入的data是不是对象，如果是使用new Observer()来劫持对象
2. Observer类中使用walk方法对属性进行遍历，并使用defineReactive定义响应式
3. defineReactive中先使用observe(value)进行递归实现深度检测，再使用Object.defineProperty设置get和set进行劫持，获取数据的时候会触发get方法做一些操作，修改数据的时候会触发set方法做另一些操作，比如依赖收集。（注意：在set方法中使用observe(newValue)继续劫持用户设置的值，因为有可能用户设置的值是个对象）

## 4.数组的劫持
### 前提：
- 如果是数组的话并不会对索引进行观测 因为会导致性能问题
- 前端开发中很少操作索引 一般使用 push shift unshift 等方法添加元素
- 如果数组里放的是对象我再监控，基本类型无需监控
### 数组的劫持方法：
- observer/index.js 
1. 先判断传入的data是不是数组，如果是先重写原型arrayMethods，然后设置使用oberverArray方法对数组进行检测
2. oberverArray中遍历数组，对它的每一项使用observe进行观测
- observer/array.js 
### 原型重写：
1. 将数据的__proto__指向arrayMethods，即value.__proto__ = arrayMethods;
2. 对于会改变数组的7个常用方法进行遍历，如果是新增属性需要对新增的属性进行数据劫持，设置新增变量inserted
3. 如果是push或者unshift，新增变量就是传入的参数args，如果是splice，它可能会删除也可能替换也可能新增，由于前两个参数都是常量，改变的只是第3个位置开始的数组，所以是args.slice(2)截取新增或者修改的变量
4. 判断是否新增变量inserted，如果有对新增的变量再次使用oberverArray进行检测（注意这里在observer/index.js 中通过def(value, '__ob__', this);预先添加了__ob__属性，然后在当前文件中使用let ob = this.__ob__;获取到ob）
### 补充splice用法：
array.splice(start[, deleteCount[, item1[, item2[, ...]]]])
- start​ 指定修改的开始位置（从0计数）。如果超出了数组的长度，则从数组末尾开始添加内容；如果是负值，则表示从数组末位开始的第几位（从-1计数，这意味着-n是倒数第n个元素并且等价于 array.length-n）；如果负数的绝对值大于数组的长度，则表示开始位置为第0位。
- deleteCount 可选  整数，表示要移除的数组元素的个数。
- item1, item2, ... 可选 要添加进数组的元素,从 start 位置开始。如果不指定，则 splice() 将只删除数组元素。

## 5.模板编译
- init.js 
  _init方法中判断是否有el，如果有添加$mount方法进行挂载
  $mount方法中默认先回查找有没有render，没有render会采用template，没有template就用el中的内容
  使用compileToFunction对模板进行编译
- compiler/index.js 
  添加各种正则匹配
### ast语法树和虚拟dom
- ast语法树：用对象来描述原生语法  
- 虚拟dom：用对象来描述dom节点

## 6.html-parser
- compiler/index.js 
  parseHTML实现将模板转换成ast语法树，其中主要是用到正则匹配

## 7.将html转换成ast树
- 分别对开始元素、文本、结束元素创建ast语法树
- 结束的时候才能判断是否是子节点

## 8.生成代码
- compiler/index.js 
  generate函数生成对应代码，核心思想就是将模板转换成 下面这段字符串
  <div id="app"><p>hello {{ name }}</p></div>
  _c("div", { id: app }, _c("p", undefined, _v('hello' + _s(name)), _v('hello')))

## 9.生成render函数
- 模板引擎实现方法：
   1. 拼接字符串 
   2. 增加with 
   3. new Function

## 10.代理_data属性-proxy
### 模板编译流程的总结：
- 模板
  `<div id="app"><p>hello {{ name }}</p></div>`
- AST语法树
  `
    {
      tage: 'div',
      attrs: [{ name: id, value: 'app' }],
      parent: {tag: 'div', type: 1, children: Array(1), attrs: Array(2), parent: null},
      type: 1,
      children: [
        {
          tag: 'p',
          attrs: [],
          parent: root,
          type: 1,
          children: [
            {
              text: 'hello{{name}}',
              type: 3
            }
          ]
        }
      ]
    }
  `
  ******************************
  实现：`let root = parseHTML(template);`
- 虚拟dom：
  `_c("div",{id:"app",style:{"color":" red","background":" blue"}},_c("p",undefined,_v("hello"+_s(name))))`
  ******************************
  实现：`let code = generate(root);`
- render函数：`const render = compileToFunction(template);`
  `ƒ anonymous() { with(this){return _c("div",{id:"app",style:{"color":" red","background":" blue"}},_c("p",undefined,_v("hello"+_s(name))))}}`  
  ******************************
  实现：`const render = compileToFunction(template);`

## 11.初始化渲染流程
- init.js 
  $mount 方法中新增mountComponent方法
- lifecycle.js
  mountComponent 方法实现组件挂载

## 12.初次渲染
- lifecycle.js
  mountComponent方法中新增updateComponent方法，并使用Watcher设置关联，触发里面的get方法
  通过vm._update(vm._render());拿到最新的虚拟dom
  其中_update方法中新增patch方法，通过虚拟节点对比渲染出真实dom
- render.js
  从实例上拿到vm.$options里面的render方法，执行一下生成虚拟dom
  其中涉及三个方法：
  - _c 创建元素的虚拟节点
  - _v 创建文本的虚拟节点
  - _s JSON.stringify
- vdom/patch.js
  - 判断是更新还是要渲染
  - 递归创建真实节点，替换掉老的节点
- vdom/create-element.js
  vue渲染基本流程实现：
  - 将template转成ast语法树 -> 生成render方法 -> 生成虚拟dom -> 真实的dom
  - 重新生成虚拟dom -> 更新dom
  vue渲染的基本流程：
  先进行数据劫持，把模板template转成ast语法树，然后生成render方法，通过render方法生成虚拟dom，再去更新页面，最后再替换掉原有的真实dom

## 13.生命周期的合并策略
- initGlobalAPI/index.js
  - 使用方法initGlobalAPI初始化全局的api
  - Vue.mixin混入的实现，主要是使用mergeOptions来实现混合
  - 其中mergeOptions中对于生命周期等钩子函数进行不同的策略合并，
  - mergeField合并字段方法中，判断是否是strats中的key，如果是就使用策略方法合并
  - mergeHook如果多个同名钩子合并会生成数组