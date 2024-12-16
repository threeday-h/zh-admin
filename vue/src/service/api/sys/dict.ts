import { service } from '@/service/index'

// 获取字典列表
export const getDictTypeList = (params: dictType) => {
  return service.get<{ list: Record<string, any>[]; total: number }>({ url: '/sys/list/dict/type', params })
}

// 新增字典类型
export const postDictTypeAdd = (data: dictType) => {
  return service.post({ url: '/sys/add/dict/type', data })
}

// 修改
export const postDictTypeAlter = (data: dictType) => {
  return service.post({ url: '/sys/alter/dict/type', data })
}

// 删除
export const postDictTypeDelete = (data: dictType) => {
  return service.post({ url: '/sys/delete/dict/type', data })
}

// 获取字典值
export const getDictValueList = (params: dictValue) => {
  return service.get<{ list: Record<string, any>[]; total: number }>({ url: '/sys/list/dict/value', params })
}

// 新增字典值
export const postDictValueAdd = (data: dictValue) => {
  return service.post({ url: '/sys/add/dict/value', data })
}

// 修改
export const postDictValueAlter = (data: dictValue) => {
  return service.post({ url: '/sys/alter/dict/value', data })
}

// 删除
export const postDictValueDelete = (dict_code: number) => {
  return service.post({ url: '/sys/delete/dict/value', data: { dict_code } })
}
