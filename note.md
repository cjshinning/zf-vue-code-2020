### 1.rollup的配置(注意rollup-plugin-serve会报错)
- npm i -D @babel/core@7.9.0 @babel/preset-env@7.9.5 rollup@2.6.1 rollup-plugin-babel@4.4.0 rollup-plugin-serve@1.0.1 cross-env@7.0.2

### 2.对数据进行监控
- index.js 整合的功能
- init.js 初始化 可以扩展很多原型方法
- state.js 初始化状态流程
- observer
- index.js  把data中的数据都使用Object.defineProperty重新定义