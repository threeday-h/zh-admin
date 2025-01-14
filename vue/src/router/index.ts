import { createRouter, createWebHistory, RouteMeta, RouteRecordRaw, createWebHashHistory } from "vue-router"
import { useSysStore } from "@/store/modules/sys"
import * as nProgress from "nprogress"
import "nprogress/nprogress.css"
import cookieTools from "@/utils/cookie"

nProgress.configure({
  easing: "ease", // 动画方式
  speed: 100, // 递增进度条的速度
  showSpinner: false, // 是否显示加载 icon
  trickleSpeed: 10, // 自动递增间隔
  minimum: 0.3 // 初始化时的最小百分比
})

// 白名单
const whiteList = ["/login", "/404"]

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "layout",
    redirect: "/indexMoudle",
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "/index",
        name: "Index",
        component: () => import("@/views/index.vue"),
        meta: {
          name: "首页",
          keepAlive: true
        }
      },
      {
        path: "/profile",
        name: "profile",
        component: () => import("@/views/sys/user/profile.vue"),
        meta: {
          name: "用户中心",
          keepAlive: true
        }
      }
    ]
  },
  {
    path: "/indexMoudle",
    name: "IndexMoudle",
    component: () => import("@/views/indexMoudle/index.vue"),
    meta: {
      name: "首页",
      keepAlive: true
    }
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login.vue"),
    meta: {
      name: "登录",
      keepAlive: true
    }
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/404.vue"),
    meta: {
      name: "404",
      keepAlive: true
    }
  },
  {
    path: "/:pathMatch(.*)*",
    // path: '/:catchAll(.*)',
    component: () => import("@/views/404.vue")
  }
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    // 默认返回顶部
    return { top: 0 } // 符合 ScrollPosition 类型
  },
  routes
})

router.beforeEach(async (to, from, next) => {
  nProgress.start()

  const token = cookieTools.getCookie("token")
  // console.log("token", token)

  // 跳转到登录页
  if (!token && !whiteList.includes(to.path)) return next("/login")

  // 已登录时跳转到首页
  if (to.path === "/login" && token) return next("/")

  // 白名单路径直接放行
  if (whiteList.includes(to.path)) return next()

  const { menu, getMenu } = useSysStore()

  if (!menu.length) {
    await getMenu()
    console.log("获取全部路由 =>", router.getRoutes())
    // 重定向回当前路径
    return next(to.fullPath)
  }

  // 这里确保正常调用 next()，否则会导致死循环或者不跳转
  next()
})

router.afterEach(async (to: any) => {
  if (to.meta.name !== "首页" && to.meta.name !== "登录" && to.name !== "404") {
    const sysStore = useSysStore()
    sysStore.addRouterTags({
      path: to.path,
      name: to.meta.name,
      fullPath: to.fullPath,
      query: to.query
    })
  }

  nProgress.done()
  return true
})

export default router
