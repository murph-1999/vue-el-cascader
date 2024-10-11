import Vue from "vue"
import App from './App.vue'
import 'element-ui/lib/theme-chalk/index.css'
import VueElCascaderUI from '../packages/index'
Vue.use(VueElCascaderUI)

new Vue({
  render: (h) => h(App)
}).$mount('#app')