import { App } from 'vue'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import tools from '@/utils/tools'

export function globalRegister(app: App): void {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.config.globalProperties.$tools = tools
}
