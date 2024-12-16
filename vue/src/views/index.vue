<template>
  <div>
    <div class="header">
      <div class="left">
        <div class="name">{{ greeting }}，{{ userInfo?.nick_name }}</div>
        <div class="mess">
          <el-icon class="text-[13px]">
            <Monitor />
          </el-icon>
          上次登录:{{ userInfo?.login_date }}; 设备:{{ userInfo?.login_os }}; {{ userInfo?.login_address }};
          {{ userInfo?.login_ip }}
        </div>
      </div>
      <div class="right">
        <!-- （当前{{ chineseDate.solarTerms.name }}） -->
        <div class="mess">{{ userInfo?.login_date.substring(0, 10) }}&nbsp;{{ getWeek() }}，农历{{ chineseDate.month.name }}月{{ chineseDate.name }}</div>
        <iframe width="400" height="50" frameborder="0" scrolling="no" hspace="0" src="https://i.tianqi.com/?c=code&a=getcode&id=12&num=3&icon=1&site=13"></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChineseDate } from 'baitu'

const userStore = inject('userStore') as userStoreType

const userInfo = computed(() => userStore.userInfo)

const greeting = computed(() => {
  // 获取当前时间的小时数
  const hours = new Date().getHours()

  if (hours >= 5 && hours < 11) {
    return '早上好' // 早上 5点到11点
  } else if (hours >= 11 && hours < 14) {
    return '中午好' // 中午 11点到14点
  } else if (hours >= 14 && hours < 18) {
    return '下午好' // 下午 14点到18点
  } else {
    return '晚上好' // 晚上 18点到次日5点
  }
})

const chineseDate = new ChineseDate(new Date()).dayAllInfo

const getWeek = () => {
  let str
  var week = new Date().getDay()
  if (week == 0) {
    str = '星期日'
  } else if (week == 1) {
    str = '星期一'
  } else if (week == 2) {
    str = '星期二'
  } else if (week == 3) {
    str = '星期三'
  } else if (week == 4) {
    str = '星期四'
  } else if (week == 5) {
    str = '星期五'
  } else if (week == 6) {
    str = '星期六'
  }
  return str
}
</script>

<style scoped lang="scss">
.header {
  @apply flex items-center justify-between bg-white py-[20px] px-[25px] rounded-1;
  .left {
    @apply flex-1 flex-col;
    .name {
      color: rgba(0, 0, 0, 0.88);
      @apply text-5 font-6 leading-[32px] h-10;
    }
    .mess {
      @apply flex items-center text-[#333] text-[13px] mt-3;
    }
  }
  .right {
    @apply flex flex-col;
    .mess {
      color: rgb(51, 51, 51);
      @apply h-10 text-[14px] leading-10;
    }
  }
}
</style>
