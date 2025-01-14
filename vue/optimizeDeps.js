import fs from "fs"
// 排除重载的依赖项
const optimizeDeps = [
  "@antv/g6",
  "@antv/s2",
  "@antv/s2-vue",
  "@antv/x6",
  "@antv/x6-vue-shape",
  "@howdyjs/mouse-menu",
  "@howdyjs/to-drag",
  "@tinymce/tinymce-vue",
  "axios",
  "circular-json",
  "codemirror",
  "dateformat",
  "dom-to-image",
  "echarts",
  "file-saver",
  "js-cookie",
  "pinia",
  "qs",
  "splitpanes",
  "sql-formatter",
  "tinymce",
  "vue-draggable-plus",
  "vue-i18n",
  "vue-router",
  "vxe-table",
  "xe-utils",
  "xlsx",
  "element-plus/es",
  "mitt"
]
fs.readdirSync("node_modules/element-plus/es/components").forEach(dirname => {
  fs.access(`node_modules/element-plus/es/components/${dirname}/style/css.mjs`, err => {
    if (!err) {
      optimizeDeps.push(`element-plus/es/components/${dirname}/style/css`)
    }
  })
})
export default optimizeDeps
