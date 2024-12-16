interface sysStoreType {
  dictData: Record<string, any> // 字典数据
  collapse: boolean // 是否折叠
  setting: boolean // 布局设置
  theme: string // 主题色
  sideTheme: string // 侧边栏主题
  watermark: boolean // 水印
  routerTags: tagsType[] // 路由标签
  menu: MenuItem[] // 菜单项
  getDictValue: (data_key: string, val: any, key?: string) => Record<string, any>
  initThemeConfig: () => Promise<void> // 初始化主题配置
  dict: () => Promise<void> // 字典加载函数
  getMenu: () => Promise<void> // 获取路由菜单
}

interface userStoreType {
  userInfo: Record<string, any> | null
}
