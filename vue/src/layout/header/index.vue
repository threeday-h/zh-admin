<template>
  <div class="header">
    <div class="top">
      <el-icon class="icon cursor-pointer" size="18" @click="sysStore.collapse = !sysStore.collapse">
        <Fold v-if="!sysStore.collapse" />
        <Expand v-else />
      </el-icon>

      <div class="bread">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <transition-group name="breadcrumb" tag="div" v-if="bread.length">
            <el-breadcrumb-item v-for="item in bread" :key="item.name">{{ item.name }}</el-breadcrumb-item>
          </transition-group>
        </el-breadcrumb>
      </div>
      <div class="user flex items-center">
        <el-dropdown @command="handleCommand">
          <div class="pic flex items-center">
            <img :src="userInfo.avatar ? tools.addBaseUrl(userInfo.avatar) : avater" alt="" />
            <span>{{ userInfo.nick_name }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="layout">布局设置</el-dropdown-item>
              <el-dropdown-item command="loginout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="bottom relative">
      <tags />
    </div>
  </div>
</template>

<script setup lang="ts">
import avater from '@/assets/img/avater.gif'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { useSysStore } from '@/store/modules/sys'
import tags from '../tags/index.vue'

const sysStore = useSysStore()

const instance = getCurrentInstance()
const tools = instance?.appContext.config.globalProperties.$tools

interface BreadItem {
  name: string
  path: string
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

const bread = ref<BreadItem[]>([])

const handleCommand = (command: string | number | object) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'layout') {
    sysStore.setting = true
  } else {
    ElMessageBox.confirm('是否确认退出登录?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      window.location.href = '/login'
    })
  }
}

watch(
  () => route,
  (val) => {
    bread.value = []
    const matched = val.matched

    if (matched.length) {
      for (let index = 0; index < matched.length; index++) {
        const { name, path, meta } = matched[index]

        if (name !== 'layout' && name !== 'home') {
          bread.value.push({
            name: meta.name as string,
            path
          })
        }
      }
    }
  },
  {
    immediate: true,
    deep: true
  }
)
</script>

<style scoped lang="scss">
.header {
  @apply flex flex-col z-10;
  .top {
    @apply h-10 flex items-center justify-between border-b border-solid border-[#eee];
    .icon {
      @apply ml-[10px];
    }
    .bread {
      @apply flex-1 mx-[10px];
    }
    .user {
      @apply mr-5;
      .pic {
        img {
          @apply w-6 h-6 mr-1 rounded-[3px] object-cover;
        }
      }
    }
  }
  .bottom {
    @apply flex items-center h-10;
    border-bottom: 1px solid rgb(238, 238, 238);
  }
}
</style>
