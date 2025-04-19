import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import './assets/iconfont.css'

// 导入Markdown预览组件
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
// 导入主题
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
// 代码高亮
import hljs from 'highlight.js'

// 配置预览组件
(VMdPreview as any).use(githubTheme, {
  Hljs: hljs,
})

const app = createApp(App)

// 注册全局组件
app.component('VMdPreview', VMdPreview)

// 添加Pinia状态管理
app.use(createPinia())
app.use(router)

app.mount('#app')
