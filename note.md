# 手写vue源码
## 1.rollup的配置
### 依赖安装（注意rollup-plugin-serve会报错）
- npm i -D @babel/core@7.9.0 @babel/preset-env@7.9.5 rollup@2.6.1 rollup-plugin-babel@4.4.0 rollup-plugin-serve@1.0.1 cross-env@7.0.2

## 2.对数据进行监控
- index.js 整合的功能
- init.js 初始化 可以扩展很多原型方法
- state.js 初始化状态流程
- observer/index.js
- 把data中的数据都使用Object.defineProperty重新定义

## 3.对象的数据劫持
- observer/index.js 
### 对象的劫持方法：
1. 先判断传入的data是不是对象，如果是使用new Observer()来劫持对象
2. Observer类中使用walk方法对属性进行遍历，并使用defineReactive定义响应式
3. defineReactive中先使用observe(value)进行递归实现深度检测，再使用Object.defineProperty设置get和set进行劫持，获取数据的时候会触发get方法做一些操作，修改数据的时候会触发set方法做另一些操作，比如依赖收集。（注意：在set方法中使用observe(newValue)继续劫持用户设置的值，因为有可能用户设置的值是个对象）
