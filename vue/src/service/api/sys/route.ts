import { service } from '@/service/index'

// 新增路由菜单
export const postAddRouteMenu = (data: routeType) => {
  return service.post({ url: '/sys/add/route/menu', data })
}

// 获取所有路由
export const getListRouteMenu = (params?: { menu_name: string; status: string }) => {
  return service.get<{ list: MenuItem[] }>({ url: '/sys/list/route/menu', params })
}

// 删除路由
export const postDeleteRouteMenu = (data: { menu_id: number }) => {
  return service.post({ url: '/sys/delete/route/menu', data })
}

// 修改路由
export const postAlterRouteMenu = (data: Record<string, any>) => {
  return service.post({ url: '/sys/alter/route/menu', data })
}
