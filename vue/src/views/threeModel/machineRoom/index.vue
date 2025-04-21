<template>
  <div class="layout">
    <Header>数据机房管理大屏</Header>
    <div class="layout-content">
      <Sence></Sence>
    </div>
  </div>
</template>

<script setup>
import Header from "./Header.vue"
import Sence from "./Sence/index.vue"
</script>

<style scoped>
.layout {
  width: 100%;
  height: 100%;
}
.layout-content {
  width: 100%;
  height: calc(100vh - 7rem);
  background-color: #fff;
}
</style>
