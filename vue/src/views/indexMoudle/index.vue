<template>
  <div class="main-bg">
    <div class="module-list">
      <div class="module" v-for="(item, index) in moduleList" :key="index" @click="moduleChose(item)">
        <!-- <i>
                            <img :src="item.icon" style="width: 1.5rem; height: auto; vertical-align: middle" alt="" />
                        </i> -->
        <span>{{ item.name }}</span>
        <div class="inter">
          <i class="iconfont icon-jinrushiyan"></i>
        </div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import { useSysStore } from "@/store/modules/sys"
const sysStore = useSysStore()

const router = useRouter()
const moduleList = [
  {
    name: "后台管理",
    path: "/sys/route",
    module_name: "backManagement"
  },
  {
    name: "首页大屏",
    path: "/index",
    module_name: "index"
  },
  {
    name: "工具模块",
    path: "/tools/wordCloud",
    module_name: "tools"
  },
  {
    name: "3D模型模块",
    path: "/threeModel/machineRoom",
    module_name: "threeModel"
  }
]
function moduleChose(item: any) {
  // window.open(location.origin)
  sysStore.module_name = item
  router.push(item.path || "/")
}
</script>

<style scoped lang="scss">
.main-bg {
  @apply w-[100vw] h-[100vh] overflow-hidden flex items-center justify-center;
  background-image: url("@/assets/img/login-bg.png");
  background-size: cover;
  background-repeat: no-repeat;
  padding: 140px;
}

.module-list {
  width: 100%;
  height: 100%;
  // padding: 0 18.75vw;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-start;
  // justify-content: center;

  .module {
    box-sizing: border-box;
    position: relative;
    width: 200px;
    height: 150px;
    background-color: rgb(164, 200, 241);
    opacity: 0.8;
    margin: 4px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s;
    /* 上浮这个过程需要的时间 */
    overflow: hidden;
    top: 0;
    left: 0;

    i {
      color: #004aba;
      font-size: 1.5rem;
      z-index: 2;
    }

    span {
      margin-left: 0.375rem;
      font-family: Alibaba PuHuiTi 2;
      font-weight: normal;
      font-size: 1.125rem;
      z-index: 2;
    }

    .inter {
      z-index: 2;
      position: absolute;
      width: 2.125rem;
      height: 2.125rem;
      right: 1.25rem;
      bottom: 0.625rem;
      text-align: center;
      line-height: 2.125rem;

      i {
        font-size: 1.625rem;
      }
    }

    &:hover {
      z-index: 2;
      cursor: pointer;
      // background-color: #004aba;
      opacity: 1;
      // color: #fff;
      box-shadow: 0px 0px 10px #96a8c9;
      transform: translate(0, -2px);
      /* 鼠标悬浮时盒子上移10px */
      z-index: 2;

      // i {
      //   color: #ffffff !important;
      // }
      .wave {
        z-index: 1;
        position: absolute;
        top: 0;
        left: 0;
        width: 110%;
        height: 120%;
        background-color: rgb(77, 135, 201);
        overflow: hidden;
      }

      .wave::after {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        width: 150%;
        height: 150%;
        border-radius: 40%;
        // background-color: #fff;
        background-color: rgb(164, 200, 241);
        animation: shi 5s linear infinite;
      }

      .wave::before {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        width: 150%;
        height: 150%;
        border-radius: 42%;
        background-color: rgb(240, 228, 228, 0.2);
        animation: xu 7s linear infinite;
      }
    }
  }
}

/* 定义动画 */
@keyframes shi {
  0% {
    transform: translate(-50%, -65%) rotate(0deg);
  }

  100% {
    transform: translate(-50%, -65%) rotate(360deg);
  }
}

@keyframes xu {
  0% {
    transform: translate(-50%, -60%) rotate(0deg);
  }

  100% {
    transform: translate(-50%, -60%) rotate(360deg);
  }
}
</style>
