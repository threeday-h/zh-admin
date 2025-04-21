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

let optimizeDepsElementPlusIncludes = ["element-plus/es"] //注意，是let，不是const
fs.readdirSync("node_modules/element-plus/es/components").map(dirname => {
  fs.access(`node_modules/element-plus/es/components/${dirname}/style/css.mjs`, err => {
    if (!err) {
      let path = `element-plus/es/components/${dirname}/style/css`
      optimizeDepsElementPlusIncludes.push(path)
      // console.log(`将强制对${path}进行依赖预构建`)
    }
  })
  //注意，一定要包含下面这部分
  fs.access(`node_modules/element-plus/es/components/${dirname}/style/index.mjs`, err => {
    if (!err) {
      let path = `element-plus/es/components/${dirname}/style/index`
      optimizeDepsElementPlusIncludes.push(path)
      // console.log(`将强制对${path}进行依赖预构建`)
    }
  })
})

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return defineConfig({
    assetsInclude: ['**/*.motion3.json'], 
    base: "/",
    optimizeDeps: {
      include: optimizeDepsElementPlusIncludes
    },
    plugins: [
      vue(),
      Icons({
        autoInstall: true,
        compiler: "vue3"
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
      // 自动注册
      Component({
        resolvers: [
          ElementPlusResolver({ importStyle: "sass" }),
          IconsResolver({
            enabledCollections: ["ep"]
          })
        ],
        dts: "src/declares/component.d.ts"
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
      open: true,
      // 添加 hmr 配置
      hmr: {
        overlay: false // 禁用服务器错误遮罩
      },
      fs: {
        strict: true,
        allow: [".."]
      },
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
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return id.toString().split("node_modules/")[1].split("/")[0].toString()
            }
          },
          // 配置资源文件夹路径
          assetFileNames: assetInfo => {
            // 检查文件类型，将所有图片文件放入 images 文件夹
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name ?? "")) {
              return "img/[name].[hash][extname]"
            }
            return "assets/[name].[hash][extname]" // 其他类型保持在根目录
          }
        },
        plugins: [
          viteCompression({
            algorithm: "gzip"
          })
        ]
      }
    }
  })
}
