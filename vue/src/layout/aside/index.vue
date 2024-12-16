<template>
  <div class="aside" :style="{ backgroundColor: isDarkTheme ? '#2d384c' : '' }">
    <div class="name" :style="{ backgroundColor: !isDarkTheme ? '#fff' : '', color: isDarkTheme ? '#fff' : '#001529' }">
      <span v-if="sysStore.collapse">V3</span>
      <span v-if="!sysStore.collapse">KTechArtAdmin V3</span>
    </div>
    <div class="menu">
      <el-menu
        class="el-menu-vertical-demo"
        :background-color="isDarkTheme ? '#2d384c' : ''"
        :text-color="isDarkTheme ? '#bfcbd9' : ''"
        :active-text-color="sysStore.theme"
        :collapse="sysStore.collapse"
        router
        unique-opened
        :default-active="active"
      >
        <template v-for="i in filteredMenu" :key="i.name">
          <!-- 如果有子菜单，使用 el-sub-menu -->
          <el-sub-menu v-if="i.children && i.children.length > 0" :index="i.path">
            <template #title>
              <div class="w-[24px] h-[50px] mr-[5px] flex items-center">
                <svg-icon :name="i.icon" />
              </div>
              <span v-if="!sysStore.collapse">{{ i.name }}</span>
            </template>
            <!-- 递归渲染子菜单 -->
            <template v-for="ii in filterChildren(i.children)" :key="ii.name">
              <el-menu-item :index="ii.path">
                <div class="w-[24px] h-[50px] mr-[5px] flex items-center">
                  <svg-icon :name="ii.icon" />
                </div>
                <template #title>{{ ii.name }}</template>
              </el-menu-item>
            </template>
          </el-sub-menu>

          <!-- 如果没有子菜单，直接显示 el-menu-item -->
          <el-menu-item v-else :index="i.path">
            <div class="w-[24px] h-[50px] mr-[5px] flex items-center">
              <svg-icon :name="i.icon" />
            </div>
            <template #title>
              {{ i.name }}
            </template>
          </el-menu-item>
        </template>
      </el-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useSysStore } from '@/store/modules/sys'

const route = useRoute()
const sysStore = useSysStore()

// 判断当前主题是否为暗色
const isDarkTheme = computed(() => sysStore.sideTheme === 'theme-dark')

const active = ref()

watch(
  () => route,
  (val) => {
    active.value = val.path
  },
  {
    immediate: true,
    deep: true
  }
)

// 过滤菜单项，保留 visible === 1
const filteredMenu = computed(() => {
  return sysStore.$state.menu.filter((item) => Number(item.visible) !== 1)
})

// 递归过滤子菜单
const filterChildren = (children: any[]) => {
  return children
    .filter((ii) => Number(ii.visible) !== 1)
    .map((ii) => {
      // 如果该子菜单有子项，则递归过滤
      if (ii.children && ii.children.length > 0) {
        ii.children = filterChildren(ii.children)
      }
      return ii
    })
}
</script>

<style scoped lang="scss">
:deep(.el-menu) {
  border-right: none !important;
}
.aside {
  @apply w-full h-full overflow-y-auto;

  .name {
    @apply text-4 font-6 h-10 flex items-center justify-center;
  }
  .menu {
    height: calc(100vh - 40px);
  }
}
</style>
