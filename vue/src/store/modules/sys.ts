import { defineStore } from 'pinia'
import { getListRouteMenu } from '@/service/api/sys/route'
import { getDict } from '@/service/api/sys/tools'
import router from '@/router/index'
import cookieTools from '@/utils/cookie'

const components = import.meta.glob('../../views/**')

// console.log('components', components)

async function loadComponent(componentPath: string) {
  if (componentPath) {
    const componentKey = `../../views${componentPath}.vue`
    return components[componentKey]
  }
}

const routeTags = sessionStorage.getItem('routerTags') ? JSON.parse(sessionStorage.getItem('routerTags') as string) : []
export const useSysStore = defineStore('sys', {
  state: () => ({
    // 侧边菜单
    menu: [] as MenuItem[],
    // 是否折叠
    collapse: false,
    // 布局设置
    setting: false,
    // 主题色
    theme: '#1861EA',
    // 主题
    sideTheme: 'theme-light',
    // 水印
    watermark: true,
    // 路由标签
    routerTags: routeTags as tagsType[],
    // 字典键值
    dictData: {} as Record<string, any>
  }),
  actions: {
    // 初始化主题配置
    initThemeConfig() {
      const config = cookieTools.getCookie('themeConfig')

      if (config) {
        const themeConfig = JSON.parse(config)
        this.sideTheme = themeConfig.sideTheme ?? 'theme-light'
        this.theme = themeConfig.theme ?? '#1861EA'
        this.watermark = themeConfig.watermark ?? true
      }

      this.setThemeColor()
    },
    // 保存主题配置
    saveThemeConfig() {
      this.setThemeColor()
      cookieTools.setCookie(
        'themeConfig',
        JSON.stringify({
          sideTheme: this.sideTheme,
          theme: this.theme,
          watermark: this.watermark
        })
      )
    },
    // 设置动态主题颜色
    setThemeColor() {
      // 动态更新 Element Plus 的 CSS 变量
      document.documentElement.style.setProperty('--el-color-primary', this.theme)
    },
    // 重置主题配置
    resetThemeConfig() {
      this.theme = '#1861EA'
      this.sideTheme = 'theme-light'
      this.watermark = true
      this.setThemeColor()
      cookieTools.setCookie(
        'themeConfig',
        JSON.stringify({
          sideTheme: this.sideTheme,
          theme: this.theme,
          watermark: this.watermark
        })
      )
    },
    // 新增路由标签
    addRouterTags(route: tagsType) {
      const find = this.routerTags.find((item: tagsType) => item.name === route.name)
      if (!find) this.routerTags.push(route)
      sessionStorage.setItem('routerTags', JSON.stringify(this.routerTags))
    },
    // 删除路由标签
    delRouterTags(name: string) {
      const index = this.routerTags.findIndex((item: tagsType) => item.name === name)
      if (index !== -1) this.routerTags.splice(index, 1)
      console.log(this.routerTags)

      sessionStorage.setItem('routerTags', JSON.stringify(this.routerTags))
    },
    // 递归生成路由
    async generateRoutes(data: MenuItem[]): Promise<Route[]> {
      const routes = await Promise.all(
        data.map(async (item) => {
          return {
            name: item.name,
            path: item.path,
            meta: {
              name: item.name,
              keepAlive: !Number(item.is_cache) ? true : false
            },
            component: await loadComponent(item.component), // 确保加载组件
            children: item.children ? await this.generateRoutes(item.children) : [] // 递归处理子路由
          }
        })
      )

      return routes as any
    },
    findMenuItem: function (this: ReturnType<typeof useSysStore>, targetIndex: string, menu: MenuItem[] = this.menu): MenuItem | null {
      for (const item of menu) {
        if (item.index === targetIndex) {
          return item // 找到直接匹配
        }
        if (item.children) {
          const childItem = this.findMenuItem(targetIndex, item.children) // 递归查找子项
          if (childItem) {
            return childItem // 找到子项匹配
          }
        }
      }
      return null // 未找到
    },
    addRoute(routes: Route[]) {
      router.addRoute({
        path: '/:pathMatch(.*)',
        redirect: '/404',
        name: 'notMath'
      })
      routes.forEach((route) => {
        router.addRoute('layout', route)
      })
    },
    // 根据获取字典data获取值
    getDictValue(data_key: string, val: any, key: string = 'dict_value') {
      const find = this.dictData[data_key].children.find((item: any) => item[key] === val)
      return find ?? {}
    },
    // 获取菜单列表
    async getMenu() {
      let { data } = await getListRouteMenu()

      // 生成新的路由
      const newRoutes = await this.generateRoutes(data.list)
      // 遍历生成的路由
      this.addRoute(newRoutes)

      this.menu = data.list as MenuItem[]
    },
    // 获取字典键值
    async dict() {
      const { data } = await getDict()
      this.dictData = data
    }
  }
})
