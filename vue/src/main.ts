import { createApp } from "vue"
import App from "./App.vue"
import store from "./store"
import router from "./router"
import { globalRegister } from "./global"

// 使用动态导入
const setupApp = async () => {
  const app = createApp(App)

  // 按需导入样式
  await import("./assets/css/tailwind.css")
  await import("virtual:svg-icons-register")

  app.use(store)
  app.use(router)
  app.use(globalRegister)

  app.mount("#app")
}

setupApp()
