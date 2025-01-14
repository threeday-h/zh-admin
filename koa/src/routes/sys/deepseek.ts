import Router from "koa-router"
import OpenAI from "openai"

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface DictType {
  content: any
}

// 创建路由实例
const router = new Router({
  prefix: "/api/sys"
})

// 创建 OpenAI 实例
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: "sk-0742e004e6934cd1be82a9a98f175dd1"
})

router.post("/chat", async ctx => {
  try {
    const body = (ctx.request as any).body as DictType
    const { content } = body
    console.log("收到用户请求:", content)

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: content }
    ]

    console.log("准备发送到 DeepSeek 的消息:", messages)

    const completion = await openai.chat.completions.create({
      messages,
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 2000
    })

    console.log("DeepSeek 响应:", completion)

    ctx.body = {
      success: true,
      data: completion.choices[0].message
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
