import { createSSRApp } from 'vue'

import Antd from 'ant-design-vue'
import App from './App'

import 'ant-design-vue/dist/reset.css'

export function createApp() {
  const app = createSSRApp(App)
  app.use(Antd)
  return {
    app
  }
}