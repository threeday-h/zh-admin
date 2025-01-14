import { defineConfig, loadEnv } from "vite"
import * as path from "path"
import fs from "fs"
import vue from "@vitejs/plugin-vue"
import Icons from "unplugin-icons/vite"
import IconsResolver from "unplugin-icons/resolver"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"

// 自动导入
import AutoImport from "unplugin-auto-import/vite"
import Component from "unplugin-vue-components/vite"

import autoprefixer from "autoprefixer"
import postCssPxToRem from "postcss-pxtorem"
import tailwindcss from "tailwindcss"

import viteCompression from "vite-plugin-compression"

import { createSvgIconsPlugin } from "vite-plugin-svg-icons"

// 预构建包配置
const optimizeDeps = {
  include: [
    'vue',
    'vue-router',
    'pinia',
    'axios',
    '@vueuse/core',
    'element-plus',
    '@element-plus/icons-vue',
    // Element Plus 组件
    'element-plus/es/components/button',
    'element-plus/es/components/form',
    'element-plus/es/components/input',
    'element-plus/es/components/menu',
    'element-plus/es/components/sub-menu',
    'element-plus/es/components/menu-item',
    'element-plus/es/components/checkbox',
  ],
  exclude: [], // 排除不需要预构建的依赖
}

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return defineConfig({
    base: "/",
    optimizeDeps,
    plugins: [
      vue(),
      Icons({
        autoInstall: true,
        compiler: "vue3"
      }),
      // 自动注册
      Component({
        resolvers: [
          ElementPlusResolver({ 
            importStyle: 'sass',
            // 显式声明使用的组件
            imports: [
              'ElButton',
              'ElForm',
              'ElFormItem',
              'ElInput',
              'ElMenu',
              'ElSubMenu',
              'ElMenuItem',
              'ElCheckbox'
            ]
          }),
          IconsResolver({
            enabledCollections: ["ep"]
          })
        ],
        dts: "src/declares/component.d.ts"
      }),
      // 自动导入
      AutoImport({
        imports: ["vue"],
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            prefix: "Icon"
          })
        ],
        dts: "src/declares/auto-import.d.ts"
      }),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(process.cwd(), "src/assets/icon/svg")],
        // 指定symbolId格式
        symbolId: "icon-[dir]-[name]"
      })
    ],
    resolve: {
      //设置别名
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    },
    css: {
      preprocessorOptions: {
        scss: {}
      },
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer({
            overrideBrowserslist: ["Android 4.1", "iOS 7.1", "Chrome > 31", "ff > 31", "ie >= 8"],
            grid: true
          }),
          postCssPxToRem({
            // 自适应，px>rem转换
            rootValue: 16,
            propList: ["*"], // 需要转换的属性，这里选择全部都进行转换
            selectorBlackList: ["norem"] // 过滤掉norem-开头的class，不进行rem转换
          })
        ]
      }
    },

    server: {
      // 允许 IP 访问
      host: "0.0.0.0",
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_APP_BASE_URL, // 目标地址
          changeOrigin: true,
          rewrite: path => {
            return path.replace(new RegExp("^" + env.VITE_APP_BASE_API), "")
          }
        }
      }
    },
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'element-plus': ['element-plus'],
            'vue-lib': ['vue', 'vue-router', 'pinia'],
            // 将 Element Plus 的样式单独打包
            'element-plus-styles': ['element-plus/es/components/button/style/index',
              'element-plus/es/components/form/style/index',
              'element-plus/es/components/input/style/index',
              'element-plus/es/components/menu/style/index']
          }
        }
      }
    }
  })
}
