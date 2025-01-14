<template>
  <div id="diff" ref="diff" v-html="diffHtml"></div>
</template>

<script setup>
import { onMounted, ref } from "vue"

import * as Diff from "diff"
import * as Diff2Html from "diff2html"
import "diff2html/bundles/css/diff2html.min.css"

// Requires `npm install highlight.js`
// import "highlight.js/styles/github.css"
import "diff2html/bundles/css/diff2html.min.css"

const username = ref("")
const password = ref("")
const diffHtml = ref()

handleGetLook()
const diff = ref()
function handleGetLook() {
  const oldFile = `{
     "projectName": "ExampleProject1",
     "version": "1.0.0",
     "author": "John Doe",
     "dependencies": {
       "libraryA": "^1.2.3",
       "libraryB": "^3.4.5"
     },
     "devDependencies": {
       "toolX": "^0.9.8"
     },
     "scripts": {
       "start": "node index.js"
     }
   }`

  const newFile = `{
  
     "author": "Jane Do1e",
     "dependencies": {
       "libraryA": "^1.2.3",
       "libraryC": "^7.8.9"
     },
     "devDependencies": {
       "toolX": "^0.9.8",
       "toolY": "^2.3.4"
     },
     "projectName": "ExampleProject",
  
     "scripts": {
       "start": "node app.js",
     }
   }`

  const diff = Diff.createTwoFilesPatch("旧文件", "新文件", oldFile, newFile)
  console.log(diff)

  const outputHtml = Diff2Html.html(diff, {
    inputFormat: "diff",
    showFiles: true,
    matching: "lines",
    highlight: true,
    outputFormat: "side-by-side"
  })
  diffHtml.value = outputHtml
}
</script>

<style scoped></style>
