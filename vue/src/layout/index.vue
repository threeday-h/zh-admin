<template>
  <div v-if="!loading" class="page">
    <el-container>
      <el-aside class="aside" :width="sysStore.collapse ? '4.0625rem' : '12.5rem'">
        <asideComp />
      </el-aside>
      <el-container>
        <el-header class="header">
          <headerComp />
        </el-header>
        <el-main class="main">
          <div ref="watermarkContainer">
            <router-view v-slot="{ Component }">
              <transition name="fade-transform" mode="out-in">
                <keep-alive v-if="shouldCache">
                  <component :is="Component" :key="route.path" />
                </keep-alive>
                <component v-else :is="Component" :key="route.path" />
              </transition>
            </router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
    <settingComp />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useSysStore } from '@/store/modules/sys'
import { useUserStore } from '@/store/modules/user'
import { getmark } from './watermark'
import settingComp from './setting/index.vue'
import asideComp from './aside/index.vue'
import headerComp from './header/index.vue'
import { ref, computed, watch, nextTick, provide, onMounted } from 'vue'

const route = useRoute()
const sysStore = useSysStore()
const userStore = useUserStore()

const loading = ref(true) // 新增 loading 标志位

// 异步初始化函数
const init = async () => {
  await sysStore.dict() // 获取字典数据
  await sysStore.initThemeConfig()
  loading.value = false // 数据加载完成后设为 false
}

// 在 setup 中调用初始化
onMounted(async () => {
  await init()
  nextTick(() => {
    // 确保 watermarkContainer 已经被赋值
    if (watermarkContainer.value && sysStore.watermark) {
      watermark(`${userInfo.value.nick_name} ${userInfo.value.login_date}`, watermarkContainer.value)
    }
  })
})

// 提供全局 store
provide('sysStore', sysStore)
provide('userStore', userStore)

// 获取水印方法
const { watermark, destroy } = getmark()
const watermarkContainer = ref(null)

const userInfo = computed(() => userStore.userInfo)
const shouldCache = computed(() => route.meta.keepAlive)

watch(
  () => sysStore.watermark,
  (newVal) => {
    nextTick(() => {
      // 确保 watermarkContainer 已经被赋值
      if (watermarkContainer.value) {
        if (newVal) {
          watermark(`${userInfo.value.nick_name} ${userInfo.value.login_date}`, watermarkContainer.value)
        } else {
          destroy(watermarkContainer.value)
        }
      }
    })
  }
)
</script>

<style scoped lang="scss">
body {
  overflow-x: hidden; /* 隐藏横向滚动条 */
}
.page {
  @apply w-[100vw] h-[100vh] overflow-hidden;
}
.aside {
  transition: all 0.5s;
  @apply h-[100vh] overflow-hidden;
}
.header {
  @apply h-20 px-0;
}
.main {
  height: calc(100vh - 80px - 20px);
  overflow-x: hidden;
  overflow-y: auto;

  @apply bg-[#f5f5f5] p-[10px] relative;
}
</style>
