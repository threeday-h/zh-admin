import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { requestConfig, requestInterceptors } from '../typing/request'

axios.defaults.withCredentials = true

interface HttpResponse<T = any> {
  data: T
  code: number
  msg: string
}

class Request {
  instance: AxiosInstance
  interceptors?: requestInterceptors

  constructor(config: requestConfig) {
    // 创建 axios 实例
    this.instance = axios.create(config)

    // 保存基本信息
    this.interceptors = config.interceptors

    // 从 config 中取出拦截器是对应的实例拦截器
    this.instance.interceptors.request.use(this.interceptors?.requestInterceptors, this.interceptors?.requestInterceptorsCatch)
    this.instance.interceptors.response.use(this.interceptors?.responseInterceptors, this.interceptors?.responseInterceptorsCatch)

    // 添加所有实例都有的拦截器
    this.instance.interceptors.request.use(
      (config) => {
        return config
      },
      (err) => {
        return err
      }
    )
    this.instance.interceptors.response.use(
      (res: any) => {
        return res.data
      },
      (err) => {
        return err
      }
    )
  }

  requset<T>(config: requestConfig): Promise<HttpResponse<T>> {
    return new Promise((resolve, reject) => {
      // 单个请求对请求config的处理
      if (config.interceptors?.requestInterceptors) {
        config = config.interceptors.requestInterceptors(config)
      }

      this.instance
        .request<any, T>(config)
        .then((res) => {
          // 单个请求对数据的处理
          if (config.interceptors?.responseInterceptors) {
            res = config.interceptors.responseInterceptors(res)
          }

          resolve(res as HttpResponse<T>)
        })
        .catch((err) => {
          reject(err)
          return err
        })
    })
  }

  get<T>(config: requestConfig): Promise<HttpResponse<T>> {
    return this.requset<T>({ ...config, method: 'GET' })
  }

  post<T>(config: requestConfig): Promise<HttpResponse<T>> {
    return this.requset<T>({ ...config, method: 'POST' })
  }

  delete<T>(config: requestConfig): Promise<HttpResponse<T>> {
    return this.requset<T>({ ...config, method: 'DELETE' })
  }

  patch<T>(config: requestConfig): Promise<HttpResponse<T>> {
    return this.requset<T>({ ...config, method: 'patch' })
  }

  put<T>(config: requestConfig): Promise<HttpResponse<T>> {
    return this.requset<T>({ ...config, method: 'PUT' })
  }
}

export default Request
