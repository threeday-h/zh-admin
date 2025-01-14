import { service } from "@/service/index"

// 新增字典类型
export const chatDeepseek = (data: dictType) => {
  return service.post({ url: "/sys/chat", data })
}
