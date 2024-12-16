import { service } from '@/service/index'

// 获取验证码
export const getCaptcha = () => {
  return service.get({ url: '/sys/captcha' })
}

// 登录
export const postLogin = (data: userType) => {
  return service.post<{ userInfo: Record<string, any>; token: string }>({ url: '/sys/login/user', data })
}

// 新增
export const postAddUser = (data: userType) => {
  return service.post({ url: '/sys/add/user', data })
}

// 修改用户信息
export const postAlter = (data: userType) => {
  return service.post<{ userInfo: Record<string, any>; token: string }>({ url: '/sys/alter/user', data })
}

// 修改密码
export const postAlterPassword = (data: { old_pass: string; new_pass: string; reply_pass: string }) => {
  return service.post<{ userInfo: Record<string, any>; token: string }>({ url: '/sys/alter/password', data })
}

// 列表
export const getList = (params: { nick_name: string; status: string; phonenumber: string; create_time: string; pageNum: number; pageSize: number }) => {
  return service.get<{ list: Record<string, any>[]; total: number }>({ url: '/sys/list/user', params })
}

// 删除
export const postDeleteUser = (user_id: number) => {
  return service.post({ url: '/sys/delete/user', data: { user_id } })
}
