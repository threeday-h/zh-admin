import { service } from '@/service/index'

// 角色列表
export const getListRole = (params: roleType) => {
  return service.get<{ list: Record<string, any>[] }>({ url: '/sys/list/role', params })
}

// 新增角色
export const postAddRole = (data: roleType) => {
  return service.post({ url: '/sys/add/role', data })
}

// 修改
export const postAlterRole = (data: roleType) => {
  return service.post({ url: '/sys/alter/role', data })
}

// 删除
export const postDeleteRole = (data: roleType) => {
  return service.post({ url: '/sys/delete/role', data })
}
