import Vue from 'vue'
// import './plugins/axios'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import {
  postJSON,
  getJSON,
  getText,
  postText,
  handleSrc
} from './utils/request.js'

Vue.use(ElementUI)
// Vue.prototype.$axios = axios

Vue.config.productionTip = false

// 封装的POST请求方法
Vue.prototype.$postJSON = postJSON
// 封装的GET请求方法
Vue.prototype.$getJSON = getJSON
// 封装的POST请求方法
Vue.prototype.$postText = postText
// 封装的GET请求方法
Vue.prototype.$getText = getText
// 封装的src处理函数
Vue.prototype.$handleSrc = handleSrc

Vue.prototype._vue = new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')// 手动挂载到app模块

// new Vue({
//   router,
//   store,
//   render: h => h(App)
// }).$mount('#app')

/* 创建挂载点至#app元素，将内容显示在index.html页面 */
// let app = new Vue({
//   el: '#app',
//   router,
//   store,
//   render: h => h(App)
// })

// Vue.use({
//   app
// })
