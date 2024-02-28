import { mergeOptions } from '../util/index';

export function initGlobalAPI(Vue) {
  // 整合了所有全局相关的内容
  Vue.options = {};

  Vue.mixin = function (mixin) {
    // 如何实现两个对象的合并
    this.options = mergeOptions(this.options, mixin);
  }

}