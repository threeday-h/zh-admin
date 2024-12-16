declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const vueComponent: DefineComponent<{}, {}, any>
  export default vueComponent
}

declare module 'unplugin-icons/vue' {
  import { defineComponent } from 'vue'
  const Icon: ReturnType<typeof defineComponent>
  export default Icon
}

declare module 'wow.js'
declare module 'element-plus'
declare module 'unplugin-element-plus'
declare module 'element-plus/dist/locale/zh-cn.mjs'
declare module 'chinese-lunar-calendar'
declare module 'vue-cropper'
declare module 'baitu'
