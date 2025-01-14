import Router from "koa-router"
import axios from "axios"
import { Context } from "koa"

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface ChatRequest {
  messages?: ChatMessage[]
}

interface DictType {
  content: any
}

// 创建路由实例
const router = new Router({
  prefix: "/api/sys"
})

// 创建 axios 实例
const deepseekAPI = axios.create({
  baseURL: "https://api.deepseek.com/v1",
  headers: {
    Authorization: `Bearer sk-0742e004e6934cd1be82a9a98f175dd1`,
    "Content-Type": "application/json"
  }
})

router.post("/chat", async ctx => {
  try {
    const body = (ctx.request as any).body as DictType
    const { content } = body
    console.log("收到用户请求:", content)

    const messages = [{ role: "user", content: content }]

    console.log("准备发送到 DeepSeek 的消息:", messages)

    const response = await deepseekAPI.post("/chat/completions", {
      messages,
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 2000
    })

    console.log("DeepSeek 响应:", response.data)

    ctx.body = {
      success: true,
      data: response.data.choices[0].message
    }
  } catch (error) {
    console.error("DeepSeek API 错误:", error)
    ctx.status = 500
    ctx.body = {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    }
  }
})

module.exports = router
