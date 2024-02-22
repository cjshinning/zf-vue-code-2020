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