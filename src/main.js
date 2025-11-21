import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@/assets/style/index.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import intersectionDirective from '@/directives/intersection';
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import download from '@/utils/download.js'
import { getDictLabel } from "@/api/dict.js"
import { ElCollapseTransition } from 'element-plus'

import 'element-plus/theme-chalk/base.css'

const app = createApp(App)


// element中文插件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.component(ElCollapseTransition.name, ElCollapseTransition)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

// 注册全局指令
app.directive('intersection', intersectionDirective);

//挂在全局function  访问全局函数（通过 instance.appContext.config.globalProperties）
// 批量挂载多个方法
const global_methods = {
  getDictLabel: getDictLabel,
  download: download,
}
// 批量添加到全局
Object.keys(global_methods).forEach(key => {
  app.config.globalProperties[key] = global_methods[key];
})

app.mount('#app')
