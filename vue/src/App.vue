<template>
  <div>
    <el-config-provider :locale="zhCn">
      <router-view v-slot="{ Component }">
        <transition enter-active-class="animate__animated" leave-active-class="animate__slideInLeft">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-config-provider>
    <el-backtop :right="100" :bottom="400" />
    <div class="chat">
      <Chat />
    </div>
  </div>
</template>

<script setup lang="ts">
import zhCn from "element-plus/dist/locale/zh-cn.mjs"
import Chat from "@/views/chatPeople/index.vue"
</script>

<style lang="less">
@import url("./assets/css/transition.less");
/* nprogress.css */
#nprogress .bar {
  background: var(--el-color-primary) !important; /* 默认颜色 */
}

.chat {
  position: absolute;
  bottom: 10px;
  right: 10px;
}
</style>
