/*
 * @Description:
 * @version:
 * @Author: Murphy
 * @Date: 2024-10-11 19:58:50
 * @LastEditTime: 2024-10-11 19:58:52
 */
import VueElCascader from './cascader/index'
import VueElCascaderPanel from './cascader-panel/index'
const components = [VueElCascader, VueElCascaderPanel]
const install = function (Vue) {
  components.forEach(component => {
    Vue.component(component.name, component);
  });
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
export default {
  version: '0.1.0',
  install,
  VueElCascader,
  VueElCascaderPanel
}