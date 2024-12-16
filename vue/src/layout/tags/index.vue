<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPane" class="tags-view-wrapper" @scroll="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        ref="tag"
        :key="tag.path"
        :class="isActive(tag) ? 'active' : ''"
        :to="{ path: tag.path, query: tag.query }"
        tag="span"
        class="tags-view-item"
        id="tags-view-item"
        :style="activeStyle(tag)"
        @click.middle.prevent="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        <div class="flex items-center">
          {{ tag.name }}
          <el-icon class="ml-[5px]" v-if="!isAffix(tag) && tag.name !== '首页'" @click.prevent.stop="closeSelectedTag(tag)">
            <CircleClose />
          </el-icon>
        </div>
      </router-link>
    </scroll-pane>
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">
        <el-icon class="mr-[5px]">
          <Refresh />
        </el-icon>
        刷新页面
      </li>
      <li v-if="!isAffix(selectedTag) && selectedTag.name !== '首页'" @click="closeSelectedTag(selectedTag)">
        <el-icon class="mr-[5px]">
          <CircleClose />
        </el-icon>
        关闭当前
      </li>
      <li @click="closeOthersTags">
        <el-icon class="mr-[5px]">
          <CircleClose />
        </el-icon>
        关闭其他
      </li>
      <li v-if="!isFirstView()" @click="closeLeftTags">
        <el-icon class="mr-[5px]">
          <Back />
        </el-icon>
        关闭左侧
      </li>
      <li v-if="!isLastView()" @click="closeRightTags">
        <el-icon class="mr-[5px]">
          <Right />
        </el-icon>

        关闭右侧
      </li>
      <li @click="closeAllTags">
        <el-icon class="mr-[5px]">
          <CircleClose />
        </el-icon>

        全部关闭
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import ScrollPane from './scrollPane.vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useSysStore } from '@/store/modules/sys'

const sysStore = useSysStore()

const first = [{ path: '/index', name: '首页', query: {}, fullPath: '/index' }]
const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = reactive({} as tagsType)
const visitedViews = ref<tagsType[]>([])
const theme = computed(() => sysStore.theme)
const router = useRouter()
const route = useRoute()

// 判断当前标签是否激活
const isActive = (tag: tagsType) => tag.path === route.path

// 激活样式
const activeStyle = (tag: tagsType) => {
  if (!isActive(tag)) return {}
  return {
    backgroundColor: theme.value,
    borderColor: theme.value
  }
}

// 判断是否是固定标签
const isAffix = (tag: tagsType) => !!tag.affix

// 判断是否为首页或第一个标签
const isFirstView = () => selectedTag.fullPath === '/index' || selectedTag.fullPath === visitedViews.value[1]?.fullPath

// 判断是否为最后一个标签
const isLastView = () => selectedTag.fullPath === visitedViews.value[visitedViews.value.length - 1]?.fullPath

// 处理滚动事件
const handleScroll = () => {
  visible.value = false
}

// 刷新选中的标签
const refreshSelectedTag = (tag: tagsType) => {
  window.location.reload()
  // router.push({ path: tag.path, query: { _refresh: Date.now(), ...tag.query } })
}

// 删除当前标签
const closeSelectedTag = (tag: tagsType) => {
  // 删除当前标签
  sysStore.delRouterTags(tag.name)

  // 查找当前选中的标签的索引
  const tagIndex = visitedViews.value.findIndex((item: tagsType) => item.path === tag.path)

  // 获取当前选中的标签的路径
  const currentRoutePath = router.currentRoute.value.path

  if (visitedViews.value.length === 1) {
    router.push({ path: '/index' })
  } else {
    // 删除标签后跳转到下一个合适的标签
    handleTagDeletion(tag, tagIndex, currentRoutePath)
  }
}

