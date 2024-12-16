import type { AxiosRequestConfig } from 'axios'

export interface requestInterceptors {
  requestInterceptors?: (config: any) => any
  requestInterceptorsCatch?: (error: any) => any

  responseInterceptors?: (res: any) => any
  responseInterceptorsCatch?: (error: any) => any
}

export interface requestConfig extends AxiosRequestConfig {
  interceptors?: requestInterceptors
}
