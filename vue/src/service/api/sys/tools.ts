import { service } from '@/service/index'

// 上传
export const upload = (file: File) => {
  let formData = new FormData()
  formData.append('file', file)
  return service.post<{ size: number; newFilename: string; originalFilename: string; filePath: string }>({ url: '/upload', data: formData })
}

// 获取字典键值
export const getDict = () => {
  return service.get<Record<string, any>>({ url: '/dict' })
}