// 标签删除后的跳转处理
const handleTagDeletion = (tag: tagsType, tagIndex: number, currentRoutePath: string) => {
  if (currentRoutePath === tag.path) {
    if (tagIndex === visitedViews.value.length - 1) {
      const previousTag = visitedViews.value[visitedViews.value.length - 2]
      router.push({ path: previousTag.path, query: previousTag.query })
    } else {
      const nextTag = visitedViews.value[tagIndex + 1] || visitedViews.value[tagIndex - 1]
      router.push({ path: nextTag.path, query: nextTag.query })
    }
  } else {
    // 如果删除的是非当前标签，保持当前标签
    const lastSelectedTag = visitedViews.value.find((item: tagsType) => item.path === currentRoutePath)
    if (lastSelectedTag) {
      router.push({ path: lastSelectedTag.path, query: lastSelectedTag.query })
    }
  }
}

// 保存标签到 sessionStorage
const saveToSessionStorage = () => {
  sysStore.routerTags = visitedViews.value
  sessionStorage.setItem('routerTags', JSON.stringify(visitedViews.value))
}

// 关闭所有标签
const closeAllTags = () => {
  visitedViews.value = [first[0]]
  sessionStorage.removeItem('routerTags')
  sysStore.routerTags = []
  router.push({ path: '/index' })
}

// 关闭其他标签（只保留首页和当前标签）
const closeOthersTags = () => {
  const currentTagIndex = visitedViews.value.findIndex((tag: tagsType) => tag.path === selectedTag.path)
  if (currentTagIndex !== -1) {
    visitedViews.value = visitedViews.value.filter((tag: tagsType) => tag.path === '/index' || tag.path === selectedTag.path)
    saveToSessionStorage()
  }
}

// 关闭当前标签左侧的所有标签
const closeLeftTags = () => {
  const currentTagIndex = visitedViews.value.findIndex((tag: tagsType) => tag.path === selectedTag.path)

  if (currentTagIndex !== -1) {
    const leftTags = visitedViews.value.slice(currentTagIndex)
    visitedViews.value = leftTags.filter((tag: tagsType) => tag.path === '/index' || tag.path === selectedTag.path)
    saveToSessionStorage()
  }
}

// 关闭当前标签右侧的所有标签
const closeRightTags = () => {
  const currentTagIndex = visitedViews.value.findIndex((tag: tagsType) => tag.path === selectedTag.path)
  if (currentTagIndex !== -1) {
    visitedViews.value = visitedViews.value.slice(0, currentTagIndex + 1)
    visitedViews.value = visitedViews.value.filter((tag: tagsType) => tag.path === '/index' || tag.path === selectedTag.path)
    saveToSessionStorage()
  }
}

// 菜单点击时打开
const openMenu = (tag: any, e: MouseEvent) => {
  if (!isActive(tag)) return

  const container = document.getElementById('tags-view-container')
  if (!container) return

  const { left: containerLeft, top: containerTop, width: containerWidth, height: containerHeight } = container.getBoundingClientRect()
  const menuWidth = 95
  const menuHeight = 35

  const clickX = e.clientX - containerLeft
  const clickY = e.clientY - containerTop

  left.value = clickX + menuWidth > containerWidth ? containerWidth - menuWidth : clickX
  top.value = 30 + (clickY + menuHeight > containerHeight ? containerHeight - menuHeight : clickY)

  visible.value = true
  Object.assign(selectedTag, tag)
}

// 点击页面其他区域时关闭菜单
const handleClickOutside = (e: MouseEvent) => {
  const container = document.getElementById('tags-view-item')
  if (container && !container.contains(e.target as Node)) {
    visible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => sysStore.routerTags,
  (newTags) => {
    visitedViews.value = [...first, ...newTags]
  },
  { immediate: true, deep: true }
)
</script>

<style scoped lang="scss">
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;

  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &.active {
        background-color: #42b983;
        color: #fff;
      }
    }
  }
}
.contextmenu {
  position: absolute;
  background: #fff;
  list-style: none;
  padding: 5px 0;
  box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.3);
  z-index: 3000;
  font-size: 12px;

  -webkit-box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);

  li {
    padding: 7px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    &:hover {
      background: #eee;
    }
  }
}
</style>
