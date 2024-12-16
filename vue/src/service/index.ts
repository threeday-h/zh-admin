import cookieTools from '@/utils/cookie'
import Request from './request/index'

export const service = new Request({
  timeout: 5000,
  baseURL: import.meta.env.VITE_APP_BASE_API,
  withCredentials: true,
  interceptors: {
    requestInterceptors: (config) => {
      const token = cookieTools.getCookie('token')
      if (token) {
        config.headers['Authorization'] = `Bearer ${token ?? ''}`
      } else {
        delete config.headers['Authorization']
      }
      return config
    },
    requestInterceptorsCatch: (err) => {
      return err
    },
    responseInterceptors: (res) => {
      const { code, msg } = res.data

      if (code == 401) {
        ElMessage({ message: '登录已过期', type: 'info' })
        setTimeout(() => {
          localStorage.clear()
          cookieTools.clearAllCookies()
          sessionStorage.removeItem('routerTags')
          window.location.href = '/login'
        }, 500)
        return
      }

      return res
    },
    responseInterceptorsCatch: (err) => {
      return err
    }
  }
})
