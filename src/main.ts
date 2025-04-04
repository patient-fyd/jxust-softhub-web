import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// 添加Pinia状态管理
app.use(createPinia())
app.use(router)

app.mount('#app')
