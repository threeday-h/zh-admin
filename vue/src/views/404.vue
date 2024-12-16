<template>
  <div class="page">
    <div class="content">
      <img src="@/assets/img/404.png" alt="" />
      <div class="desc">
        <span>404错误!</span>
        <p>找不到网页！</p>
        <p>对不起，您正在寻找的页面不存在。尝试检查URL的错误，然后按浏览器上的刷新按钮或尝试在我们的应用程序中找到其他内容。</p>
        <div class="btn" @click="router.push('/')">返回首页</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style lang="scss" scoped>
.page {
  @apply w-full h-screen flex items-center justify-center;

  .content {
    @apply flex items-center mb-[100px];

    img {
      @apply w-[600px] h-[330px];
    }

    .desc {
      @apply flex flex-col w-[300px];

      span {
        @apply text-8 text-[#1482f0] font-7 mb-5 leading-10;
      }

      p {
        &:nth-child(2) {
          @apply text-5 leading-6 text-[#222] mb-[10px] font-bold;
        }
        &:nth-child(3) {
          @apply text-[13px] leading-5 text-gray-500 mb-[30px];
        }
      }

      .btn {
        @apply block float-left w-[110px] h-[36px] bg-[#1482f0] rounded-full text-center text-white text-sm leading-9 cursor-pointer;
      }
    }
  }
}
</style>
